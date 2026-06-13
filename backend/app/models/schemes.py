from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class GovernmentSchemeBase(BaseModel):
    title: str
    title_translated: Optional[dict] = Field(default=None, description="Translations for 'te' and 'hi'")
    description: str
    description_translated: Optional[dict] = Field(default=None)
    category: str
    eligibility: List[str]
    eligibility_translated: Optional[dict] = Field(default=None)
    benefits: List[str]
    benefits_translated: Optional[dict] = Field(default=None)
    required_documents: List[str]
    required_documents_translated: Optional[dict] = Field(default=None)
    application_process: str
    application_process_translated: Optional[dict] = Field(default=None)
    official_website: str

class GovernmentSchemeDB(GovernmentSchemeBase):
    id: str = Field(alias="_id")
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
