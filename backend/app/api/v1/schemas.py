"""Pydantic v2 schemas for InsureEase CRM v2.0."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


# ──────────────────────────────────────────────
#  Shared address sub-model
# ──────────────────────────────────────────────

class AddressSchema(BaseModel):
    street: str = ""
    city: str = ""
    state: str = ""
    zip: str = ""
    country: str = "US"


# ──────────────────────────────────────────────
#  Auth schemas
# ──────────────────────────────────────────────

class RegisterAdminRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    company_name: str = Field(..., min_length=1, max_length=200)
    company_type: str = "agency"  # agency/brokerage/mga/independent
    phone: str = ""
    address: Optional[AddressSchema] = None


class RegisterAgentRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    company_id: str = Field(..., description="Agency ObjectId the agent is applying to")
    license_number: str = ""
    license_state: str = ""
    license_expiry: Optional[datetime] = None
    phone: str = ""


class AgentApplyRequest(BaseModel):
    """Alias for RegisterAgentRequest — agent applies to an agency."""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    company_id: str = Field(..., description="Agency ObjectId the agent is applying to")
    license_number: str = ""
    license_state: str = ""
    license_expiry: Optional[datetime] = None
    phone: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ClientSetupRequest(BaseModel):
    token: str = Field(..., description="Portal invite token from invite link")
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: Dict[str, Any]


# ──────────────────────────────────────────────
#  Company (Agency) schemas
# ──────────────────────────────────────────────

class CompanyOut(BaseModel):
    id: str
    name: str
    type: str
    phone: str
    address: Optional[AddressSchema] = None
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None
    is_listed: bool = True
    approval_required: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AgencyListItem(BaseModel):
    id: str
    name: str
    type: str
    logo_url: Optional[str] = None


class AgencySettingsUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[AddressSchema] = None
    logo_url: Optional[str] = None
    is_listed: Optional[bool] = None
    approval_required: Optional[bool] = None


# ──────────────────────────────────────────────
#  User schemas
# ──────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_approved: bool = False
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    company_id: Optional[str] = None
    created_at: Optional[datetime] = None


class AgentListItem(BaseModel):
    id: str
    name: str
    email: str
    is_approved: bool
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    created_at: Optional[datetime] = None


class AgentDetail(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_approved: bool
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    company_id: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AgentProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None


# ──────────────────────────────────────────────
#  Client schemas
# ──────────────────────────────────────────────

class ClientCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    business_type: str = "llc"  # llc/corp/partnership/sole_prop/non_profit
    industry: str = ""
    tax_id: str = ""
    year_established: Optional[int] = None
    employee_count: Optional[int] = None
    annual_revenue: Optional[float] = None
    contact_name: str = ""
    contact_title: str = ""
    contact_email: EmailStr = ""
    contact_phone: str = ""
    address: Optional[AddressSchema] = None
    source: str = ""
    tags: List[str] = []
    notes: str = ""


class ClientUpdate(BaseModel):
    company_name: Optional[str] = None
    business_type: Optional[str] = None
    industry: Optional[str] = None
    tax_id: Optional[str] = None
    year_established: Optional[int] = None
    employee_count: Optional[int] = None
    annual_revenue: Optional[float] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[AddressSchema] = None
    source: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class ClientOut(BaseModel):
    id: str
    company_name: str
    business_type: str
    industry: str
    tax_id: Optional[str] = None
    employee_count: Optional[int] = None
    annual_revenue: Optional[float] = None
    contact_name: str
    contact_title: str
    contact_email: str
    contact_phone: str
    address: Optional[AddressSchema] = None
    assigned_agent_id: Optional[str] = None
    source: Optional[str] = None
    tags: List[str] = []
    notes: str = ""
    portal_invited_at: Optional[datetime] = None
    portal_activated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ClientReassignRequest(BaseModel):
    agent_id: str = Field(..., description="New agent's user ObjectId")


class ClientInviteRequest(BaseModel):
    email: EmailStr


class ClientPortalProfileUpdate(BaseModel):
    """Limited fields a client can update via portal."""
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    industry: Optional[str] = None
    employee_count: Optional[int] = None
    annual_revenue: Optional[float] = None


# ──────────────────────────────────────────────
#  Policy schemas
# ──────────────────────────────────────────────

class PolicyCreate(BaseModel):
    client_id: str = Field(..., description="Client ObjectId")
    policy_number: str = Field(..., min_length=1)
    policy_type: str = ""  # auto/home/commercial/life/health/etc
    carrier: str = ""
    premium: float = 0.0
    premium_frequency: str = "annual"  # annual/semi-annual/quarterly/monthly
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    status: str = "active"  # active/expired/cancelled/pending
    coverage_details: Dict[str, Any] = {}
    notes: str = ""


class PolicyUpdate(BaseModel):
    policy_number: Optional[str] = None
    policy_type: Optional[str] = None
    carrier: Optional[str] = None
    premium: Optional[float] = None
    premium_frequency: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    status: Optional[str] = None
    coverage_details: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PolicyOut(BaseModel):
    id: str
    client_id: str
    company_id: Optional[str] = None
    policy_number: str
    policy_type: str
    carrier: str
    premium: float
    premium_frequency: str = "annual"
    effective_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    status: str = "active"
    coverage_details: Dict[str, Any] = {}
    notes: str = ""
    documents: List[Dict[str, Any]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PolicyDocumentCreate(BaseModel):
    filename: str
    s3_key: str
    content_type: str = "application/pdf"
    size: int = 0


# ──────────────────────────────────────────────
#  Task schemas
# ──────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    priority: str = "medium"  # low/medium/high/urgent
    status: str = "todo"  # todo/in_progress/done/cancelled
    due_date: Optional[datetime] = None
    client_id: Optional[str] = None
    policy_id: Optional[str] = None
    assigned_to: Optional[str] = None  # user ObjectId


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[str] = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    status: str
    due_date: Optional[datetime] = None
    client_id: Optional[str] = None
    policy_id: Optional[str] = None
    assigned_to: Optional[str] = None
    created_by: Optional[str] = None
    company_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ──────────────────────────────────────────────
#  Event schemas
# ──────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    event_type: str = "meeting"  # meeting/call/deadline/reminder/other
    start_time: datetime
    end_time: datetime
    client_id: Optional[str] = None
    policy_id: Optional[str] = None
    location: str = ""
    is_all_day: bool = False


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    is_all_day: Optional[bool] = None


class EventOut(BaseModel):
    id: str
    title: str
    description: str
    event_type: str
    start_time: datetime
    end_time: datetime
    client_id: Optional[str] = None
    policy_id: Optional[str] = None
    location: str
    is_all_day: bool
    created_by: Optional[str] = None
    company_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# ──────────────────────────────────────────────
#  Notification schemas
# ──────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str = "info"  # info/warning/success/error
    is_read: bool = False
    link: Optional[str] = None
    created_at: Optional[datetime] = None


# ──────────────────────────────────────────────
#  Dashboard schemas
# ──────────────────────────────────────────────

class AdminDashboardResponse(BaseModel):
    total_clients: int = 0
    total_agents: int = 0
    active_policies: int = 0
    total_premium: float = 0.0
    pending_approvals_count: int = 0
    expiring_soon: int = 0


class AgentDashboardResponse(BaseModel):
    total_clients: int = 0
    active_policies: int = 0
    total_premium: float = 0.0
    open_tasks: int = 0
    upcoming_events: int = 0
    expiring_soon: int = 0


class ClientDashboardResponse(BaseModel):
    company_name: str
    active_policies: int = 0
    expiring_soon: int = 0
    unread_notifications: int = 0
    agent_name: Optional[str] = None
    agent_email: Optional[str] = None
    agent_phone: Optional[str] = None


# ──────────────────────────────────────────────
#  Renewal / Payment schemas
# ──────────────────────────────────────────────

class RenewalRequestCreate(BaseModel):
    requested_changes: Dict[str, Any] = {}
    notes: str = ""


class RenewalRequestOut(BaseModel):
    id: str
    client_id: str
    policy_id: str
    requested_changes: Dict[str, Any] = {}
    notes: str = ""
    status: str = "pending"
    created_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None


class PaymentOut(BaseModel):
    id: str
    client_id: str
    policy_id: Optional[str] = None
    stripe_payment_id: Optional[str] = None
    amount: float
    currency: str = "usd"
    payment_method: str
    card_last4: Optional[str] = None
    status: str
    paid_at: Optional[datetime] = None
    receipt_url: Optional[str] = None
    created_at: Optional[datetime] = None


class ExpiringPolicyItem(BaseModel):
    policy_id: str
    policy_number: str
    policy_type: str
    client_name: str
    client_id: str
    agent_name: Optional[str] = None
    expiration_date: Optional[datetime] = None
    days_remaining: int = 0
    urgency: str = "normal"  # critical/warning/normal


# ──────────────────────────────────────────────
#  Generic paginated response
# ──────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: List[Any] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    pages: int = 0
