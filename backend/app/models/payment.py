
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class PaymentInDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    client_id: str
    policy_id: str
    stripe_payment_id: Optional[str] = None
    amount: float
    currency: str = "usd"
    payment_method: Literal["card", "ach", "manual"] = "card"
    card_last4: Optional[str] = None
    status: Literal["pending", "succeeded", "failed", "refunded"] = "pending"
    paid_at: Optional[datetime] = None
    receipt_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
