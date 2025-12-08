from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .routers import auth, leaderboard, games
from .db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ... (db init)

app = FastAPI(title="Snake Duel API", version="1.0.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(games.router, prefix="/api")

# Serve Static Files (Frontend)
# Try to serve from "static" directory if it exists (in Docker) or "frontend/dist" (local dev layout)
# But for single container, we copy to "static"
STATIC_DIR = "static"
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/assets", StaticFiles(directory=f"{STATIC_DIR}/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If API path not matched above, serving static files or index.html
    # We check if file exists in static dir
    file_path = os.path.join(STATIC_DIR, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise return index.html for SPA routing
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "Snake Duel API (Frontend not built or not found)"}
