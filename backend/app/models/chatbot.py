from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message author: 'user' or 'assistant'")
    content: str = Field(..., description="Content of the message")

class ChatSessionBase(BaseModel):
    session_id: str
    user_message: str
    bot_response: str
    language: str = Field(default="en", description="Language of the chat session ('en', 'te', 'hi')")

class ChatSessionDB(ChatSessionBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ChatQueryRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"
