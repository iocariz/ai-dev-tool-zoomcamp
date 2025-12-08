from fastapi import APIRouter, HTTPException
from typing import List

from ..models import ApiResponse, ActivePlayer
from ..database import active_games

router = APIRouter(prefix="/games", tags=["Game"])

@router.get("/active", response_model=ApiResponse)
async def get_active_players():
    # Convert dict values to list
    players = list(active_games.values())
    return ApiResponse(success=True, data=players)

@router.get("/active/{id}", response_model=ApiResponse)
async def get_active_player(id: str):
    player = active_games.get(id)
    if not player:
        return ApiResponse(success=False, error="Player not found")
    return ApiResponse(success=True, data=player)
