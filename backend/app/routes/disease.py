from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from datetime import datetime
import uuid
import os
from app.db import get_collection
from app.config import settings
from app.services.ml_disease import predict_disease
from app.models.disease import DiseasePredictionCreate

router = APIRouter(prefix="/disease", tags=["Disease Detection"])

@router.post("/detect")
async def detect_crop_disease(
    file: UploadFile = File(...),
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    # Read file bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read uploaded file: {e}")
        
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Call disease predictor service
    try:
        prediction = predict_disease(contents, file.filename, lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease prediction failed: {str(e)}")
    
    # Save record to MongoDB
    record_id = str(uuid.uuid4())
    
    # Securely write file to static/uploads
    filename_secured = f"{record_id}_{file.filename}"
    uploads_dir = os.path.join(settings.BASE_DIR, "static", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, filename_secured)
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        print(f"Failed to save image file locally: {e}")

    doc = {
        "_id": record_id,
        "crop": prediction["crop"],
        "disease_name": prediction["disease_name"],
        "confidence": prediction["confidence"],
        "symptoms": prediction["symptoms"],
        "treatment": prediction["treatment"],
        "prevention": prediction["prevention"],
        "image_url": f"/static/uploads/{filename_secured}",
        "created_at": datetime.utcnow()
    }
    
    try:
        coll = get_collection("disease_predictions")
        await coll.insert_one(doc)
    except Exception as e:
        # Log error, but proceed to return prediction (so app remains functional if Mongo is down)
        print(f"MongoDB save failed: {e}")
        
    return doc

@router.get("/history")
async def get_prediction_history(limit: int = 20):
    coll = get_collection("disease_predictions")
    history = []
    try:
        cursor = coll.find({}).sort("created_at", -1).limit(limit)
        async for doc in cursor:
            history.append(doc)
    except Exception as e:
        print(f"Error fetching history: {e}")
    return history
