import os
import uvicorn
import socketio
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .socket import register_handlers
from .routes.health import router as health_router
from .config import PORT

# ── Socket.IO async server ────────────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="Pulse Chat Server")
app.include_router(health_router, prefix="/api")

# ── Serve React build in production (when client/dist exists) ─────────────────
# In dev, Vite handles the frontend. In production (Docker/Render), FastAPI
# serves the pre-built static files from client/dist.
_DIST_DIR = os.environ.get(
    "STATIC_DIR",
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "client", "dist"),
)
_DIST_DIR = os.path.normpath(_DIST_DIR)

if os.path.isdir(_DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(_DIST_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(_full_path: str) -> FileResponse:
        return FileResponse(os.path.join(_DIST_DIR, "index.html"))

# ── ASGI app: Socket.IO wraps FastAPI ────────────────────────────────────────
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# ── Register all socket event handlers ───────────────────────────────────────
register_handlers(sio)


if __name__ == "__main__":
    uvicorn.run("src.main:socket_app", host="0.0.0.0", port=PORT, reload=True)
