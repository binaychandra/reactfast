# -------- Stage 1: Build frontend (Vite + React) --------
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

# Install deps first (better layer caching)
COPY frontend/package*.json ./
COPY frontend/tsconfig.json frontend/vite.config.* frontend/index.html ./
RUN npm install

# Copy source and build
COPY frontend/src ./src
RUN npm run build

# -------- Stage 2: Backend runtime (FastAPI + Uvicorn) --------
FROM python:3.12-slim AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend ./backend

# Copy built frontend into expected path (/app/frontend/dist)
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8000

# Default command
CMD ["python", "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
