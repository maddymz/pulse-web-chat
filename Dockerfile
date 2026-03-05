# ── Stage 1: Build React client ───────────────────────────────────────────────
FROM node:20-alpine AS client-build
WORKDIR /build
COPY client/package*.json ./
RUN npm ci --quiet
COPY client/ ./
RUN npm run build

# ── Stage 2: Python server ────────────────────────────────────────────────────
FROM python:3.12-slim
WORKDIR /app

# Install Python dependencies
COPY server/pyproject.toml ./
RUN pip install --no-cache-dir \
    fastapi>=0.111.0 \
    "python-socketio>=5.11.3" \
    "uvicorn[standard]>=0.30.1" \
    "pydantic>=2.7.3" \
    "aiofiles>=25.1.0"

# Copy server source
COPY server/src ./src

# Copy built React app from stage 1
COPY --from=client-build /build/dist ./client/dist

EXPOSE 10000

ENV STATIC_DIR=/app/client/dist

CMD ["sh", "-c", "uvicorn src.main:socket_app --host 0.0.0.0 --port ${PORT:-10000}"]
