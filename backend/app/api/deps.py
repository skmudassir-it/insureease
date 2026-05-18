"""
Auth dependencies: get_current_user + role guards + data isolation
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from app.core.security import decode_access_token
from app.database import get_db

security = HTTPBearer(auto_error=False)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db=Depends(get_db)):
    """Validate JWT and return user document from MongoDB."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = decode_access_token(credentials.credentials)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    try:
        uid = ObjectId(payload["sub"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await db.users.find_one({"_id": uid})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def require_admin(current_user=Depends(get_current_user)):
    """Require admin role."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def require_agent(current_user=Depends(get_current_user)):
    """Require approved agent role."""
    if current_user.get("role") != "agent":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent access required")
    if not current_user.get("is_approved", False):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Your account is pending approval")
    return current_user


async def require_client(current_user=Depends(get_current_user)):
    """Require client role with activated portal."""
    if current_user.get("role") != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    if not current_user.get("portal_activated_at"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please activate your account via the invite link")
    return current_user
