import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Wind, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Search,
  MapPin
} from 'lucide-react';
import { api, WeatherResponse } from '../services/api';

interface WeatherAdvisoryProps {
  language: 'en' | 'te' | 'hi';
}

export const WeatherAdvisory: React.FC<WeatherAdvisoryProps> = ({ language }) => {
  const [lat, setLat] = useState<number>(16.3067); // Guntur
  const [lon, setLon] = useState<number>(80.4365);
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Weather-Based Spray Recommendation",
      subtitle: "Evaluate meteorological drift and evaporation risk before pesticide application",
      searchBtn: "Fetch Advisory",
      temp: "Temperature",
      humidity: "Humidity",
      windSpeed: "Wind Speed",
      rain: "Rain Probability",
      suitability: "Spray Suitability Status",
      reasons: "Detailed Assessment",
      guidelines: "Recommended Field Procedures",
      latInput: "Latitude",
      lonInput: "Longitude",
      presetTitle: "Preset Locations (Andhra Pradesh)",
      guntur: "Guntur (Cotton / Chili)",
      vijayawada: "Vijayawada (Rice)",
      anantapur: "Anantapur (Groundnut)",
      kurnool: "Kurnool (Millets)"
    },
    te: {
      title: "వాతావరణ పిచికారీ సలహా",
      subtitle: "పురుగుమందులు చల్లే ముందు గాలి వేగం, ఉష్ణోగ్రత మరియు వర్ష నష్టాలను తెలుసుకోండి",
      searchBtn: "సలహా పొందు",
      temp: "ఉష్ణోగ్రత",
      humidity: "గాలిలో తేమ",
      windSpeed: "గాలి వేగం",
      rain: "వర్షపాతం అవకాశం",
      suitability: "పిచికారీ అనుకూలత స్థితి",
      reasons: "వివరమైన విశ్లేషణ",
      guidelines: "సిఫార్సు చేయబడిన పద్ధతులు",
      latInput: "అక్షాంశం (Latitude)",
      lonInput: "రేఖాంశం (Longitude)",
      presetTitle: "ప్రాంతాల వారీగా (ఆంధ్రప్రదేశ్)",
      guntur: "గుంటూరు (పత్తి / మిర్చి)",
      vijayawada: "విజయవాడ (వరి)",
      anantapur: "అనంతపురం (వేరుశనగ)",
      kurnool: "కర్నూలు (రాగులు / సజ్జలు)"
    },
    hi: {
      title: "मौसम आधारित छिड़काव सलाह",
      subtitle: "कीटनाशक छिड़काव से पहले हवा की गति, तापमान और वाष्पीकरण जोखिमों की जांच करें",
      searchBtn: "सलाह प्राप्त करें",
      temp: "तापमान",
      humidity: "आर्द्रता",
      windSpeed: "हवा की गति",
      rain: "बारिश की संभावना",
      suitability: "छिड़काव उपयुक्तता स्थिति",
      reasons: "विस्तृत मूल्यांकन",
      guidelines: "अनुशंसित कृषि प्रक्रियाएं",
      latInput: "अक्षांश (Latitude)",
      lonInput: "देशांतर (Longitude)",
      presetTitle: "पूर्व निर्धारित स्थान (आंध्र प्रदेश)",
      guntur: "गुंटूर (कपास / मिर्च)",
      vijayawada: "विजयवाड़ा (धान)",
      anantapur: "अनंतपुर (मूंगफली)",
      kurnool: "कुरनूल (बाजरा)"
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchAdvisory();
  }, [language]);

  const fetchAdvisory = async (customLat?: number, customLon?: number) => {
    setLoading(true);
    setError(null);
    const targetLat = customLat !== undefined ? customLat : lat;
    const targetLon = customLon !== undefined ? customLon : lon;
    
    try {
      const data = await api.getWeatherAdvisory(targetLat, targetLon, language);
      setAdvisory(data);
    } catch (err) {
      setError("Could not retrieve weather advisory. Ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (pLat: number, pLon: number) => {
    setLat(pLat);
    setLon(pLon);
    fetchAdvisory(pLat, pLon);
  };

  // Helper to determine background color for suitability badge
  const getSuitabilityColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('excellent') || s.includes('అత్యుత్తమం') || s.includes('उत्कृष्ट') || s.includes('good') || s.includes('మంచిది') || s.includes('अच्छा')) {
      return 'bg-emerald-500 text-white border-emerald-600';
    }
    if (s.includes('caution') || s.includes('హెచ్చరిక') || s.includes('सावधानी')) {
      return 'bg-amber-500 text-white border-amber-600';
    }
    return 'bg-red-500 text-white border-red-600';
  };

  const getSuitabilityIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('excellent') || s.includes('అత్యుత్తమం') || s.includes('उत्कृष्ट') || s.includes('good') || s.includes('మంచిది') || s.includes('अच्छा')) {
      return <CheckCircle2 className="h-6 w-6 text-white shrink-0" />;
    }
    if (s.includes('caution') || s.includes('హెచ్చరిక') || s.includes('सावधानी')) {
      return <AlertTriangle className="h-6 w-6 text-white shrink-0" />;
    }
    return <AlertOctagon className="h-6 w-6 text-white shrink-0" />;
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <CloudSun className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preset & Input Coordinate Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preset buttons */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-slate-700 text-sm mb-3.5 flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-primary-500" />
              <span>{t.presetTitle}</span>
            </h3>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => handlePresetSelect(16.3067, 80.4365)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${lat === 16.3067 ? 'bg-primary-50 border-primary-300 text-primary-950 font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                {t.guntur}
              </button>
              <button 
                onClick={() => handlePresetSelect(16.5062, 80.6480)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${lat === 16.5062 ? 'bg-primary-50 border-primary-300 text-primary-950 font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                {t.vijayawada}
              </button>
              <button 
                onClick={() => handlePresetSelect(14.6819, 77.6006)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${lat === 14.6819 ? 'bg-primary-50 border-primary-300 text-primary-950 font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                {t.anantapur}
              </button>
              <button 
                onClick={() => handlePresetSelect(15.8281, 78.0373)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${lat === 15.8281 ? 'bg-primary-50 border-primary-300 text-primary-950 font-bold' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                {t.kurnool}
              </button>
            </div>
          </div>

          {/* Coordinate input forms */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.latInput}</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={lat} 
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.lonInput}</label>
                <input 
                  type="number" 
                  step="0.0001" 
                  value={lon} 
                  onChange={(e) => setLon(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={() => fetchAdvisory()}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>{t.searchBtn}</span>
            </button>
            {error && <p className="text-xs text-red-500 font-semibold text-center mt-2">{error}</p>}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-8 space-y-6">
          {advisory && (
            <div className="space-y-6">
              {/* Suitability Banner */}
              <div className={`p-6 rounded-2xl border flex items-center space-x-4 shadow-md ${getSuitabilityColor(advisory.spray_suitability)}`}>
                <div className="p-3 bg-white/10 rounded-xl">
                  {getSuitabilityIcon(advisory.spray_suitability)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">{t.suitability}</span>
                  <h3 className="text-2xl font-black mt-0.5">{advisory.spray_suitability}</h3>
                  <p className="text-xs mt-1.5 opacity-95 leading-relaxed font-medium">
                    {advisory.suitability_reason}
                  </p>
                </div>
              </div>

              {/* Specific Weather Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Temp */}
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                  <Thermometer className="h-7 w-7 text-red-500 mb-2" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.temp}</span>
                  <span className="text-lg font-bold text-slate-800 mt-1">{advisory.temperature}°C</span>
                </div>

                {/* Humidity */}
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                  <Droplets className="h-7 w-7 text-blue-500 mb-2" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.humidity}</span>
                  <span className="text-lg font-bold text-slate-800 mt-1">{advisory.humidity}%</span>
                </div>

                {/* Wind */}
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                  <Wind className="h-7 w-7 text-primary-500 mb-2" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.windSpeed}</span>
                  <span className="text-lg font-bold text-slate-800 mt-1">{advisory.wind_speed} km/h</span>
                </div>

                {/* Rain */}
                <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                  <CloudRain className="h-7 w-7 text-blue-600 mb-2" />
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{t.rain}</span>
                  <span className="text-lg font-bold text-slate-800 mt-1">{advisory.rain_probability}%</span>
                </div>
              </div>

              {/* Detailed Assessment & Spray Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detailed Analysis list */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-3 mb-3.5 flex items-center space-x-1.5">
                    <AlertTriangle className="h-4 w-4 text-slate-400" />
                    <span>{t.reasons}</span>
                  </h4>
                  <ul className="space-y-3">
                    {advisory.recommendations.slice(0, 3).map((rec, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                        <span className="h-2 w-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spray Guidelines list */}
                <div className="glass-panel p-5 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-3 mb-3.5 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    <span>{t.guidelines}</span>
                  </h4>
                  <ul className="space-y-3">
                    {advisory.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                        <span className="h-2 w-2 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed font-medium">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
