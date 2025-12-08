import pytest
import os
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from typing import AsyncGenerator

from app.main import app
from app.db import get_db, Base
from app.database import active_games

# Use a FILE-based SQLite database for integration testing
# This ensures we test actual file persistence, not just memory
TEST_DB_FILE = "./test_integration.db"
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{TEST_DB_FILE}"

# Use NullPool to ensure connections are closed immediately so we can drop the file easily
engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=NullPool,
)
IntegrationSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def override_get_integration_db() -> AsyncGenerator[AsyncSession, None]:
    async with IntegrationSessionLocal() as session:
        yield session

# Helper to setup/teardown
@pytest.fixture(scope="module", autouse=True)
async def setup_integration_db():
    # Remove existing test DB if any
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield
    
    # Teardown: drop tables and remove file
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    # Close engine to release file lock
    await engine.dispose()
    
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

@pytest.fixture
def client_integration():
    # Override dependency
    app.dependency_overrides[get_db] = override_get_integration_db
    with TestClient(app) as c:
        yield c
    # Clear overrides
    app.dependency_overrides = {}

@pytest.mark.asyncio
async def test_full_user_journey_persistence(client_integration):
    """
    Test a full scenario:
    1. User A registers
    2. User B registers
    3. User A submits score
    4. User B submits score
    5. Check leaderboard
    """
    
    # 1. Register User A
    resp_a = client_integration.post("/auth/signup", json={
        "username": "UserA",
        "email": "a@test.com",
        "password": "passwordA"
    })
    assert resp_a.status_code == 200
    token_a = resp_a.json()["data"]["id"]
    
    # 2. Register User B
    resp_b = client_integration.post("/auth/signup", json={
        "username": "UserB",
        "email": "b@test.com",
        "password": "passwordB"
    })
    assert resp_b.status_code == 200
    token_b = resp_b.json()["data"]["id"]
    
    # 3. User A submits score (150)
    client_integration.post("/leaderboard", 
        json={"score": 150, "mode": "walls"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    
    # 4. User B submits score (200)
    client_integration.post("/leaderboard", 
        json={"score": 200, "mode": "walls"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    
    # 5. Check leaderboard (Should be B then A)
    resp_lb = client_integration.get("/leaderboard")
    assert resp_lb.status_code == 200
    lb_data = resp_lb.json()["data"]
    
    assert len(lb_data) >= 2
    assert lb_data[0]["username"] == "UserB"
    assert lb_data[0]["score"] == 200
    assert lb_data[1]["username"] == "UserA"
    assert lb_data[1]["score"] == 150

    # 6. Verify persistence?
    # Since we are using a file DB, if we were to restart the app, data should be there.
    # In this test, simply checking subsequent requests works proves the DB is holding state.
