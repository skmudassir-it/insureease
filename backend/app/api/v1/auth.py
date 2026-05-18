from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.api.deps import get_current_user
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.get("/health")
async def health():
    return {"status": "ok", "service": "insureease-api", "version": "1.0.0"}

@router.post("/register")
async def register(req: RegisterRequest, db=Depends(get_db)):
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "name": req.name,
        "email": req.email,
        "hashed_password": hash_password(req.password),
        "role": "agent",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(user)
    user["_id"] = str(result.inserted_id)
    access = create_access_token(str(result.inserted_id), "agent")
    refresh = create_refresh_token(str(result.inserted_id))
    return {"user": {"id": user["_id"], "name": user["name"], "email": user["email"], "role": user["role"]}, "access_token": access, "refresh_token": refresh}

@router.post("/login")
async def login(req: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    uid = str(user["_id"])
    access = create_access_token(uid, user.get("role", "agent"))
    refresh = create_refresh_token(uid)
    return {"user": {"id": uid, "name": user["name"], "email": user["email"], "role": user.get("role")}, "access_token": access, "refresh_token": refresh}

@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return {"id": str(current_user["_id"]), "name": current_user["name"], "email": current_user["email"], "role": current_user.get("role", "agent")}
