
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class RenewalRequestInDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    client_id: str
    policy_id: str
    requested_changes: Optional[str] = None
    notes: Optional[str] = None
    status: str = "pending"  # pending, processed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
