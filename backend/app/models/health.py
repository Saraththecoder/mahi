from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class CropHealthRequest(BaseModel):
    crop_type: str
    N: float
    P: float
    K: float
    pH: float
    moisture: float
    temperature: float
    humidity: float
    disease_detected: Optional[str] = None

class CropHealthScoreBase(BaseModel):
    crop_type: str
    health_score: int = Field(..., ge=0, le=100)
    disease_risk: str
    weather_risk: str
    soil_status: str
    recommendations: List[str]

class CropHealthScoreDB(CropHealthScoreBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
