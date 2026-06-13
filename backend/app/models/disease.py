from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class DiseasePredictionBase(BaseModel):
    crop: str
    disease_name: str
    confidence: float
    symptoms: List[str]
    treatment: List[str]
    prevention: List[str]

class DiseasePredictionCreate(DiseasePredictionBase):
    image_url: Optional[str] = None

class DiseasePredictionDB(DiseasePredictionBase):
    id: str = Field(alias="_id")
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
