# Stage 1: Build Frontend
FROM node:20-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend ./
# Build frontend with relative API path, as it will be served from same origin
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Stage 2: Build Backend & Runtime
FROM python:3.12-slim-bookworm

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy backend dependencies
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy backend source
COPY backend/app ./app
# Copy other backend files if needed (e.g. for alembic, though we use init_db in main for now)
# We need to make sure pythonpath is correct. 
# Our main.py is in app/main.py. We run uvicorn app.main:app.
# So if we copy app folder to /app/app, we are good.

# Copy built frontend assets to static/
COPY --from=frontend-build /app/frontend/dist ./static

# Install the project environment (if needed, but usually we just run with uv run or use venv)
# Re-sync to install project if it was a package, but here it's flat layout mostly.
# We'll just rely on the venv created by uv sync.

ENV PATH="/app/.venv/bin:$PATH"

# Run the application
# Host 0.0.0.0 is crucial for Docker
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
