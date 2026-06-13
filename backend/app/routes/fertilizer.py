from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import uuid
from app.db import get_collection
from app.models.fertilizer import FertilizerRequest
from app.services.fertilizer_rec import recommend_fertilizer

router = APIRouter(prefix="/fertilizer", tags=["Fertilizer Recommendation"])

@router.post("/recommend")
async def recommend(
    req: FertilizerRequest,
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    recommendation = recommend_fertilizer(
        crop_type=req.crop_type,
        N=req.N,
        P=req.P,
        K=req.K,
        pH=req.pH,
        moisture=req.moisture,
        lang=lang
    )
    
    doc = {
        "_id": str(uuid.uuid4()),
        "crop_type": req.crop_type,
        "N": req.N,
        "P": req.P,
        "K": req.K,
        "pH": req.pH,
        "moisture": req.moisture,
        "recommended_fertilizer": recommendation["recommended_fertilizer"],
        "quantity": recommendation["quantity"],
        "instructions": recommendation["instructions"],
        "created_at": datetime.utcnow()
    }
    
    try:
        coll = get_collection("fertilizer_recommendations")
        await coll.insert_one(doc)
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        
    return doc

@router.get("/history")
async def get_fertilizer_history(limit: int = 20):
    coll = get_collection("fertilizer_recommendations")
    history = []
    try:
        cursor = coll.find({}).sort("created_at", -1).limit(limit)
        async for doc in cursor:
            history.append(doc)
    except Exception as e:
        print(f"Error fetching fertilizer history: {e}")
    return history
