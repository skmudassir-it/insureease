
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import secrets

from app.database import get_db
from app.api.deps import require_agent

router = APIRouter()


# ─── Agent Dashboard ───────────────────────────────────────────

@router.get("/dashboard")
async def agent_dashboard(current_user=Depends(require_agent), db=Depends(get_db)):
    agent_id = current_user["_id"]
    company_id = current_user.get("company_id")

    my_clients = await db.clients.count_documents({"assigned_agent_id": agent_id})

    # My active policies
    my_client_ids = [c["_id"] async for c in db.clients.find({"assigned_agent_id": agent_id}, {"_id": 1})]
    active_policies = await db.policies.count_documents({
        "client_id": {"$in": my_client_ids},
        "status": "active"
    })

    my_tasks = await db.tasks.count_documents({"assigned_to": agent_id, "status": {"$ne": "completed"}})

    # My premium
    pipeline = [
        {"$match": {"client_id": {"$in": my_client_ids}, "status": "active"}},
        {"$group": {"_id": None, "total": {"$sum": "$premium"}}}
    ]
    premium_result = await db.policies.aggregate(pipeline).to_list(1)
    my_premium = premium_result[0]["total"] if premium_result else 0

    # Expiring soon
    now = datetime.now(timezone.utc)
    expiring = await db.policies.count_documents({
        "client_id": {"$in": my_client_ids},
        "status": "active",
        "end_date": {"$lt": now + timedelta(days=30), "$gte": now}
    })

    # Recent notifications
    notifs = await db.notifications.find({"user_id": agent_id, "is_read": False}).sort("created_at", -1).to_list(5)

    return {
        "my_clients": my_clients,
        "active_policies": active_policies,
        "my_tasks": my_tasks,
        "my_premium": round(my_premium, 2),
        "expiring_policies": expiring,
        "recent_notifications": [{
            "id": str(n["_id"]),
            "message": n.get("message"),
            "urgency": n.get("urgency"),
            "created_at": n.get("created_at"),
        } for n in notifs],
    }


# ─── Client CRUD (scoped to agent) ────────────────────────────

class ClientCreate(BaseModel):
    company_name: str
    business_type: Optional[str] = "llc"
    industry: Optional[str] = None
    tax_id: Optional[str] = None
    year_established: Optional[int] = None
    employee_count: Optional[int] = None
    annual_revenue: Optional[float] = None
    contact_name: str
    contact_title: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    address_country: Optional[str] = None
    source: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None


@router.get("/clients")
async def list_my_clients(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user=Depends(require_agent),
    db=Depends(get_db)
):
    agent_id = current_user["_id"]
    query = {"assigned_agent_id": agent_id}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"company_name": {"$regex": search, "$options": "i"}},
            {"contact_name": {"$regex": search, "$options": "i"}},
        ]

    clients = await db.clients.find(query).sort("created_at", -1).to_list(50)
    return [{
        "id": str(c["_id"]),
        "company_name": c.get("company_name"),
        "business_type": c.get("business_type"),
        "industry": c.get("industry"),
        "contact_name": c.get("contact_name"),
        "contact_email": c.get("contact_email"),
        "contact_phone": c.get("contact_phone"),
        "status": c.get("status", "lead"),
        "source": c.get("source"),
        "tags": c.get("tags", []),
        "portal_activated": bool(c.get("portal_activated_at")),
        "created_at": c.get("created_at"),
    } for c in clients]


@router.post("/clients")
async def create_client(req: ClientCreate, current_user=Depends(require_agent), db=Depends(get_db)):
    agent_id = current_user["_id"]
    company_id = current_user.get("company_id")
    now = datetime.now(timezone.utc)

    address = {}
    addr_fields = [("street", req.address_street), ("city", req.address_city),
                   ("state", req.address_state), ("zip", req.address_zip), ("country", req.address_country)]
    for k, v in addr_fields:
        if v:
            address[k] = v

    client = {
        "company_name": req.company_name,
        "business_type": req.business_type,
        "industry": req.industry,
        "tax_id": req.tax_id,
        "year_established": req.year_established,
        "employee_count": req.employee_count,
        "annual_revenue": req.annual_revenue,
        "contact_name": req.contact_name,
        "contact_title": req.contact_title,
        "contact_email": req.contact_email,
        "contact_phone": req.contact_phone,
        "address": address,
        "status": "lead",
        "assigned_agent_id": agent_id,
        "company_id": company_id,
        "source": req.source,
        "tags": req.tags,
        "notes": req.notes,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.clients.insert_one(client)
    return {"id": str(result.inserted_id), "message": "Client created"}


@router.get("/clients/{client_id}")
async def get_client(client_id: str, current_user=Depends(require_agent), db=Depends(get_db)):
    agent_id = current_user["_id"]
    try:
        cid = ObjectId(client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client ID")

    client = await db.clients.find_one({"_id": cid, "assigned_agent_id": agent_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Get policies for this client
    policies = await db.policies.find({"client_id": cid}).to_list(20)

    return {
        "id": str(client["_id"]),
        **{k: v for k, v in client.items() if k != "_id"},
        "assigned_agent_id": str(client["assigned_agent_id"]) if client.get("assigned_agent_id") else None,
        "policies": [{"id": str(p["_id"]), "policy_number": p.get("policy_number"),
                       "type": p.get("type"), "premium": p.get("premium"),
                       "status": p.get("status"), "end_date": p.get("end_date")} for p in policies],
    }


# ─── Portal Invite ────────────────────────────────────────────

@router.post("/clients/{client_id}/invite")
async def send_portal_invite(client_id: str, current_user=Depends(require_agent), db=Depends(get_db)):
    agent_id = current_user["_id"]
    try:
        cid = ObjectId(client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid client ID")

    client = await db.clients.find_one({"_id": cid, "assigned_agent_id": agent_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if not client.get("contact_email"):
        raise HTTPException(status_code=400, detail="Client has no contact email")

    now = datetime.now(timezone.utc)
    token = secrets.token_urlsafe(32)
    expires = now + timedelta(hours=48)

    # Check if client already has a portal user
    existing_user = await db.users.find_one({"client_id": cid, "role": "client"})
    if existing_user:
        # Update existing invite
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": {"portal_invite_token": token, "portal_invite_expires": expires, "updated_at": now}}
        )
    else:
        # Create portal user
        user = {
            "name": client.get("contact_name", client.get("company_name")),
            "email": client["contact_email"],
            "hashed_password": "",  # Set during setup
            "role": "client",
            "is_active": True,
            "client_id": cid,
            "company_id": client.get("company_id"),
            "portal_invite_token": token,
            "portal_invite_expires": expires,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.users.insert_one(user)
        await db.clients.update_one(
            {"_id": cid},
            {"$set": {"portal_invited_at": now, "portal_user_id": result.inserted_id}}
        )

    await db.clients.update_one({"_id": cid}, {"$set": {"portal_invited_at": now}})

    # In production: send email via fastapi-mail
    portal_url = f"http://insureease.207.180.245.89.nip.io/client/setup?token={token}"

    return {
        "message": f"Portal invite sent to {client['contact_email']}",
        "portal_url": portal_url,
        "expires_at": expires.isoformat(),
    }


# ─── Profile ───────────────────────────────────────────────────

@router.get("/profile")
async def agent_profile(current_user=Depends(require_agent)):
    u = current_user
    return {
        "id": str(u["_id"]),
        "name": u["name"],
        "email": u["email"],
        "phone": u.get("phone"),
        "license_number": u.get("license_number"),
        "license_state": u.get("license_state"),
        "license_expiry": u.get("license_expiry"),
        "company_id": str(u["company_id"]) if u.get("company_id") else None,
        "created_at": u.get("created_at"),
    }
