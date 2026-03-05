# Pulse Web Chat — Implementation Plan

## Context

Real-time group chat platform for friends. Python chosen for the backend over Node.js because the roadmap includes an AI agent integration — Python's ecosystem (Anthropic SDK, LangChain, etc.) is the clear winner for that use case. The frontend stays React/TypeScript; only the server changes.

---

## Protocol Decision

| Protocol | Transport | Verdict |
|---|---|---|
| Raw UDP | UDP | ❌ Not available in browsers |
| **WebSockets (Socket.IO)** | TCP | ✅ **Use this** |
| WebRTC Data Channels | SCTP/UDP | ⚠️ Overkill for text chat |
| HTTP/3 / QUIC | UDP | 🔮 Future consideration |
| Server-Sent Events | TCP | ❌ One-way only |

---

## Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS (dark mode via `class` strategy)
- Socket.IO client (`socket.io-client`)
- Zustand (state management + localStorage persistence)

### Backend
- **Python** + FastAPI + `python-socketio` (async)
- `uvicorn` as ASGI server
- `uv` as package manager
- `pydantic` for data models

### Future AI Layer (ready to add)
- `anthropic` SDK — Claude agent participates in chat rooms
- Triggered by `@pulse` mention or a dedicated `#ai` room

### Tooling
- `concurrently` at root — `npm run dev` starts both client (:5173) and server (:3001)

---

## Project Structure

```
pulse-web-chat/
├── docs/PLAN.md
├── package.json                  # root: concurrently dev script
├── client/                       # Vite React app (TypeScript)
│   ├── package.json
│   ├── vite.config.ts            # proxy /socket.io → localhost:3001 (ws:true)
│   ├── tailwind.config.ts        # darkMode: 'class', brand violet-600
│   └── src/
│       ├── types/index.ts        # User, Message, Room interfaces
│       ├── types/events.ts       # SocketEvents const object
│       ├── lib/socket.ts         # socket.io-client singleton
│       ├── lib/utils.ts          # usernameToColor() deterministic hash
│       ├── store/
│       │   ├── useAuthStore.ts
│       │   ├── useChatStore.ts
│       │   └── useUIStore.ts     # darkMode persisted to localStorage
│       ├── hooks/
│       │   ├── useSocket.ts      # registers all server→client listeners
│       │   └── useTheme.ts       # applies 'dark' class to <html>
│       └── components/
│           ├── LoginScreen.tsx
│           ├── ChatLayout.tsx
│           ├── Sidebar/          # Sidebar, RoomList, RoomItem, OnlineUsers, UserAvatar
│           ├── Chat/             # ChatPanel, ChatHeader, MessageList, MessageBubble,
│           │                     #   TypingIndicator, MessageInput
│           └── UI/               # ThemeToggle, Modal, CreateRoomModal
│
└── server/                       # Python backend
    ├── pyproject.toml            # uv-managed deps
    ├── .python-version           # e.g. 3.12
    └── src/
        ├── main.py               # FastAPI app + Socket.IO ASGI mount + uvicorn entry
        ├── config.py             # PORT=3001, MAX_HISTORY=100, limits
        ├── events.py             # SocketEvents constants (mirrors client)
        ├── models.py             # Pydantic models: User, Message, Room + payloads
        ├── utils.py              # username_to_color() — same algorithm as client
        ├── store/
        │   └── room_store.py     # in-memory dicts: online_users, rooms, message_history
        ├── socket/
        │   ├── __init__.py
        │   └── handlers.py       # handle_join, handle_send_message, etc.
        └── routes/
            └── health.py         # GET /api/health
```

---

## Socket Event Contract

Identical on both sides. Client has `types/events.ts`, server has `events.py`.

```
Client → Server:
  join              { username }
  create_room       { name }
  join_room         { roomId }
  leave_room        { roomId }
  send_message      { roomId, text }
  typing            { roomId, isTyping }

Server → Client (individual):
  join_ack          { user, rooms[], onlineUsers[] }
  room_joined       { room, history[] }
  error             { code, message }

Server → Client (broadcast):
  room_created      { room }
  new_message       { message }
  user_joined       { user }
  user_left         { userId, username }
  typing_update     { roomId, userId, username, isTyping }
  room_users_update { roomId, memberIds }
```

---

## Key Data Models

### TypeScript (client — `src/types/index.ts`)
```typescript
interface User    { id: string; username: string; avatarColor: string }
interface Message { id: string; roomId: string; senderId: string; senderName: string; avatarColor: string; text: string; timestamp: number }
interface Room    { id: string; name: string; createdBy: string; memberIds: string[] }
```

### Python (server — `src/models.py`)
```python
class User(BaseModel):
    id: str         # sid from python-socketio
    username: str
    avatar_color: str

class Message(BaseModel):
    id: str         # uuid4
    room_id: str
    sender_id: str
    sender_name: str
    avatar_color: str
    text: str
    timestamp: int  # Unix ms

class Room(BaseModel):
    id: str
    name: str
    created_by: str
    member_ids: list[str]
```

Note: JSON going over the wire uses camelCase (configured via `model_config = ConfigDict(populate_by_name=True)`).

---

## Server Architecture (`server/src/`)

### `main.py`
```python
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
app.include_router(health_router, prefix='/api')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
register_handlers(sio)
# uvicorn.run("src.main:socket_app", port=3001, reload=True)
```

### `store/room_store.py`
- `online_users: dict[str, User]` — keyed by socket sid
- `rooms: dict[str, Room]` — pre-seeded with `general` and `random`
- `message_history: dict[str, list[Message]]` — capped at MAX_HISTORY
- `typing_tasks: dict[str, asyncio.Task]` — `"{sid}:{room_id}"` → auto-clear timer

### `socket/handlers.py`
```
handle_join(sid, data)       → validates username, stores User, emits join_ack, broadcasts user_joined
handle_create_room(sid, data) → creates Room, broadcasts room_created to all
handle_join_room(sid, data)  → sio.enter_room, updates memberIds, emits room_joined with history
handle_leave_room(sid, data) → sio.leave_room, updates memberIds
handle_send_message(sid, data) → validates, builds Message, saves to history, emits new_message to room
handle_typing(sid, data)     → emits typing_update to room (excluding sender); server timer auto-clears after 3s
handle_disconnect(sid)       → cleans up all rooms, broadcasts user_left + room_users_update
```

---

## Root Dev Script

```json
// package.json
{
  "scripts": {
    "dev": "concurrently \"cd client && npm run dev\" \"cd server && uv run uvicorn src.main:socket_app --reload --port 3001\""
  }
}
```

---

## Setup Commands

```bash
# Root
npm init -y && npm install --save-dev concurrently

# Client
npm create vite@latest client -- --template react-ts
cd client && npm install
npm install socket.io-client zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p --ts
cd ..

# Server (Python with uv)
cd server
uv init
uv add fastapi "python-socketio[asyncio_client]" uvicorn pydantic
uv add --dev ruff   # linter (optional)
cd ..

# Run everything
npm run dev
```

---

## Future AI Agent Integration (planned)

```bash
cd server && uv add anthropic
```

```python
# server/src/agent.py
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def get_agent_reply(room_history: list[Message]) -> str:
    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system="You are Pulse, a friendly AI assistant in a group chat.",
        messages=[{"role": "user", "content": m.text} for m in room_history[-10:]]
    )
    return response.content[0].text
```

Trigger: any message starting with `@pulse` in any room, or all messages in a dedicated `#ai` room.

---

## Verification Checklist

1. `curl http://localhost:3001/api/health` → `{"status":"ok","rooms":2,"onlineUsers":0}`
2. Open `:5173`, login as "Alice" → sidebar shows `#general` + `#random`
3. Alice joins `#general`, sends "hello" → bubble right-aligned
4. Open second tab, login as "Bob" → both tabs show 2 users online
5. Bob joins `#general` → sees "hello" in history
6. Alice types → Bob sees "Alice is typing..."
7. Alice sends → message in both tabs instantly
8. Alice creates room "gaming" → both tabs see it in sidebar
9. Close Bob's tab → Alice's online list drops to 1
10. Dark mode toggle → persists on refresh
