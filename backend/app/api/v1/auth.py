"""
InsureEase Auth API v2 — Multi-role registration & login
Admin: creates agency company | Agent: applies to agency | Client: invite-only
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import secrets

from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.api.deps import get_current_user

router = APIRouter()


# ─── Request Models ───────────────────────────────────────────

class AdminRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    agency_name: str
    agency_type: str = "agency"
    phone: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    address_country: Optional[str] = None

class AgentRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[str] = None
    company_id: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ClientSetupRequest(BaseModel):
    token: str
    password: str


# ─── Health ────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {"status": "ok", "service": "insureease-api", "version": "2.0.0"}


# ─── Agency Listing (for agent signup) ─────────────────────────

@router.get("/agencies")
async def list_agencies(search: str = "", db=Depends(get_db)):
    query = {"is_listed": True}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    agencies = await db.companies.find(query).to_list(20)
    return [{
        "id": str(a["_id"]),
        "name": a["name"],
        "type": a.get("type", "agency"),
        "phone": a.get("phone", ""),
        "address": a.get("address", {}),
    } for a in agencies]


# ─── Admin Registration ────────────────────────────────────────

@router.post("/register/admin")
async def register_admin(req: AdminRegisterRequest, db=Depends(get_db)):
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc)

    # Create user
    user = {
        "name": req.name,
        "email": req.email,
        "hashed_password": hash_password(req.password),
        "role": "admin",
        "is_active": True,
        "is_approved": True,
        "phone": req.phone,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    # Create agency company
    company = {
        "name": req.agency_name,
        "type": req.agency_type,
        "phone": req.phone,
        "address": {
            "street": req.address_street or "",
            "city": req.address_city or "",
            "state": req.address_state or "",
            "zip": req.address_zip or "",
            "country": req.address_country or "",
        } if any([req.address_street, req.address_city]) else {},
        "admin_id": user_id,
        "is_listed": True,
        "approval_required": True,
        "created_at": now,
        "updated_at": now,
    }
    comp_result = await db.companies.insert_one(company)
    company_id = str(comp_result.inserted_id)

    # Link user to company
    await db.users.update_one({"_id": result.inserted_id}, {"$set": {"company_id": comp_result.inserted_id}})

    access = create_access_token(user_id, "admin")
    refresh = create_refresh_token(user_id)

    return {
        "user": {"id": user_id, "name": req.name, "email": req.email, "role": "admin", "company_id": company_id},
        "company": {"id": company_id, "name": req.agency_name, "type": req.agency_type},
        "access_token": access,
        "refresh_token": refresh,
    }


# ─── Agent Registration (Applies to Agency) ────────────────────

@router.post("/register/agent")
async def register_agent(req: AgentRegisterRequest, db=Depends(get_db)):
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate company exists
    try:
        company_oid = ObjectId(req.company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid agency ID")

    company = await db.companies.find_one({"_id": company_oid, "is_listed": True})
    if not company:
        raise HTTPException(status_code=400, detail="Agency not found")

    now = datetime.now(timezone.utc)

    # Parse license expiry
    license_expiry = None
    if req.license_expiry:
        try:
            license_expiry = datetime.fromisoformat(req.license_expiry.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid license expiry date format")

    user = {
        "name": req.name,
        "email": req.email,
        "hashed_password": hash_password(req.password),
        "role": "agent",
        "is_active": True,
        "is_approved": False,
        "company_id": company_oid,
        "phone": req.phone,
        "license_number": req.license_number,
        "license_state": req.license_state,
        "license_expiry": license_expiry,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    return {
        "user": {"id": user_id, "name": req.name, "email": req.email, "role": "agent"},
        "message": f"Application submitted to {company['name']}. Awaiting admin approval.",
        "company_name": company["name"],
        "status": "pending_approval",
    }


# ─── Client Registration (DISABLED — invite-only) ──────────────

@router.post("/register/client")
async def register_client():
    raise HTTPException(
        status_code=400,
        detail="Client accounts are created by your insurance agent. Please contact your agent for portal access."
    )


# ─── Login ─────────────────────────────────────────────────────

@router.post("/login")
async def login(req: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Agent: check approval
    if user.get("role") == "agent":
        if not user.get("is_approved", False):
            company = await db.companies.find_one({"_id": user.get("company_id")})
            company_name = company["name"] if company else "your agency"
            raise HTTPException(
                status_code=403,
                detail=f"Your account is pending approval by {company_name}. You'll receive an email once approved."
            )

    # Client: check portal activated
    if user.get("role") == "client":
        if not user.get("portal_activated_at"):
            raise HTTPException(status_code=403, detail="Please set up your account using the invite link sent by your agent.")

    uid = str(user["_id"])
    access = create_access_token(uid, user.get("role", "agent"))
    refresh = create_refresh_token(uid)

    return {
        "user": {
            "id": uid,
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role"),
            "company_id": str(user["company_id"]) if user.get("company_id") else None,
        },
        "access_token": access,
        "refresh_token": refresh,
    }


# ─── Me ────────────────────────────────────────────────────────

@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    user = current_user
    resp = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "agent"),
    }
    if user.get("company_id"):
        resp["company_id"] = str(user["company_id"])
    if user.get("role") == "client" and user.get("client_id"):
        resp["client_id"] = str(user["client_id"])
    if user.get("is_approved") is not None:
        resp["is_approved"] = user["is_approved"]
    return resp


# ─── Client Setup (from invite link) ───────────────────────────

@router.post("/client-setup")
async def client_setup(req: ClientSetupRequest, db=Depends(get_db)):
    user = await db.users.find_one({
        "portal_invite_token": req.token,
        "portal_invite_expires": {"$gt": datetime.now(timezone.utc)},
        "role": "client",
    })
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired invite link")

    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "hashed_password": hash_password(req.password),
            "portal_activated_at": now,
            "portal_invite_token": None,
            "portal_invite_expires": None,
            "updated_at": now,
        }}
    )

    # Update client record
    if user.get("client_id"):
        await db.clients.update_one(
            {"_id": user["client_id"]},
            {"$set": {"portal_activated_at": now}}
        )

    uid = str(user["_id"])
    access = create_access_token(uid, "client")
    refresh = create_refresh_token(uid)

    return {
        "user": {"id": uid, "name": user["name"], "email": user["email"], "role": "client"},
        "access_token": access,
        "refresh_token": refresh,
        "message": "Account activated! Welcome to your client portal.",
    }
