"""
API v1 Router — aggregates all route modules
"""
from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router
from app.api.v1.agents import router as agent_router
from app.api.v1.portal import router as portal_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
api_router.include_router(agent_router, prefix="/agent", tags=["Agent"])
api_router.include_router(portal_router, prefix="/client", tags=["Client Portal"])
