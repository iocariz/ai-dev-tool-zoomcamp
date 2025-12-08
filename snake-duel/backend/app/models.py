from enum import Enum
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class GameMode(str, Enum):
    WALLS = "walls"
    PASS_THROUGH = "pass-through"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class GameStatus(str, Enum):
    IDLE = "idle"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game-over"

class Position(BaseModel):
    x: float
    y: float

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    createdAt: datetime

class ApiResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    data: Optional[Any] = None

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: float
    mode: GameMode
    createdAt: datetime

class ActivePlayer(BaseModel):
    id: str
    username: str
    score: float
    mode: GameMode
    snake: List[Position]
    food: Optional[Position] = None
    direction: Optional[Direction] = None
    status: GameStatus

# Request Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class ScoreSubmission(BaseModel):
    score: float
    mode: GameMode
    username: Optional[str] = None
