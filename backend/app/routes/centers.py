from fastapi import APIRouter, Query
from app.db import get_collection
from typing import Optional

router = APIRouter(prefix="/centers", tags=["Agriculture Centers"])

@router.get("/")
async def get_agriculture_centers(
    center_type: Optional[str] = Query(None, description="Filter by type: 'Soil Testing Lab', 'Agriculture Office', 'Seed Distribution Center'"),
    latitude: Optional[float] = Query(None, description="User current latitude"),
    longitude: Optional[float] = Query(None, description="User current longitude"),
    radius_km: float = Query(50.0, description="Search radius in kilometers")
):
    coll = get_collection("agriculture_centers")
    query = {}
    if center_type:
        query["type"] = center_type
        
    centers = []
    try:
        cursor = coll.find(query)
        async for doc in cursor:
            # We can calculate distance if coordinates are provided
            if latitude is not None and longitude is not None:
                # Simple Euclidean approximation for short distances:
                # 1 degree of latitude ~ 111 km.
                lat_diff = doc["latitude"] - latitude
                lon_diff = doc["longitude"] - longitude
                dist = ((lat_diff * 111) ** 2 + (lon_diff * 111) ** 2) ** 0.5
                doc["distance_km"] = round(dist, 1)
                
                # Filter by radius if requested
                if dist <= radius_km:
                    centers.append(doc)
            else:
                doc["distance_km"] = None
                centers.append(doc)
                
        # If coordinates provided, sort by distance ascending
        if latitude is not None and longitude is not None:
            centers.sort(key=lambda x: x.get("distance_km", 9999))
            
    except Exception as e:
        print(f"Error fetching agriculture centers: {e}")
        
    return centers
