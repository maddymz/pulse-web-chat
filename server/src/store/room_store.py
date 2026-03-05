import asyncio
from typing import Optional
from ..models import User, Message, Room
from ..config import MAX_HISTORY

# ── Runtime state ────────────────────────────────────────────────────────────

online_users: dict[str, User] = {}          # sid → User
rooms: dict[str, Room] = {}                 # room_id → Room
message_history: dict[str, list[Message]] = {}  # room_id → [Message]
typing_tasks: dict[str, asyncio.Task] = {}  # "{sid}:{room_id}" → Task

# ── Pre-seed default rooms ────────────────────────────────────────────────────

def _init() -> None:
    defaults = [
        Room(id="general", name="# general", created_by="system"),
        Room(id="random",  name="# random",  created_by="system"),
    ]
    for room in defaults:
        rooms[room.id] = room
        message_history[room.id] = []

_init()

# ── Helper functions ──────────────────────────────────────────────────────────

def get_user(sid: str) -> Optional[User]:
    return online_users.get(sid)


def add_message(room_id: str, message: Message) -> None:
    history = message_history.setdefault(room_id, [])
    history.append(message)
    if len(history) > MAX_HISTORY:
        message_history[room_id] = history[-MAX_HISTORY:]


def get_history(room_id: str) -> list[Message]:
    return message_history.get(room_id, [])


def add_user_to_room(room_id: str, user_id: str) -> None:
    room = rooms.get(room_id)
    if room and user_id not in room.member_ids:
        room.member_ids.append(user_id)


def remove_user_from_room(room_id: str, user_id: str) -> None:
    room = rooms.get(room_id)
    if room and user_id in room.member_ids:
        room.member_ids.remove(user_id)


def get_rooms_for_user(user_id: str) -> list[Room]:
    return [r for r in rooms.values() if user_id in r.member_ids]
