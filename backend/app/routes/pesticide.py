from fastapi import APIRouter, Query
from datetime import datetime
import uuid
from app.db import get_collection
from app.models.pesticide import PesticideRequest
from app.services.disease_info import translate_field

router = APIRouter(prefix="/pesticide", tags=["Pesticide Calculator"])

PESTICIDE_DATABASE = {
    "rice": {
        "blast": {
            "pesticide_name": "Tricyclazole 75% WP",
            "base_pesticide_qty_per_acre": 120,  # grams
            "base_water_qty_per_acre": 200,      # Litres
            "frequency": "Once every 10-12 days (2-3 sprays maximum)",
            "safety_instructions": "Wear a face mask. Do not spray against the wind direction. Ensure a 14-day harvest interval."
        },
        "stem_borer": {
            "pesticide_name": "Chlorantraniliprole 18.5% SC",
            "base_pesticide_qty_per_acre": 60,   # ml
            "base_water_qty_per_acre": 200,
            "frequency": "Spray immediately on appearance of dead hearts. Repeat after 14 days if needed.",
            "safety_instructions": "Keep domestic animals away from fields for 48 hours. Store in a cool, dark place."
        }
    },
    "cotton": {
        "bollworm": {
            "pesticide_name": "Emamectin Benzoate 5% SG",
            "base_pesticide_qty_per_acre": 80,   # grams
            "base_water_qty_per_acre": 200,
            "frequency": "Spray at 15-day intervals during reproductive stage.",
            "safety_instructions": "Extremely toxic to honeybees. Avoid spraying during active pollination hours."
        },
        "aphids": {
            "pesticide_name": "Imidacloprid 17.8% SL",
            "base_pesticide_qty_per_acre": 50,   # ml
            "base_water_qty_per_acre": 200,
            "frequency": "Apply when pest population crosses economic threshold (ETL) of 10 per leaf.",
            "safety_instructions": "Ensure protective eyewear. Wash hands with soap immediately after application."
        }
    },
    "tomato": {
        "early_blight": {
            "pesticide_name": "Mancozeb 75% WP",
            "base_pesticide_qty_per_acre": 600,  # grams
            "base_water_qty_per_acre": 200,
            "frequency": "Every 7-10 days depending on humidity levels.",
            "safety_instructions": "Wear chemical-resistant gloves. Avoid inhalation of spray mist."
        },
        "late_blight": {
            "pesticide_name": "Metalaxyl 8% + Mancozeb 64% WP",
            "base_pesticide_qty_per_acre": 500,  # grams
            "base_water_qty_per_acre": 200,
            "frequency": "Spray immediately at first sign. Repeat every 7 days in rainy weather.",
            "safety_instructions": "Ensure proper dilution. Do not mix with alkaline substances."
        }
    },
    "general": {
        "default": {
            "pesticide_name": "Neem Oil 1500 PPM (Bio-Pesticide)",
            "base_pesticide_qty_per_acre": 1000, # ml
            "base_water_qty_per_acre": 200,
            "frequency": "Once every 7 days as a preventative measure.",
            "safety_instructions": "Organic spray. Safe for bees if sprayed at dusk. Wash edible crops before eating."
        }
    }
}

PESTICIDE_TRANSLATIONS = {
    "te": {
        "Once every 10-12 days (2-3 sprays maximum)": "10-12 రోజులకు ఒకసారి (గరిష్టంగా 2-3 సార్లు పిచికారీ చేయాలి)",
        "Wear a face mask. Do not spray against the wind direction. Ensure a 14-day harvest interval.": "ఫేస్ మాస్క్ ధరించండి. గాలి వీచే దిశకు ఎదురుగా పిచికారీ చేయవద్దు. మందు కొట్టిన 14 రోజుల తర్వాతే కోత కోయండి.",
        "Keep domestic animals away from fields for 48 hours. Store in a cool, dark place.": "పెంపుడు జంతువులను 48 గంటల పాటు పొలానికి దూరంగా ఉంచండి. చల్లని, నీడ ప్రదేశంలో నిల్వ చేయండి.",
        "Spray immediately at first sign. Repeat every 7 days in rainy weather.": "తెగులు కనిపించిన వెంటనే పిచికారీ చేయండి. వర్షపు వాతావరణంలో ప్రతి 7 రోజులకు ఒకసారి స్ప్రే చేయండి.",
        "Wear chemical-resistant gloves. Avoid inhalation of spray mist.": "రసాయన నిరోధక చేతి తొడుగులు ధరించండి. స్ప్రే పొగలను పీల్చవద్దు."
    },
    "hi": {
        "Once every 10-12 days (2-3 sprays maximum)": "हर 10-12 दिनों में एक बार (अधिकतम 2-3 छिड़काव)",
        "Wear a face mask. Do not spray against the wind direction. Ensure a 14-day harvest interval.": "फेस मास्क पहनें। हवा की दिशा के विपरीत छिड़काव न करें। फसल कटाई से 14 दिन पहले छिड़काव बंद कर दें।",
        "Keep domestic animals away from fields for 48 hours. Store in a cool, dark place.": "पालतू जानवरों को 48 घंटे तक खेतों से दूर रखें। ठंडी, सूखी जगह पर स्टोर करें।",
        "Spray immediately at first sign. Repeat every 7 days in rainy weather.": "लक्षण दिखने पर तुरंत स्प्रे करें। बारिश के मौसम में हर 7 दिन में दोहराएं।",
        "Wear chemical-resistant gloves. Avoid inhalation of spray mist.": "रासायनिक-प्रतिरोधी दस्ताने पहनें। स्प्रे भाप को सांस में लेने से बचें।"
    }
}

@router.post("/calculate")
async def calculate_dosage(
    req: PesticideRequest,
    lang: str = Query("en", description="Language: 'en', 'te', 'hi'")
):
    crop_key = req.crop.lower().strip()
    disease_key = req.disease.lower().strip()
    
    # Simple semantic match fallback
    crop_data = PESTICIDE_DATABASE.get(crop_key, PESTICIDE_DATABASE.get("general"))
    
    # Try match disease key
    calc_data = None
    for k, v in crop_data.items():
        if k in disease_key or disease_key in k:
            calc_data = v
            break
            
    if not calc_data:
        calc_data = PESTICIDE_DATABASE["general"]["default"]
        
    # Scale base metrics by area
    area = req.area
    total_pest_qty = calc_data["base_pesticide_qty_per_acre"] * area
    total_water_qty = calc_data["base_water_qty_per_acre"] * area
    
    pest_unit = "ml" if "ml" in str(calc_data["base_pesticide_qty_per_acre"]) or "SC" in calc_data["pesticide_name"] or "SL" in calc_data["pesticide_name"] or "Oil" in calc_data["pesticide_name"] else "grams"
    if pest_unit == "grams" and total_pest_qty >= 1000:
        pesticide_qty_str = f"{total_pest_qty / 1000:.2f} kg"
    elif pest_unit == "ml" and total_pest_qty >= 1000:
        pesticide_qty_str = f"{total_pest_qty / 1000:.2f} Litres"
    else:
        pesticide_qty_str = f"{total_pest_qty:.0f} {pest_unit}"
        
    water_qty_str = f"{total_water_qty:.0f} Litres"
    
    # Translate outputs
    freq = calc_data["frequency"]
    safety = calc_data["safety_instructions"]
    
    if lang in PESTICIDE_TRANSLATIONS:
        freq = PESTICIDE_TRANSLATIONS[lang].get(freq, translate_field(freq, lang))
        safety = PESTICIDE_TRANSLATIONS[lang].get(safety, translate_field(safety, lang))
        
    doc = {
        "_id": str(uuid.uuid4()),
        "crop": req.crop,
        "disease": req.disease,
        "area": area,
        "pesticide_name": calc_data["pesticide_name"],
        "pesticide_quantity": pesticide_qty_str,
        "water_quantity": water_qty_str,
        "frequency": freq,
        "safety_instructions": safety,
        "created_at": datetime.utcnow()
    }
    
    try:
        coll = get_collection("pesticide_calculations")
        await coll.insert_one(doc)
    except Exception as e:
        print(f"MongoDB save failed: {e}")
        
    return doc

@router.get("/history")
async def get_pesticide_history(limit: int = 20):
    coll = get_collection("pesticide_calculations")
    history = []
    try:
        cursor = coll.find({}).sort("created_at", -1).limit(limit)
        async for doc in cursor:
            history.append(doc)
    except Exception as e:
        print(f"Error fetching pesticide history: {e}")
    return history
