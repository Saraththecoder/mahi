from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from pydantic import BaseModel
import base64
import uuid
from datetime import datetime
from app.db import get_collection
from app.services.voice_processing import process_voice_query, generate_speech

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


@router.post("/tts")
async def text_to_speech(body: TTSRequest):
    """Synthesize text directly to speech (no STT step). Used for typed queries."""
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    speech_bytes = generate_speech(body.text, body.language)
    return {
        "audio_base64": base64.b64encode(speech_bytes).decode("utf-8")
    }


@router.post("/process")
async def voice_assistant_process(
    file: UploadFile = File(...),
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    try:
        audio_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read audio file: {e}")
        
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Uploaded audio file is empty.")
        
    # Process voice pipeline: Speech-to-Text -> Chatbot -> Text-to-Speech
    transcription, response_text, speech_bytes = process_voice_query(audio_bytes, lang)
    
    # Base64 encode the MP3 audio bytes
    audio_base64 = base64.b64encode(speech_bytes).decode("utf-8")
    
    # Log to MongoDB
    doc = {
        "_id": str(uuid.uuid4()),
        "transcription": transcription,
        "bot_response": response_text,
        "language": lang,
        "created_at": datetime.utcnow()
    }
    
    try:
        # Save to chat history as a voice log
        coll = get_collection("chat_history")
        await coll.insert_one(doc)
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        
    return {
        "transcription": transcription,
        "response": response_text,
        "audio_base64": audio_base64
    }
