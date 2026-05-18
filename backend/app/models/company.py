
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from bson import ObjectId

class CompanyInDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    type: Literal["agency", "brokerage", "mga", "independent"] = "agency"
    phone: Optional[str] = None
    address: Optional[dict] = None  # {street, city, state, zip, country}
    tax_id: Optional[str] = None
    logo_url: Optional[str] = None
    is_listed: bool = True
    approval_required: bool = True
    admin_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
