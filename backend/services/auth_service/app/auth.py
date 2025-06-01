from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm
from app import crud, schemas, utils
from app.database import SessionLocal
from app.crud import authenticate_user
import redis
import os
from uuid import uuid4

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
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = str(uuid4())
    redis_client.set(token, user.id, ex=3600)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/authorize", response_model=schemas.User)
async def authorize(token: str, db: AsyncSession = Depends(get_db)):
    user_id = redis_client.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    try:
        user_id = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    user = await crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"id": user.id, "username": user.username}

@router.post("/logout")
async def logout(token: str):
    if redis_client.delete(token):
        return {"detail": "Successfully logged out"}
    raise HTTPException(status_code=400, detail="Invalid token")