import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "Smart Agriculture AI Assistant"
    API_V1_STR: str = "/api/v1"
    
    # Database
    MONGODB_URL: str = Field(default="mongodb://localhost:27017", validation_alias="MONGODB_URL")
    DATABASE_NAME: str = Field(default="smart_agriculture", validation_alias="DATABASE_NAME")
    
    # Weather API (OpenWeatherMap)
    OPENWEATHER_API_KEY: str = Field(default="", validation_alias="OPENWEATHER_API_KEY")
    
    # Folders & Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_DIR: str = os.path.join(BASE_DIR, "models_saved")
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    RAG_DOCS_DIR: str = os.path.join(DATA_DIR, "knowledge")
    CHROMA_DB_DIR: str = os.path.join(DATA_DIR, "chroma")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.RAG_DOCS_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)
