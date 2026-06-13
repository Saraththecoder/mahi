from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FertilizerRequest(BaseModel):
    crop_type: str = Field(..., description="Type of the crop (e.g., Rice, Cotton, Maize, Tomato)")
    N: float = Field(..., description="Nitrogen value in soil (mg/kg or ratio)")
    P: float = Field(..., description="Phosphorus value in soil (mg/kg or ratio)")
    K: float = Field(..., description="Potassium value in soil (mg/kg or ratio)")
    pH: float = Field(..., description="Soil pH value (0-14)")
    moisture: float = Field(..., description="Soil moisture level percentage (0-100)")

class FertilizerRecommendationBase(BaseModel):
    crop_type: str
    N: float
    P: float
    K: float
    pH: float
    moisture: float
    recommended_fertilizer: str
    quantity: str = Field(..., description="Recommended quantity per acre, e.g., '50 kg/acre'")
    instructions: str = Field(..., description="Step by step application instructions")

class FertilizerRecommendationDB(FertilizerRecommendationBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
