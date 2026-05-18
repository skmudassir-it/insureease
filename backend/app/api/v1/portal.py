
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId

from app.database import get_db
from app.api.deps import require_client

router = APIRouter()


class ClientProfileUpdate(BaseModel):
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class RenewalRequest(BaseModel):
    requested_changes: Optional[str] = None
    notes: Optional[str] = None


# ─── Dashboard ────────────────────────────────────────────────

@router.get("/dashboard")
async def client_dashboard(current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    if not client_id:
        raise HTTPException(status_code=400, detail="No business profile linked")

    client = await db.clients.find_one({"_id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Business profile not found")

    # Active policies
    policies = await db.policies.find({"client_id": client_id, "status": "active"}).to_list(20)
    now = datetime.now(timezone.utc)

    policy_list = []
    for p in policies:
        days_left = None
        if p.get("end_date"):
            days_left = (p["end_date"] - now).days
        policy_list.append({
            "id": str(p["_id"]),
            "policy_number": p.get("policy_number"),
            "type": p.get("type"),
            "premium": p.get("premium"),
            "coverage_amount": p.get("coverage_amount"),
            "end_date": p["end_date"].isoformat() if p.get("end_date") else None,
            "days_left": days_left,
            "status": p.get("status"),
        })

    # Agent info
    agent = None
    if client.get("assigned_agent_id"):
        agent_doc = await db.users.find_one({"_id": client["assigned_agent_id"]})
        if agent_doc:
            agent = {
                "id": str(agent_doc["_id"]),
                "name": agent_doc["name"],
                "email": agent_doc["email"],
                "phone": agent_doc.get("phone"),
                "license_number": agent_doc.get("license_number"),
                "license_state": agent_doc.get("license_state"),
            }

    return {
        "company_name": client.get("company_name"),
        "policies": policy_list,
        "agent": agent,
        "document_count": sum(len(p.get("document_keys", [])) for p in policies),
    }


# ─── Policies ─────────────────────────────────────────────────

@router.get("/policies")
async def list_policies(current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    policies = await db.policies.find({"client_id": client_id}).to_list(50)
    return [{
        "id": str(p["_id"]),
        "policy_number": p.get("policy_number"),
        "type": p.get("type"),
        "premium": p.get("premium"),
        "coverage_amount": p.get("coverage_amount"),
        "start_date": p.get("start_date"),
        "end_date": p.get("end_date"),
        "status": p.get("status"),
        "document_keys": p.get("document_keys", []),
    } for p in policies]


@router.get("/policies/{policy_id}")
async def get_policy(policy_id: str, current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    try:
        pid = ObjectId(policy_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid policy ID")

    policy = await db.policies.find_one({"_id": pid, "client_id": client_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    return {
        "id": str(policy["_id"]),
        "policy_number": policy.get("policy_number"),
        "type": policy.get("type"),
        "insurer": policy.get("insurer", ""),
        "premium": policy.get("premium"),
        "coverage_amount": policy.get("coverage_amount"),
        "payment_frequency": policy.get("payment_frequency", "annual"),
        "start_date": policy.get("start_date"),
        "end_date": policy.get("end_date"),
        "status": policy.get("status"),
        "document_keys": policy.get("document_keys", []),
        "notes": policy.get("notes", ""),
    }


@router.post("/policies/{policy_id}/renew")
async def request_renewal(policy_id: str, req: RenewalRequest, current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    try:
        pid = ObjectId(policy_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid policy ID")

    policy = await db.policies.find_one({"_id": pid, "client_id": client_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    now = datetime.now(timezone.utc)
    renewal = {
        "client_id": client_id,
        "policy_id": pid,
        "requested_changes": req.requested_changes,
        "notes": req.notes,
        "status": "pending",
        "created_at": now,
    }
    await db.renewal_requests.insert_one(renewal)

    return {"message": "Renewal request submitted. Your agent will review it shortly."}


# ─── Profile ──────────────────────────────────────────────────

@router.get("/profile")
async def client_profile(current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    client = await db.clients.find_one({"_id": client_id})
    if not client:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "company_name": client.get("company_name"),
        "contact_name": client.get("contact_name"),
        "contact_title": client.get("contact_title"),
        "contact_email": client.get("contact_email"),
        "contact_phone": client.get("contact_phone"),
        "address": client.get("address", {}),
    }


@router.put("/profile")
async def update_profile(req: ClientProfileUpdate, current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    updates = {}
    for field in ["contact_name", "contact_title", "contact_email", "contact_phone"]:
        val = getattr(req, field)
        if val is not None:
            updates[field] = val
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        await db.clients.update_one({"_id": client_id}, {"$set": updates})
    return {"message": "Profile updated"}


# ─── Agent Contact ────────────────────────────────────────────

@router.get("/agent")
async def get_agent(current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    client = await db.clients.find_one({"_id": client_id})
    if not client or not client.get("assigned_agent_id"):
        raise HTTPException(status_code=404, detail="No agent assigned")

    agent = await db.users.find_one({"_id": client["assigned_agent_id"]})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    company = None
    if agent.get("company_id"):
        comp = await db.companies.find_one({"_id": agent["company_id"]})
        if comp:
            company = comp.get("name")

    return {
        "name": agent["name"],
        "email": agent["email"],
        "phone": agent.get("phone"),
        "license_number": agent.get("license_number"),
        "license_state": agent.get("license_state"),
        "agency": company,
    }


# ─── Payments ─────────────────────────────────────────────────

@router.get("/payments")
async def payment_history(current_user=Depends(require_client), db=Depends(get_db)):
    client_id = current_user.get("client_id")
    payments = await db.payments.find({"client_id": client_id}).sort("created_at", -1).to_list(50)
    return [{
        "id": str(p["_id"]),
        "policy_id": str(p.get("policy_id")) if p.get("policy_id") else None,
        "stripe_payment_id": p.get("stripe_payment_id"),
        "amount": p.get("amount"),
        "currency": p.get("currency", "usd"),
        "payment_method": p.get("payment_method"),
        "card_last4": p.get("card_last4"),
        "status": p.get("status"),
        "paid_at": p.get("paid_at"),
        "receipt_url": p.get("receipt_url"),
        "created_at": p.get("created_at"),
    } for p in payments]
