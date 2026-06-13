from fastapi import APIRouter, Query
from datetime import datetime
import uuid
from app.db import get_collection
from app.services.weather_advisor import get_weather_advisory

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])

@router.get("/advisory")
async def get_advisory(
    lat: float = Query(16.3067, description="Latitude (default Guntur)"),
    lon: float = Query(80.4365, description="Longitude (default Guntur)"),
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    advisory = get_weather_advisory(lat, lon, lang)
    
    doc = {
        "_id": str(uuid.uuid4()),
        "lat": lat,
        "lon": lon,
        "temperature": advisory["temperature"],
        "humidity": advisory["humidity"],
        "wind_speed": advisory["wind_speed"],
        "rain_probability": advisory["rain_probability"],
        "spray_suitability": advisory["spray_suitability"],
        "suitability_reason": advisory["suitability_reason"],
        "recommendations": advisory["recommendations"],
        "created_at": datetime.utcnow()
    }
    
    try:
        coll = get_collection("weather_records")
        await coll.insert_one(doc)
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        
    return doc

@router.get("/history")
async def get_weather_history(limit: int = 20):
    coll = get_collection("weather_records")
    history = []
    try:
        cursor = coll.find({}).sort("created_at", -1).limit(limit)
        async for doc in cursor:
            history.append(doc)
    except Exception as e:
        print(f"Error fetching weather history: {e}")
    return history
