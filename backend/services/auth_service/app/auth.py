from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from app import crud, schemas, utils
from app.database import SessionLocal
from app.crud import authenticate_user
import redis
import os
import base64
from uuid import uuid4
from fastapi import Header

router = APIRouter()

redis_client = redis.StrictRedis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=6379,
    decode_responses=True
)

async def get_db():
    async with SessionLocal() as db:
        yield db

@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await crud.get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    new_user = await crud.create_user(db, user.username, user.password)
    return {"id": new_user.id, "username": new_user.username}

@router.post("/login", response_model=schemas.Token)
async def login(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    if not authorization.startswith("Basic "):
        raise HTTPException(status_code=400, detail="Invalid Authorization header format")
    try:
        decoded = base64.b64decode(authorization[6:]).decode("utf-8")
        username, password = decoded.split(":")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Base64 encoding")
    user = await crud.authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = str(uuid4())
    redis_client.set(token, user.id, ex=3600)
    return {"access_token": token, "token_type": "bearer"}
    
    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = await crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"id": user.id, "username": user.username}

@router.get("/get-username/{user_id}", response_model=dict)
async def get_username(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_id(db, user_id)
    if not user:
        return {"username": ""}
    return {"username": user.username}

@router.post("/logout")
async def logout(token: str):
    if redis_client.delete(token):
        return {"detail": "Successfully logged out"}
    raise HTTPException(status_code=400, detail="Invalid token")