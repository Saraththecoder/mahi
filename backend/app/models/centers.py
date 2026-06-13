from pydantic import BaseModel, Field
from typing import Optional

class AgricultureCenterBase(BaseModel):
    name: str
    type: str = Field(..., description="E.g., 'Soil Testing Lab', 'Agriculture Office', 'Seed Distribution Center'")
    address: str
    latitude: float
    longitude: float
    contact_number: Optional[str] = None
    working_hours: Optional[str] = None

class AgricultureCenterDB(AgricultureCenterBase):
    id: str = Field(alias="_id")

    class Config:
        populate_by_name = True
