from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid
from datetime import datetime, timezone

from passlib.context import CryptContext

from ..models import ApiResponse, User as UserSchema, LoginRequest, SignupRequest
from ..db import get_db, User as UserModel

router = APIRouter(prefix="/auth", tags=["Auth"])

# Password hashing
# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Mock security scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> UserSchema:
    # Treating token as user_id for simplified mock auth
    result = await db.execute(select(UserModel).where(UserModel.id == token))
    user = result.scalar_one_or_none()
    
    if not user:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        createdAt=user.createdAt
    )


@router.post("/login", response_model=ApiResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserModel).where(UserModel.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user:
         return ApiResponse(success=False, error="Invalid credentials")
    
    # Verify hashed password
    try:
        if not pwd_context.verify(request.password, user.password):
            return ApiResponse(success=False, error="Invalid credentials")
    except Exception:
        # If verify fails (e.g. UnknownHashError or mismatch), check if it's a legacy plain text password
        if user.password == request.password:
            # Upgrade to hashed password
            user.password = pwd_context.hash(request.password)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            return ApiResponse(success=False, error="Invalid credentials")
    
    return ApiResponse(success=True, data=UserSchema(
        id=user.id,
        username=user.username,
        email=user.email,
        createdAt=user.createdAt
    ))

@router.post("/signup", response_model=ApiResponse)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result_email = await db.execute(select(UserModel).where(UserModel.email == request.email))
    if result_email.scalar_one_or_none():
        return ApiResponse(success=False, error="Email already registered")

    # Check if username exists (good practice for DB constraint)
    result_username = await db.execute(select(UserModel).where(UserModel.username == request.username))
    if result_username.scalar_one_or_none():
        return ApiResponse(success=False, error="Username already taken")

    if not request.password:
         return ApiResponse(success=False, error="Password required")
 
    hashed_password = pwd_context.hash(request.password)

    user_id = str(uuid.uuid4())
    new_user = UserModel(
        id=user_id,
        username=request.username,
        email=request.email,
        password=hashed_password,
        createdAt=datetime.now(timezone.utc)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return ApiResponse(success=True, data=UserSchema(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        createdAt=new_user.createdAt
    ))

@router.post("/logout", response_model=ApiResponse)
async def logout():
    return ApiResponse(success=True, data=None)

@router.get("/me", response_model=ApiResponse)
async def get_me(current_user: UserSchema = Depends(get_current_user_from_token)):
    return ApiResponse(success=True, data=current_user)
