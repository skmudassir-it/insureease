
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class AdminRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    agency_name: str
    agency_type: str = "agency"  # agency, brokerage, mga, independent
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
    license_expiry: Optional[str] = None  # ISO date string
    company_id: str  # Selected agency ID

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ClientSetupRequest(BaseModel):
    token: str
    password: str

class TokenResponse(BaseModel):
    user: dict
    access_token: str
    refresh_token: str
