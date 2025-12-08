from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime, timezone
import uuid

from ..models import ApiResponse, LeaderboardEntry as LeaderboardEntrySchema, ScoreSubmission, GameMode, User as UserSchema
from ..db import get_db, LeaderboardEntry as LeaderboardEntryModel
from .auth import get_current_user_from_token

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=ApiResponse)
async def get_leaderboard(mode: Optional[GameMode] = None, db: AsyncSession = Depends(get_db)):
    query = select(LeaderboardEntryModel)
    if mode:
        query = query.where(LeaderboardEntryModel.mode == mode)
    
    # Sort by score descending
    query = query.order_by(LeaderboardEntryModel.score.desc())
    
    result = await db.execute(query)
    entries = result.scalars().all()
    
    data = [LeaderboardEntrySchema(
        id=e.id,
        username=e.username,
        score=e.score,
        mode=e.mode,
        createdAt=e.createdAt
    ) for e in entries]
    
    return ApiResponse(success=True, data=data)

@router.post("", response_model=ApiResponse)
async def submit_score(
    submission: ScoreSubmission,
    current_user: UserSchema = Depends(get_current_user_from_token),
    db: AsyncSession = Depends(get_db)
):
    entry = LeaderboardEntryModel(
        id=str(uuid.uuid4()),
        username=current_user.username,
        score=submission.score,
        mode=submission.mode,
        createdAt=datetime.now(timezone.utc)
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    return ApiResponse(success=True, data=LeaderboardEntrySchema(
        id=entry.id,
        username=entry.username,
        score=entry.score,
        mode=entry.mode,
        createdAt=entry.createdAt
    ))
