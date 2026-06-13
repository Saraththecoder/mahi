from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.db import connect_to_mongo, close_mongo_connection
from app.routes import (
    disease,
    voice,
    weather,
    fertilizer,
    pesticide,
    chatbot,
    health,
    schemes,
    centers
)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend services for Smart Agriculture AI Assistant",
    version="1.0.0"
)

# CORS configuration
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins_list = [origin.strip() for origin in frontend_url.split(",")]
    allowed_origins.extend(origins_list)
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if allowed_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown connection handlers
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include feature-specific API routers
app.include_router(disease.router, prefix=settings.API_V1_STR)
app.include_router(voice.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(fertilizer.router, prefix=settings.API_V1_STR)
app.include_router(pesticide.router, prefix=settings.API_V1_STR)
app.include_router(chatbot.router, prefix=settings.API_V1_STR)
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(centers.router, prefix=settings.API_V1_STR)

# Ensure static directories exist and mount upload static folder
uploads_dir = os.path.join(settings.BASE_DIR, "static", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=os.path.join(settings.BASE_DIR, "static")), name="static")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the Smart Agriculture AI Assistant API. Access endpoints via /api/v1."
    }
