from fastapi import APIRouter, Query
from app.db import get_collection
from typing import List, Optional

router = APIRouter(prefix="/schemes", tags=["Government Schemes"])

@router.get("/")
async def get_schemes(
    category: Optional[str] = Query(None, description="Category filter"),
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    coll = get_collection("government_schemes")
    query = {}
    if category:
        query["category"] = category
        
    schemes = []
    try:
        cursor = coll.find(query)
        async for doc in cursor:
            # Map translated fields based on user request lang
            if lang != "en":
                # Translate title, description, eligibility, benefits, documents, process if translations exist
                if "title_translated" in doc and doc["title_translated"] and lang in doc["title_translated"]:
                    doc["title"] = doc["title_translated"][lang]
                if "description_translated" in doc and doc["description_translated"] and lang in doc["description_translated"]:
                    doc["description"] = doc["description_translated"][lang]
                if "eligibility_translated" in doc and doc["eligibility_translated"] and lang in doc["eligibility_translated"]:
                    doc["eligibility"] = doc["eligibility_translated"][lang]
                if "benefits_translated" in doc and doc["benefits_translated"] and lang in doc["benefits_translated"]:
                    doc["benefits"] = doc["benefits_translated"][lang]
                if "required_documents_translated" in doc and doc["required_documents_translated"] and lang in doc["required_documents_translated"]:
                    doc["required_documents"] = doc["required_documents_translated"][lang]
                if "application_process_translated" in doc and doc["application_process_translated"] and lang in doc["application_process_translated"]:
                    doc["application_process"] = doc["application_process_translated"][lang]
                    
            schemes.append(doc)
    except Exception as e:
        print(f"Error fetching schemes: {e}")
        
    return schemes

@router.get("/{scheme_id}")
async def get_scheme_by_id(scheme_id: str, lang: str = Query("en")):
    coll = get_collection("government_schemes")
    try:
        doc = await coll.find_one({"_id": scheme_id})
        if doc and lang != "en":
            if "title_translated" in doc and doc["title_translated"] and lang in doc["title_translated"]:
                doc["title"] = doc["title_translated"][lang]
            if "description_translated" in doc and doc["description_translated"] and lang in doc["description_translated"]:
                doc["description"] = doc["description_translated"][lang]
            if "eligibility_translated" in doc and doc["eligibility_translated"] and lang in doc["eligibility_translated"]:
                doc["eligibility"] = doc["eligibility_translated"][lang]
            if "benefits_translated" in doc and doc["benefits_translated"] and lang in doc["benefits_translated"]:
                doc["benefits"] = doc["benefits_translated"][lang]
            if "required_documents_translated" in doc and doc["required_documents_translated"] and lang in doc["required_documents_translated"]:
                doc["required_documents"] = doc["required_documents_translated"][lang]
            if "application_process_translated" in doc and doc["application_process_translated"] and lang in doc["application_process_translated"]:
                doc["application_process"] = doc["application_process_translated"][lang]
        return doc
    except Exception as e:
        print(f"Error fetching scheme by id: {e}")
    return None
