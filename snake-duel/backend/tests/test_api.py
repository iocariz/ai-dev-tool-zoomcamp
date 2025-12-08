import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool
import asyncio
from typing import AsyncGenerator

from app.main import app
from app.db import get_db, Base
from app.database import active_games

# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
async def init_test_db():
    # active_games is still in-memory
    active_games.clear()
    
    # Reset DB connection for each test (or simply recreate tables)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# Tests
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Snake Duel API is running"}

def test_signup_successful():
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "testuser"
    assert "id" in data["data"]

def test_login_successful():
    # First signup
    client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    # Then login
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test@example.com"

def test_get_me_unauthorized():
    response = client.get("/auth/me")
    assert response.status_code == 401

def test_submit_score():
    # Signup to get user
    signup_resp = client.post("/auth/signup", json={
        "username": "player1",
        "email": "p1@example.com",
        "password": "p1"
    })
    user_id = signup_resp.json()["data"]["id"]
    
    # Submit score with token
    response = client.post("/leaderboard", 
        json={"score": 100, "mode": "walls"},
        headers={"Authorization": f"Bearer {user_id}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 100
    assert data["data"]["username"] == "player1"

def test_get_leaderboard():
    # Use the API to insert data as direct DB access requires async context in pytest
    # Or just use the client to setup state
    
    # Signup
    signup_resp = client.post("/auth/signup", json={
        "username": "best",
        "email": "best@example.com",
        "password": "p1"
    })
    user_id = signup_resp.json()["data"]["id"]
    
    # Submit score
    client.post("/leaderboard", 
        json={"score": 500, "mode": "walls"},
        headers={"Authorization": f"Bearer {user_id}"}
    )
    
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    # Might be multiple if tests interfere, but we drop tables.
    assert len(data["data"]) >= 1
    assert data["data"][0]["username"] == "best"
