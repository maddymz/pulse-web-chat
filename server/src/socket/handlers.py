import asyncio
import re
import time
import uuid
from typing import Any

import socketio

from ..events import SocketEvents
from ..models import Message, Room, User
from ..utils import username_to_color
from ..config import MAX_USERNAME_LENGTH, MAX_ROOM_NAME_LENGTH, MAX_MESSAGE_LENGTH
from ..store import room_store


def register_handlers(sio: socketio.AsyncServer) -> None:

    @sio.event
    async def connect(sid: str, environ: dict, auth: Any = None) -> None:
        pass  # Registration happens on the explicit 'join' event

    @sio.event
    async def disconnect(sid: str) -> None:
        await _handle_disconnect(sio, sid)

    @sio.on(SocketEvents.JOIN)
    async def handle_join(sid: str, data: dict) -> None:
        username = (data.get("username") or "").strip()
        if not username or len(username) > MAX_USERNAME_LENGTH:
            await sio.emit(SocketEvents.ERROR, {"code": "INVALID_USERNAME", "message": "Invalid username"}, to=sid)
            return

        user = User(id=sid, username=username, avatar_color=username_to_color(username))
        room_store.online_users[sid] = user

        await sio.emit(
            SocketEvents.JOIN_ACK,
            {
                "user": user.to_dict(),
                "rooms": [r.to_dict() for r in room_store.rooms.values()],
                "onlineUsers": [u.to_dict() for u in room_store.online_users.values()],
            },
            to=sid,
        )
        await sio.emit(SocketEvents.USER_JOINED, {"user": user.to_dict()}, skip_sid=sid)

    @sio.on(SocketEvents.CREATE_ROOM)
    async def handle_create_room(sid: str, data: dict) -> None:
        user = room_store.get_user(sid)
        if not user:
            return

        name = (data.get("name") or "").strip()
        if not name or len(name) > MAX_ROOM_NAME_LENGTH:
            await sio.emit(SocketEvents.ERROR, {"code": "INVALID_ROOM_NAME", "message": "Invalid room name"}, to=sid)
            return

        room_id = re.sub(r"[^a-z0-9_-]", "-", name.lower())[:50]
        if room_id in room_store.rooms:
            room_id = f"{room_id}-{str(uuid.uuid4())[:4]}"

        room = Room(id=room_id, name=f"# {name}", created_by=sid)
        room_store.rooms[room_id] = room
        room_store.message_history[room_id] = []

        await sio.emit(SocketEvents.ROOM_CREATED, {"room": room.to_dict()})

    @sio.on(SocketEvents.JOIN_ROOM)
    async def handle_join_room(sid: str, data: dict) -> None:
        user = room_store.get_user(sid)
        if not user:
            return

        room_id = data.get("roomId")
        room = room_store.rooms.get(room_id)
        if not room:
            await sio.emit(SocketEvents.ERROR, {"code": "ROOM_NOT_FOUND", "message": "Room not found"}, to=sid)
            return

        sio.enter_room(sid, room_id)
        room_store.add_user_to_room(room_id, sid)

        history = room_store.get_history(room_id)
        await sio.emit(
            SocketEvents.ROOM_JOINED,
            {"room": room.to_dict(), "history": [m.to_dict() for m in history]},
            to=sid,
        )
        await sio.emit(
            SocketEvents.ROOM_USERS_UPDATE,
            {"roomId": room_id, "memberIds": room.to_dict()["memberIds"]},
            room=room_id,
        )

    @sio.on(SocketEvents.LEAVE_ROOM)
    async def handle_leave_room(sid: str, data: dict) -> None:
        room_id = data.get("roomId")
        if not room_id:
            return
        sio.leave_room(sid, room_id)
        room_store.remove_user_from_room(room_id, sid)
        room = room_store.rooms.get(room_id)
        if room:
            await sio.emit(
                SocketEvents.ROOM_USERS_UPDATE,
                {"roomId": room_id, "memberIds": room.to_dict()["memberIds"]},
                room=room_id,
            )

    @sio.on(SocketEvents.SEND_MESSAGE)
    async def handle_send_message(sid: str, data: dict) -> None:
        user = room_store.get_user(sid)
        if not user:
            return

        room_id = data.get("roomId")
        text = (data.get("text") or "").strip()

        if not room_id or room_id not in room_store.rooms:
            return
        if not text or len(text) > MAX_MESSAGE_LENGTH:
            return

        message = Message(
            id=str(uuid.uuid4()),
            room_id=room_id,
            sender_id=sid,
            sender_name=user.username,
            avatar_color=user.avatar_color,
            text=text,
            timestamp=int(time.time() * 1000),
        )
        room_store.add_message(room_id, message)

        await sio.emit(SocketEvents.NEW_MESSAGE, {"message": message.to_dict()}, room=room_id)

    @sio.on(SocketEvents.TYPING)
    async def handle_typing(sid: str, data: dict) -> None:
        user = room_store.get_user(sid)
        if not user:
            return

        room_id = data.get("roomId")
        is_typing = bool(data.get("isTyping"))

        if not room_id:
            return

        timer_key = f"{sid}:{room_id}"

        # Cancel any existing auto-clear task
        existing = room_store.typing_tasks.pop(timer_key, None)
        if existing:
            existing.cancel()

        await sio.emit(
            SocketEvents.TYPING_UPDATE,
            {"roomId": room_id, "userId": sid, "username": user.username, "isTyping": is_typing},
            room=room_id,
            skip_sid=sid,
        )

        # Auto-clear after 3 s if user started typing
        if is_typing:
            async def _auto_clear() -> None:
                await asyncio.sleep(3)
                await sio.emit(
                    SocketEvents.TYPING_UPDATE,
                    {"roomId": room_id, "userId": sid, "username": user.username, "isTyping": False},
                    room=room_id,
                    skip_sid=sid,
                )
                room_store.typing_tasks.pop(timer_key, None)

            room_store.typing_tasks[timer_key] = asyncio.create_task(_auto_clear())


async def _handle_disconnect(sio: socketio.AsyncServer, sid: str) -> None:
    user = room_store.online_users.pop(sid, None)
    if not user:
        return

    # Cancel typing auto-clear tasks for this user
    keys = [k for k in room_store.typing_tasks if k.startswith(f"{sid}:")]
    for key in keys:
        task = room_store.typing_tasks.pop(key)
        task.cancel()

    # Remove from all rooms and notify
    for room in room_store.rooms.values():
        if sid in room.member_ids:
            room.member_ids.remove(sid)
            await sio.emit(
                SocketEvents.ROOM_USERS_UPDATE,
                {"roomId": room.id, "memberIds": room.to_dict()["memberIds"]},
                room=room.id,
            )

    await sio.emit(SocketEvents.USER_LEFT, {"userId": sid, "username": user.username})
