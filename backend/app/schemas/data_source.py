from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DataSourceHealthResponse(BaseModel):
    id: int
    source_key: str
    name: str
    category: str
    status: str
    endpoint: Optional[str] = None
    last_ping_at: Optional[datetime] = None
    last_success_at: Optional[datetime] = None
    records_count: int = 0
    details: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True
