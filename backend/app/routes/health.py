from fastapi import APIRouter, Query
from datetime import datetime
import uuid
from app.db import get_collection
from app.models.health import CropHealthRequest
from app.services.health_scorer import calculate_crop_health

router = APIRouter(prefix="/health", tags=["Crop Health Score"])

@router.post("/score")
async def get_health_score(
    req: CropHealthRequest,
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    health = calculate_crop_health(
        crop_type=req.crop_type,
        N=req.N,
        P=req.P,
        K=req.K,
        pH=req.pH,
        moisture=req.moisture,
        temperature=req.temperature,
        humidity=req.humidity,
        disease_detected=req.disease_detected,
        lang=lang
    )
    
    doc = {
        "_id": str(uuid.uuid4()),
        "crop_type": req.crop_type,
        "health_score": health["health_score"],
        "disease_risk": health["disease_risk"],
        "weather_risk": health["weather_risk"],
        "soil_status": health["soil_status"],
        "recommendations": health["recommendations"],
        "created_at": datetime.utcnow()
    }
    
    try:
        coll = get_collection("crop_health_scores")
        await coll.insert_one(doc)
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        
    return doc

@router.get("/history")
async def get_health_history(limit: int = 20):
    coll = get_collection("crop_health_scores")
    history = []
    try:
        cursor = coll.find({}).sort("created_at", -1).limit(limit)
        async for doc in cursor:
            history.append(doc)
    except Exception as e:
        print(f"Error fetching health score history: {e}")
    return history
