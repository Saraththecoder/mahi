from typing import Dict, Any, List
from app.services.disease_info import translate_field

HEALTH_TRANSLATIONS = {
    "te": {
        "High disease risk detected. Crop shows signs of ": "అధిక తెగులు సోకే ప్రమాదం ఉంది. పంటపై లక్షణాలు: ",
        "Soil pH is acidic (pH < 5.5). Apply Lime (Calcium Carbonate).": "మట్టి పి.హెచ్ ఆమ్లంగా ఉంది (pH < 5.5). పొలానికి సున్నం చల్లండి.",
        "Soil pH is alkaline (pH > 8.0). Apply Gypsum.": "మట్టి పి.హెచ్ క్షారంగా ఉంది (pH > 8.0). జిప్సం వాడండి.",
        "Low nitrogen level. Apply Nitrogen fertilizer (Urea).": "నత్రజని లోపం ఉంది. యూరియా వంటి నత్రజని ఎరువులు వేయండి.",
        "Low phosphorus level. Apply DAP or Single Super Phosphate.": "భాస్వరం లోపం ఉంది. డి.ఎ.పి లేదా సింగిల్ సూపర్ ఫాస్ఫేట్ వేయండి.",
        "Low potassium level. Apply MOP to build crop immunity.": "పొటాషియం లోపం ఉంది. పంట రోగ నిరోధక శక్తి కోసం పొటాష్ ఎరువులు వేయండి.",
        "Soil moisture is critically low. Schedule irrigation immediately.": "నేలలో తేమ శాతం చాలా తక్కువగా ఉంది. వెంటనే నీటి తడులు అందించండి.",
        "Soil moisture is excessively high. Ensure proper drainage to avoid root rot.": "నేలలో తేమ ఎక్కువగా ఉంది. వేరు కుళ్లు తెగులు రాకుండా నీటి కాలువలు ఏర్పాటు చేయండి.",
        "Extreme high temperature. Irrigate crop during early hours to avoid heat stress.": "అధిక వేడి వాతావరణం ఉంది. ఎండ వేడి నుండి రక్షించడానికి ఉదయాన్నే నీరు పెట్టండి.",
        "All soil and weather conditions are optimal. Maintain standard routines.": "నేల మరియు వాతావరణ పరిస్థితులు అనుకూలంగా ఉన్నాయి. సాధారణ పద్ధతులను కొనసాగించండి."
    },
    "hi": {
        "High disease risk detected. Crop shows signs of ": "उच्च रोग जोखिम देखा गया है। फसल में लक्षण: ",
        "Soil pH is acidic (pH < 5.5). Apply Lime (Calcium Carbonate).": "मिट्टी का पीएच अम्लीय है (pH < 5.5)। चूना (कैल्शियम कार्बोनेट) डालें।",
        "Soil pH is alkaline (pH > 8.0). Apply Gypsum.": "मिट्टी का पीएच क्षारीय है (pH > 8.0)। जिप्सम का प्रयोग करें।",
        "Low nitrogen level. Apply Nitrogen fertilizer (Urea).": "नाइट्रोजन का स्तर कम है। यूरिया खाद डालें।",
        "Low phosphorus level. Apply DAP or Single Super Phosphate.": "फास्फोरस का स्तर कम है। डीएपी या सिंगल सुपर फास्फेट डालें।",
        "Low potassium level. Apply MOP to build crop immunity.": "पोटाश का स्तर कम है। एमओपी डालकर फसल की प्रतिरोधक क्षमता बढ़ाएं।",
        "Soil moisture is critically low. Schedule irrigation immediately.": "नमी बहुत कम है। तुरंत सिंचाई की व्यवस्था करें।",
        "Soil moisture is excessively high. Ensure proper drainage to avoid root rot.": "नमी बहुत अधिक है। जल निकासी की व्यवस्था करें ताकि जड़ें न सड़ें।",
        "Extreme high temperature. Irrigate crop during early hours to avoid heat stress.": "अत्यधिक तापमान है। गर्मी से बचाने के लिए सुबह जल्दी सिंचाई करें।",
        "All soil and weather conditions are optimal. Maintain standard routines.": "सभी मिट्टी और मौसम की स्थिति इष्टतम है। सामान्य दिनचर्या बनाए रखें।"
    }
}

def calculate_crop_health(
    crop_type: str,
    N: float,
    P: float,
    K: float,
    pH: float,
    moisture: float,
    temperature: float,
    humidity: float,
    disease_detected: str = None,
    lang: str = "en"
) -> Dict[str, Any]:
    """
    Calculates crop health score from 0-100 and outlines agronomic reasons.
    """
    score = 100
    recommendations = []
    
    # 1. Disease Deductions
    disease_risk = "Low"
    if disease_detected and disease_detected.lower() != "healthy":
        disease_risk = "High"
        score -= 35
        rec_msg = f"High disease risk detected. Crop shows signs of {disease_detected}."
        if lang in HEALTH_TRANSLATIONS:
            translated_prefix = HEALTH_TRANSLATIONS[lang]["High disease risk detected. Crop shows signs of "]
            translated_disease = translate_field(disease_detected, lang)
            recommendations.append(f"{translated_prefix}{translated_disease}.")
        else:
            recommendations.append(rec_msg)

    # 2. Soil Parameter Deductions
    soil_issues = []
    # pH evaluation
    if pH < 5.5:
        score -= 15
        rec = "Soil pH is acidic (pH < 5.5). Apply Lime (Calcium Carbonate)."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Acidic")
    elif pH > 8.0:
        score -= 15
        rec = "Soil pH is alkaline (pH > 8.0). Apply Gypsum."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Alkaline")
        
    # Moisture evaluation
    if moisture < 30.0:
        score -= 15
        rec = "Soil moisture is critically low. Schedule irrigation immediately."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Dry")
    elif moisture > 85.0:
        score -= 10
        rec = "Soil moisture is excessively high. Ensure proper drainage to avoid root rot."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Waterlogged")
        
    # NPK evaluation
    if N < 30.0:
        score -= 10
        rec = "Low nitrogen level. Apply Nitrogen fertilizer (Urea)."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Low Nitrogen")
    if P < 25.0:
        score -= 10
        rec = "Low phosphorus level. Apply DAP or Single Super Phosphate."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Low Phosphorus")
    if K < 30.0:
        score -= 10
        rec = "Low potassium level. Apply MOP to build crop immunity."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        soil_issues.append("Low Potassium")

    # 3. Weather Deductions
    weather_risk = "Low"
    if temperature > 36.0:
        score -= 10
        weather_risk = "High"
        rec = "Extreme high temperature. Irrigate crop during early hours to avoid heat stress."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
    elif temperature < 10.0:
        score -= 8
        weather_risk = "Medium"
        
    if humidity > 90.0:
        weather_risk = "Medium"

    # Enforce boundaries
    score = max(0, min(100, score))
    
    # Soil status label
    if not soil_issues:
        soil_status = "Excellent"
    elif len(soil_issues) <= 2:
        soil_status = "Moderate"
    else:
        soil_status = "Poor"
        
    if not recommendations:
        rec = "All soil and weather conditions are optimal. Maintain standard routines."
        recommendations.append(HEALTH_TRANSLATIONS.get(lang, {}).get(rec, rec))
        
    # Translate status labels
    status_map = {
        "te": {"Excellent": "అద్భుతం", "Moderate": "మధ్యస్థం", "Poor": "నిర్లక్ష్యం", "High": "అధికం", "Medium": "మధ్యస్థం", "Low": "తక్కువ"},
        "hi": {"Excellent": "उत्कृष्ट", "Moderate": "मध्यम", "Poor": "कमजोर", "High": "उच्च", "Medium": "मध्यम", "Low": "कम"}
    }
    
    soil_status_trans = status_map.get(lang, {}).get(soil_status, soil_status)
    disease_risk_trans = status_map.get(lang, {}).get(disease_risk, disease_risk)
    weather_risk_trans = status_map.get(lang, {}).get(weather_risk, weather_risk)

    return {
        "crop_type": crop_type,
        "health_score": score,
        "disease_risk": disease_risk_trans,
        "weather_risk": weather_risk_trans,
        "soil_status": soil_status_trans,
        "recommendations": recommendations
    }
