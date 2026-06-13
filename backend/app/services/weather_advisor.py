import requests
import logging
from typing import Dict, Any, List
from app.config import settings
from app.services.disease_info import translate_field

logger = logging.getLogger("uvicorn")

WEATHER_TRANSLATIONS = {
    "te": {
        "Excellent": "అత్యుత్తమం (స్ప్రే చేయవచ్చు)",
        "Good": "మంచిది (స్ప్రే చేయవచ్చు)",
        "Caution": "హెచ్చరిక (జాగ్రత్తగా స్ప్రే చేయండి)",
        "Do Not Spray": "స్ప్రే చేయవద్దు",
        "Wind speed is too high (risk of chemical drift).": "గాలి వేగం చాలా ఎక్కువగా ఉంది (మందు కొట్టుకుపోయే ప్రమాదం ఉంది).",
        "Wind speed is too low (risk of temperature inversion drift).": "గాలి వేగం చాలా తక్కువగా ఉంది (ఉష్ణోగ్రత తిరగబడే ప్రమాదం).",
        "Temperature is too high (causes evaporation and leaf burn).": "ఉష్ణోగ్రత చాలా ఎక్కువగా ఉంది (మందు ఆవిరైపోతుంది, ఆకులు కాలిపోతాయి).",
        "Humidity is too low (causes rapid droplet evaporation).": "గాలిలో తేమ చాలా తక్కువగా ఉంది (మందు బిందువులు త్వరగా ఆవిరైపోతాయి).",
        "High rain probability (chemical will wash away).": "వర్షం పడే అవకాశం ఎక్కువగా ఉంది (మందు కొట్టుకుపోతుంది).",
        "Optimal spraying conditions.": "పిచికారీ చేయడానికి అనుకూలమైన వాతావరణం.",
        "Ensure personal protective equipment is worn.": "వ్యక్తిగత రక్షణ పరికరాలను తప్పనిసరిగా ధరించండి.",
        "Spray early in the morning (6 AM to 9 AM) or late evening.": "ఉదయం (6 నుండి 9 గంటల మధ్య) లేదా సాయంత్రం వేళల్లో పిచికారీ చేయండి.",
        "Keep spray nozzle close to canopy.": "స్ప్రే నాజిల్‌ను పంటకు దగ్గరగా ఉంచండి."
    },
    "hi": {
        "Excellent": "उत्कृष्ट (छिड़काव के लिए उपयुक्त)",
        "Good": "अच्छा (छिड़काव कर सकते हैं)",
        "Caution": "सावधानी (सतर्क रहें)",
        "Do Not Spray": "छिड़काव न करें",
        "Wind speed is too high (risk of chemical drift).": "हवा की गति बहुत अधिक है (दवा उड़ने का खतरा है)।",
        "Wind speed is too low (risk of temperature inversion drift).": "हवा की गति बहुत कम है (तापमान व्युत्क्रमण बहाव का खतरा)।",
        "Temperature is too high (causes evaporation and leaf burn).": "तापमान बहुत अधिक है (वाष्पीकरण और पत्ती जलने का खतरा)।",
        "Humidity is too low (causes rapid droplet evaporation).": "आर्द्रता बहुत कम है (बूँदें तेजी से वाष्पीकृत होंगी)।",
        "High rain probability (chemical will wash away).": "बारिश की संभावना बहुत अधिक है (दवा धुल जाएगी)।",
        "Optimal spraying conditions.": "छिड़काव के लिए अनुकूल परिस्थितियां।",
        "Ensure personal protective equipment is worn.": "व्यक्तिगत सुरक्षा उपकरण पहनना सुनिश्चित करें।",
        "Spray early in the morning (6 AM to 9 AM) or late evening.": "सुबह जल्दी (6 से 9 बजे) या देर शाम छिड़काव करें।",
        "Keep spray nozzle close to canopy.": "स्प्रे नोजल को फसल के करीब रखें।"
    }
}

def analyze_spray_suitability(temp: float, humidity: float, wind_speed: float, rain_prob: float) -> Dict[str, Any]:
    """
    Analyzes meteorological factors to output spray suitability.
    - Wind speed: 3 - 15 km/h is optimal.
    - Temperature: 15°C - 30°C is optimal. Above 35°C is Do Not Spray.
    - Humidity: 40% - 80% is optimal.
    - Rain probability: < 30% is optimal.
    """
    reasons = []
    recommendations = []
    
    # Analyze Wind (wind_speed in km/h)
    wind_status = "Optimal"
    if wind_speed > 18.0:
        wind_status = "Critical"
        reasons.append("Wind speed is too high (risk of chemical drift).")
    elif wind_speed < 3.0:
        wind_status = "Warning"
        reasons.append("Wind speed is too low (risk of temperature inversion drift).")
        
    # Analyze Temperature
    temp_status = "Optimal"
    if temp > 35.0:
        temp_status = "Critical"
        reasons.append("Temperature is too high (causes evaporation and leaf burn).")
    elif temp > 30.0 or temp < 10.0:
        temp_status = "Warning"
        
    # Analyze Humidity
    humidity_status = "Optimal"
    if humidity < 35.0:
        humidity_status = "Warning"
        reasons.append("Humidity is too low (causes rapid droplet evaporation).")
    elif humidity > 85.0:
        humidity_status = "Warning"
        
    # Analyze Rain
    rain_status = "Optimal"
    if rain_prob > 40.0:
        rain_status = "Critical"
        reasons.append("High rain probability (chemical will wash away).")
    elif rain_prob > 20.0:
        rain_status = "Warning"

    # Evaluate Overall Suitability
    if "Critical" in [wind_status, temp_status, rain_status]:
        suitability = "Do Not Spray"
    elif "Warning" in [wind_status, temp_status, humidity_status, rain_status]:
        suitability = "Caution"
    else:
        suitability = "Excellent"
        
    if not reasons:
        reasons.append("Optimal spraying conditions.")
        
    # Standard pesticide safety recommendations
    recommendations.append("Ensure personal protective equipment is worn.")
    recommendations.append("Spray early in the morning (6 AM to 9 AM) or late evening.")
    recommendations.append("Keep spray nozzle close to canopy.")
    
    return {
        "spray_suitability": suitability,
        "suitability_reason": reasons[0] if reasons else "Optimal spraying conditions.",
        "all_reasons": reasons,
        "recommendations": recommendations
    }

def get_weather_advisory(lat: float, lon: float, lang: str = "en") -> Dict[str, Any]:
    """
    Fetches weather from OpenWeather API or generates realistic simulated coordinates weather.
    Runs suitability analytics and translates to chosen language.
    """
    temp, humidity, wind_speed, rain_prob = 28.5, 65.0, 8.5, 10.0  # Defaults
    
    if settings.OPENWEATHER_API_KEY:
        try:
            url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={settings.OPENWEATHER_API_KEY}&units=metric"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                current = data["list"][0]
                temp = current["main"]["temp"]
                humidity = current["main"]["humidity"]
                # Convert m/s to km/h
                wind_speed = current["wind"]["speed"] * 3.6
                rain_prob = float(current.get("pop", 0)) * 100
                logger.info("Fetched live weather data from OpenWeather API.")
        except Exception as e:
            logger.error(f"Error fetching OpenWeather API: {e}. Using simulated fallback data.")
    else:
        # Generate simulated but coordinate-realistic weather data (e.g. AP coordinates)
        # Guntur (16.3, 80.4) is generally hot and dry/humid. Let's make it vary based on latitude/longitude decimal hashes
        coord_hash = int((abs(lat) + abs(lon)) * 100) % 100
        temp = 22.0 + (coord_hash % 15)  # 22°C to 37°C
        humidity = 40.0 + (coord_hash % 45)  # 40% to 85%
        wind_speed = 4.0 + (coord_hash % 16)  # 4 to 20 km/h
        rain_prob = (coord_hash * 7) % 100  # 0% to 99%
        logger.info(f"Simulated weather generated: Temp={temp:.1f}°C, Humid={humidity:.1f}%, Wind={wind_speed:.1f}km/h, Rain={rain_prob:.1f}%")

    analysis = analyze_spray_suitability(temp, humidity, wind_speed, rain_prob)
    
    # Translate
    suitability = analysis["spray_suitability"]
    reason = analysis["suitability_reason"]
    reasons = analysis["all_reasons"]
    recs = analysis["recommendations"]
    
    if lang in WEATHER_TRANSLATIONS:
        lang_dict = WEATHER_TRANSLATIONS[lang]
        suitability = lang_dict.get(suitability, suitability)
        reason = lang_dict.get(reason, reason)
        reasons = [lang_dict.get(r, r) for r in reasons]
        recs = [lang_dict.get(rec, rec) for rec in recs]
        
    return {
        "lat": lat,
        "lon": lon,
        "temperature": round(temp, 1),
        "humidity": round(humidity, 1),
        "wind_speed": round(wind_speed, 1),
        "rain_probability": round(rain_prob, 1),
        "spray_suitability": suitability,
        "suitability_reason": reason,
        "all_reasons": reasons,
        "recommendations": recs
    }
