import os
import logging
from typing import Dict, Any
from app.config import settings
from app.services.disease_info import translate_field

logger = logging.getLogger("uvicorn")

# Lazy imports for sklearn and joblib
joblib = None
try:
    import joblib as as_joblib
    joblib = as_joblib
except ImportError:
    pass

MODEL_PATH = os.path.join(settings.MODEL_DIR, "fertilizer_model.pkl")

# Multilingual fertilizer translations
FERTILIZER_TRANSLATIONS = {
    "te": {
        "Urea": "యూరియా",
        "DAP (Diammonium Phosphate)": "డి.ఎ.పి (డై అమ్మోనియం ఫాస్ఫేట్)",
        "MOP (Muriate of Potash)": "ఎమ్.ఓ.పి (మ్యూరియేట్ ఆఫ్ పొటాష్)",
        "NPK 19-19-19": "ఎన్.పి.కె 19-19-19 (మిశ్రమ ఎరువు)",
        "Organic Compost": "సేంద్రీయ ఎరువు (కంపోస్ట్)",
        "Lime (Calcium Carbonate)": "సున్నం (కాల్షియం కార్బోనేట్ - ఆమ్ల నేలలకు)",
        "Gypsum (Calcium Sulfate)": "జిప్సం (కాల్షియం సల్ఫేట్ - క్షార నేలలకు)",
        "NPK 10-26-26": "ఎన్.పి.కె 10-26-26"
    },
    "hi": {
        "Urea": "यूरिया",
        "DAP (Diammonium Phosphate)": "डीएपी (डाई अमोनियम फास्फेट)",
        "MOP (Muriate of Potash)": "एमओपी (म्यूरेट ऑफ पोटाश)",
        "NPK 19-19-19": "एनपीके 19-19-19",
        "Organic Compost": "जैविक खाद (कंपोस्ट)",
        "Lime (Calcium Carbonate)": "चूना (कैल्शियम कार्बोनेट - अम्लीय मिट्टी के लिए)",
        "Gypsum (Calcium Sulfate)": "जिप्सम (कैल्शियम सल्फेट - क्षारीय मिट्टी के लिए)",
        "NPK 10-26-26": "एनपीके 10-26-26"
    }
}

def get_expert_recommendation(crop_type: str, N: float, P: float, K: float, pH: float, moisture: float) -> Dict[str, Any]:
    """
    Expert rule-based system for soil fertilization recommendation.
    Outputs: Recommended fertilizer, quantity, application instructions.
    """
    # 1. Acidic/Alkaline Soil adjustment takes priority
    if pH < 5.5:
        return {
            "recommended_fertilizer": "Lime (Calcium Carbonate)",
            "quantity": "250 kg/acre",
            "instructions": "Broadcast Lime evenly across the soil 2-3 weeks before planting. Mix thoroughly into the top 6 inches of soil to neutralize high acidity."
        }
    elif pH > 8.0:
        return {
            "recommended_fertilizer": "Gypsum (Calcium Sulfate)",
            "quantity": "200 kg/acre",
            "instructions": "Apply Gypsum to the soil surface and incorporate it deeply. Irrigate immediately to help leach out excess sodium and reduce high alkalinity."
        }
        
    # 2. Extreme moisture stress
    if moisture < 20.0:
        return {
            "recommended_fertilizer": "Organic Compost",
            "quantity": "2-3 Tons/acre",
            "instructions": "Incorporate organic matter or compost into the soil. Apply mulch around crops to conserve soil moisture. Irrigate fields before applying chemical fertilizers."
        }

    # Normalize N, P, K levels (assuming optimal range is 40-80 mg/kg depending on crop)
    # 3. Nitrogen Deficiency
    if N < 35.0:
        if P < 30.0:
            return {
                "recommended_fertilizer": "DAP (Diammonium Phosphate)",
                "quantity": "50 kg/acre",
                "instructions": "Apply DAP as a basal dressing at the time of sowing. Place it 2-3 inches to the side and below the seed to prevent seed burn."
            }
        else:
            return {
                "recommended_fertilizer": "Urea",
                "quantity": "45 kg/acre",
                "instructions": "Apply Urea in split doses: half at sowing, and the remaining half 4-5 weeks later during peak vegetative growth. Apply to moist soil."
            }
            
    # 4. Phosphorus Deficiency
    if P < 30.0:
        return {
            "recommended_fertilizer": "DAP (Diammonium Phosphate)",
            "quantity": "60 kg/acre",
            "instructions": "Apply as basal fertilizer. Ensure soil has sufficient moisture during application for best absorption."
        }
        
    # 5. Potassium Deficiency
    if K < 35.0:
        return {
            "recommended_fertilizer": "MOP (Muriate of Potash)",
            "quantity": "40 kg/acre",
            "instructions": "Apply MOP in two split applications: half during land preparation and half during the flowering stage."
        }
        
    # 6. Balanced low nutrients
    if N < 50.0 and P < 50.0 and K < 50.0:
        return {
            "recommended_fertilizer": "NPK 19-19-19",
            "quantity": "50 kg/acre",
            "instructions": "Apply NPK 19-19-19 as basal or top dressing during the early growth stage. Mix with soil or apply via fertigation."
        }
        
    # 7. Default for healthy soil
    return {
        "recommended_fertilizer": "Organic Compost",
        "quantity": "1 Ton/acre",
        "instructions": "Soil nutrient levels are adequate. Apply organic compost to maintain soil microbial health and structure. Perform regular weeding."
    }

def recommend_fertilizer(crop_type: str, N: float, P: float, K: float, pH: float, moisture: float, lang: str = "en") -> Dict[str, Any]:
    """
    Predicts fertilizer recommendation.
    Tries to load Scikit-Learn trained model, falls back to expert system.
    """
    fertilizer_name = None
    quantity = None
    instructions = None
    
    # Try using trained model
    if joblib is not None and os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            model = model_data["model"]
            encoder = model_data.get("crop_encoder", None)
            
            crop_encoded = crop_type
            if encoder:
                # Encode crop_type if label encoder was used
                try:
                    crop_encoded = encoder.transform([crop_type])[0]
                except Exception:
                    # Fallback if crop_type was not in encoder classes
                    crop_encoded = 0
            
            features = [[crop_encoded, N, P, K, pH, moisture]]
            prediction = model.predict(features)[0]
            
            # Map model class output to recommendation details
            # A dictionary of metadata for predicted fertilizer names
            fertilizer_name = str(prediction)
            
            # Retrieve default quantity and instructions
            rec = get_expert_recommendation(crop_type, N, P, K, pH, moisture)
            quantity = rec["quantity"]
            instructions = rec["instructions"]
            logger.info(f"Scikit-Learn model fertilizer recommendation: {fertilizer_name}")
        except Exception as e:
            logger.error(f"Error predicting with ML fertilizer model: {e}")

    # Fallback to expert system if model prediction failed or wasn't loaded
    if not fertilizer_name:
        rec = get_expert_recommendation(crop_type, N, P, K, pH, moisture)
        fertilizer_name = rec["recommended_fertilizer"]
        quantity = rec["quantity"]
        instructions = rec["instructions"]
        logger.info(f"Expert system fertilizer recommendation: {fertilizer_name}")

    # Multilingual support
    translated_fertilizer = fertilizer_name
    if lang in FERTILIZER_TRANSLATIONS and fertilizer_name in FERTILIZER_TRANSLATIONS[lang]:
        translated_fertilizer = FERTILIZER_TRANSLATIONS[lang][fertilizer_name]
        
    # Translate standard instruction templates
    translated_instructions = translate_field(instructions, lang)
    translated_quantity = translate_field(quantity, lang)
    
    return {
        "crop_type": crop_type,
        "N": N,
        "P": P,
        "K": K,
        "pH": pH,
        "moisture": moisture,
        "recommended_fertilizer": translated_fertilizer,
        "quantity": translated_quantity,
        "instructions": translated_instructions
    }
