import time
from fastapi import APIRouter
from ..store import room_store

router = APIRouter()
_start_time = time.time()


@router.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "uptime": round(time.time() - _start_time, 2),
        "rooms": len(room_store.rooms),
        "onlineUsers": len(room_store.online_users),
    }
