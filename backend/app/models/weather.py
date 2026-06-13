from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class WeatherAdvisoryBase(BaseModel):
    lat: float
    lon: float
    temperature: float
    humidity: float
    wind_speed: float
    rain_probability: float
    spray_suitability: str = Field(..., description="E.g., 'Excellent', 'Good', 'Caution', 'Do Not Spray'")
    suitability_reason: str = Field(..., description="Reason for the recommendation")
    recommendations: List[str]

class WeatherAdvisoryDB(WeatherAdvisoryBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
