from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import uuid
from app.db import get_collection
from app.models.chatbot import ChatQueryRequest
from app.services.rag_chatbot import query_chatbot

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

@router.post("/query")
async def chat_query(req: ChatQueryRequest):
    session_id = req.session_id or str(uuid.uuid4())
    
    # Run the query through our local RAG pipeline
    result = query_chatbot(req.message, req.language)
    
    doc = {
        "_id": str(uuid.uuid4()),
        "session_id": session_id,
        "user_message": req.message,
        "bot_response": result["response"],
        "language": req.language,
        "source_documents": result["source_documents"],
        "created_at": datetime.utcnow()
    }
    
    try:
        coll = get_collection("chat_history")
        await coll.insert_one(doc)
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        
    return doc

@router.get("/history/{session_id}")
async def get_session_history(session_id: str, limit: int = 50):
    coll = get_collection("chat_history")
    history = []
    try:
        cursor = coll.find({"session_id": session_id}).sort("created_at", 1).limit(limit)
        async for doc in cursor:
            history.append(doc)
    except Exception as e:
        print(f"Error fetching session chat history: {e}")
    return history
