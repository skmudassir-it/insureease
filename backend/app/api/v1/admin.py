
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from app.database import get_db
from app.api.deps import require_admin

router = APIRouter()


# ─── Dashboard KPIs ────────────────────────────────────────────

@router.get("/dashboard")
async def admin_dashboard(current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    if not company_id:
        raise HTTPException(status_code=400, detail="No agency associated")

    total_clients = await db.clients.count_documents({"company_id": company_id})
    total_agents = await db.users.count_documents({"company_id": company_id, "role": "agent", "is_approved": True})
    active_policies = await db.policies.count_documents({"company_id": company_id, "status": "active"})
    pending_approvals = await db.users.count_documents({"company_id": company_id, "role": "agent", "is_approved": False})

    # Total premium from active policies
    pipeline = [
        {"$match": {"company_id": company_id, "status": "active"}},
        {"$group": {"_id": None, "total": {"$sum": "$premium"}}}
    ]
    premium_result = await db.policies.aggregate(pipeline).to_list(1)
    total_premium = premium_result[0]["total"] if premium_result else 0

    # Expiring soon
    now = datetime.now(timezone.utc)
    cutoff = now.replace(hour=23, minute=59)  # end of today
    expiring_count = await db.policies.count_documents({
        "company_id": company_id,
        "status": "active",
        "end_date": {"$lt": now + __import__('datetime').timedelta(days=30), "$gte": now}
    })

    return {
        "total_clients": total_clients,
        "total_agents": total_agents,
        "active_policies": active_policies,
        "total_premium": round(total_premium, 2),
        "pending_approvals": pending_approvals,
        "expiring_policies": expiring_count,
    }


# ─── Agent Management ──────────────────────────────────────────

@router.get("/agents")
async def list_agents(
    status: str = "all",
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    company_id = current_user.get("company_id")
    query = {"company_id": company_id, "role": "agent"}

    if status == "pending":
        query["is_approved"] = False
    elif status == "active":
        query["is_approved"] = True

    agents = await db.users.find(query).sort("created_at", -1).to_list(50)

    result = []
    for a in agents:
        client_count = await db.clients.count_documents({"assigned_agent_id": a["_id"]})
        result.append({
            "id": str(a["_id"]),
            "name": a["name"],
            "email": a["email"],
            "phone": a.get("phone"),
            "license_number": a.get("license_number"),
            "license_state": a.get("license_state"),
            "license_expiry": a.get("license_expiry"),
            "is_approved": a.get("is_approved", False),
            "client_count": client_count,
            "created_at": a.get("created_at"),
        })
    return result


@router.get("/agents/{agent_id}")
async def get_agent(agent_id: str, current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    try:
        oid = ObjectId(agent_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid agent ID")

    agent = await db.users.find_one({"_id": oid, "company_id": company_id, "role": "agent"})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    clients = await db.clients.find({"assigned_agent_id": oid}).to_list(100)
    client_count = len(clients)

    return {
        "id": str(agent["_id"]),
        "name": agent["name"],
        "email": agent["email"],
        "phone": agent.get("phone"),
        "license_number": agent.get("license_number"),
        "license_state": agent.get("license_state"),
        "license_expiry": agent.get("license_expiry"),
        "is_approved": agent.get("is_approved", False),
        "is_active": agent.get("is_active", True),
        "client_count": client_count,
        "clients": [{"id": str(c["_id"]), "company_name": c.get("company_name"), "status": c.get("status")} for c in clients],
        "created_at": agent.get("created_at"),
    }


@router.post("/agents/{agent_id}/approve")
async def approve_agent(agent_id: str, current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    try:
        oid = ObjectId(agent_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid agent ID")

    result = await db.users.update_one(
        {"_id": oid, "company_id": company_id, "role": "agent"},
        {"$set": {"is_approved": True, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent approved successfully"}


@router.post("/agents/{agent_id}/reject")
async def reject_agent(agent_id: str, current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    try:
        oid = ObjectId(agent_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid agent ID")

    result = await db.users.update_one(
        {"_id": oid, "company_id": company_id, "role": "agent"},
        {"$set": {"is_active": False, "is_approved": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent rejected"}


@router.put("/agents/{agent_id}/deactivate")
async def deactivate_agent(agent_id: str, current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    try:
        oid = ObjectId(agent_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid agent ID")

    result = await db.users.update_one(
        {"_id": oid, "company_id": company_id, "role": "agent"},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"message": "Agent deactivated"}


# ─── Client Management (Agency-wide) ───────────────────────────

@router.get("/clients")
async def list_clients(
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user=Depends(require_admin),
    db=Depends(get_db)
):
    company_id = current_user.get("company_id")
    query = {"company_id": company_id}

    if agent_id:
        try:
            query["assigned_agent_id"] = ObjectId(agent_id)
        except Exception:
            pass
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
        "status": c.get("status", "lead"),
        "assigned_agent_id": str(c["assigned_agent_id"]) if c.get("assigned_agent_id") else None,
        "portal_activated": bool(c.get("portal_activated_at")),
        "tags": c.get("tags", []),
        "created_at": c.get("created_at"),
    } for c in clients]


@router.put("/clients/{client_id}/reassign")
async def reassign_client(client_id: str, agent_id: str = Query(...), current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    try:
        cid = ObjectId(client_id)
        aid = ObjectId(agent_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")

    agent = await db.users.find_one({"_id": aid, "company_id": company_id, "role": "agent", "is_approved": True})
    if not agent:
        raise HTTPException(status_code=400, detail="Target agent not found or not approved")

    result = await db.clients.update_one(
        {"_id": cid, "company_id": company_id},
        {"$set": {"assigned_agent_id": aid, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": f"Client reassigned to {agent['name']}"}


# ─── Renewals ──────────────────────────────────────────────────

@router.get("/renewals")
async def admin_renewals(current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")
    now = datetime.now(timezone.utc)

    policies = await db.policies.find({
        "company_id": company_id,
        "status": "active",
        "end_date": {"$lt": now + __import__('datetime').timedelta(days=30), "$gte": now}
    }).to_list(200)

    result = {"critical": [], "warning": [], "info": []}
    for p in policies:
        days_left = (p["end_date"] - now).days
        client = await db.clients.find_one({"_id": p.get("client_id")})
        item = {
            "policy_id": str(p["_id"]),
            "policy_number": p.get("policy_number"),
            "type": p.get("type"),
            "premium": p.get("premium"),
            "end_date": p["end_date"].isoformat() if p.get("end_date") else None,
            "days_left": days_left,
            "client_name": client.get("company_name") if client else "Unknown",
            "client_id": str(p.get("client_id")) if p.get("client_id") else None,
            "agent_id": str(client.get("assigned_agent_id")) if client and client.get("assigned_agent_id") else None,
        }
        if days_left <= 7:
            result["critical"].append(item)
        elif days_left <= 15:
            result["warning"].append(item)
        else:
            result["info"].append(item)

    return result


# ─── Analytics ─────────────────────────────────────────────────

@router.get("/analytics")
async def admin_analytics(current_user=Depends(require_admin), db=Depends(get_db)):
    company_id = current_user.get("company_id")

    # Client status breakdown
    client_pipeline = [
        {"$match": {"company_id": company_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    client_status = {r["_id"]: r["count"] for r in await db.clients.aggregate(client_pipeline).to_list(10)}

    # Policy type breakdown
    policy_pipeline = [
        {"$match": {"company_id": company_id}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    policy_types = {r["_id"]: r["count"] for r in await db.policies.aggregate(policy_pipeline).to_list(20)}

    # Agent performance
    agents = await db.users.find({"company_id": company_id, "role": "agent", "is_approved": True}).to_list(50)
    agent_perf = []
    for a in agents:
        aid = a["_id"]
        client_count = await db.clients.count_documents({"assigned_agent_id": aid})
        task_total = await db.tasks.count_documents({"assigned_to": aid})
        task_done = await db.tasks.count_documents({"assigned_to": aid, "status": "completed"})
        policy_count = await db.policies.count_documents({"agent_id": aid})
        agent_perf.append({
            "id": str(aid),
            "name": a["name"],
            "clients": client_count,
            "tasks_done": task_done,
            "tasks_total": task_total,
            "completion_pct": round((task_done / task_total * 100) if task_total else 0),
            "policies": policy_count,
        })

    return {
        "client_status": client_status,
        "policy_types": policy_types,
        "agent_performance": agent_perf,
    }
