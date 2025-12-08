import os
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy import String, Float, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncAttrs

from .models import GameMode

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./snake.db")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(AsyncAttrs, DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    # Storing plain password for now as per previous mock (should be hashed in real app)
    # But since I'm migrating exact logic: "password" was not in the User model in models.py BUT it was in the signup flow
    # mockUsers stored {password, ...User}
    # So I need to add password field here.
    password: Mapped[str] = mapped_column(String) 
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    username: Mapped[str] = mapped_column(String, index=True)
    score: Mapped[float] = mapped_column(Float)
    mode: Mapped[GameMode] = mapped_column(SQLEnum(GameMode))
    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
