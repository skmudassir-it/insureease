
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class ClientCreateRequest(BaseModel):
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

class ClientUpdateRequest(BaseModel):
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None
    address_country: Optional[str] = None

class PortalInviteRequest(BaseModel):
    contact_email: EmailStr
    contact_name: str

class RenewalRequest(BaseModel):
    requested_changes: Optional[str] = None
    notes: Optional[str] = None
