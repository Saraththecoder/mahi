from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class PesticideRequest(BaseModel):
    crop: str = Field(..., description="Name of the crop")
    disease: str = Field(..., description="Name of the disease or pest")
    area: float = Field(..., description="Farm area in acres")

class PesticideCalculationBase(BaseModel):
    crop: str
    disease: str
    area: float
    pesticide_name: str
    pesticide_quantity: str = Field(..., description="Calculated quantity of pesticide (e.g., '500 ml')")
    water_quantity: str = Field(..., description="Calculated quantity of water for dilution (e.g., '200 Litres')")
    frequency: str = Field(..., description="Application frequency, e.g., 'Once every 10 days'")
    safety_instructions: str = Field(..., description="Safety precautions during spraying")

class PesticideCalculationDB(PesticideCalculationBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
