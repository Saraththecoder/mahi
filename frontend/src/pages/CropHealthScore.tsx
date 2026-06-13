import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sprout, 
  HelpCircle, 
  Thermometer, 
  Droplets,
  Heart,
  TrendingUp,
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';
import { api, HealthResponse } from '../services/api';

interface CropHealthScoreProps {
  language: 'en' | 'te' | 'hi';
}

export const CropHealthScore: React.FC<CropHealthScoreProps> = ({ language }) => {
  const [cropType, setCropType] = useState('Rice');
  const [N, setN] = useState<number>(65);
  const [P, setP] = useState<number>(55);
  const [K, setK] = useState<number>(50);
  const [pH, setPh] = useState<number>(6.5);
  const [moisture, setMoisture] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(28);
  const [humidity, setHumidity] = useState<number>(65);
  const [diseaseDetected, setDiseaseDetected] = useState('Healthy');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthResponse | null>(null);
  const [history, setHistory] = useState<HealthResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Crop Health Index Scorer",
      subtitle: "Evaluate multi-criteria crop health indexes combining soil, weather, and leaf pathogens",
      cropSelect: "Crop Type",
      nitrogen: "Nitrogen (N)",
      phosphorus: "Phosphorus (P)",
      potassium: "Potassium (K)",
      ph: "Soil pH",
      moist: "Soil Moisture (%)",
      temp: "Air Temperature (°C)",
      humid: "Air Humidity (%)",
      diseaseInput: "Active Disease Detected",
      btnCalculate: "Calculate Health Index",
      resultTitle: "Agronomic Health Diagnostics",
      scoreTitle: "Overall Health Score",
      soilStatus: "Soil Condition",
      weatherRisk: "Weather Risk Level",
      diseaseRisk: "Pathogen Risk Level",
      recommendations: "Actionable Recommendations",
      historyTitle: "Score Ledger",
      emptyHistory: "No health scores recorded.",
      healthyLabel: "Healthy (No Disease)"
    },
    te: {
      title: "పంట ఆరోగ్య సూచిక గణన",
      subtitle: "నేల సారం, వాతావరణం మరియు తెగుళ్ల ఆధారంగా పంట ఆరోగ్య సూచికను విశ్లేషించండి",
      cropSelect: "పంట రకం",
      nitrogen: "నత్రజని (N)",
      phosphorus: "భాస్వరం (P)",
      potassium: "పొటాషియం (K)",
      ph: "మట్టి పి.హెచ్ (pH)",
      moist: "నేల తేమ శాతం (%)",
      temp: "ఉష్ణోగ్రత (°C)",
      humid: "గాలిలో తేమ (%)",
      diseaseInput: "గుర్తించిన తెగులు",
      btnCalculate: "ఆరోగ్య సూచికను లెక్కించు",
      resultTitle: "పంట ఆరోగ్య విశ్లేషణ",
      scoreTitle: "మొత్తం ఆరోగ్య స్కోర్",
      soilStatus: "నేల స్థితి",
      weatherRisk: "వాతావరణ ప్రమాదం",
      diseaseRisk: "రోగకారక ప్రమాదం",
      recommendations: "ఆచరణాత్మక సలహాలు",
      historyTitle: "గత నివేదికల రికార్డు",
      emptyHistory: "ఎటువంటి పాత రికార్డులు లేవు.",
      healthyLabel: "ఆరోగ్యకరమైన ఆకు"
    },
    hi: {
      title: "फसल स्वास्थ्य सूचकांक स्कोरर",
      subtitle: "मिट्टी, मौसम और रोग मापदंडों को मिलाकर फसल स्वास्थ्य सूचकांक का मूल्यांकन करें",
      cropSelect: "फसल प्रकार",
      nitrogen: "नाइट्रोजन (N)",
      phosphorus: "फास्फोरस (P)",
      potassium: "पोटेशियम (K)",
      ph: "मिट्टी का पीएच",
      moist: "मिट्टी की नमी (%)",
      temp: "वायु तापमान (°C)",
      humid: "वायु आर्द्रता (%)",
      diseaseInput: "सक्रिय बीमारी / कीट",
      btnCalculate: "स्वास्थ्य स्कोर की गणना करें",
      resultTitle: "फसल स्वास्थ्य निदान",
      scoreTitle: "समग्र स्वास्थ्य स्कोर",
      soilStatus: "मिट्टी की स्थिति",
      weatherRisk: "मौसम जोखिम का स्तर",
      diseaseRisk: "रोग जोखिम का स्तर",
      recommendations: "कार्रवाई योग्य सिफारिशें",
      historyTitle: "स्वास्थ्य स्कोर इतिहास",
      emptyHistory: "कोई रिपोर्ट नहीं मिली।",
      healthyLabel: "स्वस्थ (कोई रोग नहीं)"
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getHealthHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.calculateCropHealth({
        crop_type: cropType,
        N,
        P,
        K,
        pH,
        moisture,
        temperature,
        humidity,
        disease_detected: diseaseDetected === 'Healthy' ? undefined : diseaseDetected
      }, language);
      setResult(res);
      loadHistory();
    } catch (err) {
      setError("Health evaluation failed. Check backend connections.");
    } finally {
      setLoading(false);
    }
  };

  // Prepopulate form with sample stats
  const applyHealthyPreset = () => {
    setN(75); setP(65); setK(60); setPh(6.8); setMoisture(70); setTemperature(26); setHumidity(50); setDiseaseDetected('Healthy');
  };
  const applyStressedPreset = () => {
    setN(20); setP(15); setK(22); setPh(5.1); setMoisture(20); setTemperature(38); setHumidity(75); setDiseaseDetected('Tomato Early Blight');
  };

  // Helper to determine circular gauge color
  const getGaugeColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500';
    if (score >= 55) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 55) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <Activity className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick presets helper */}
          <div className="glass-panel p-4 rounded-2xl flex justify-between gap-2">
            <button
              onClick={applyHealthyPreset}
              className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 border border-emerald-200/40 text-center"
            >
              Load Optimal Soil/Weather
            </button>
            <button
              onClick={applyStressedPreset}
              className="flex-1 py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-semibold text-red-800 border border-red-200/40 text-center"
            >
              Load Dry Acidic stressed
            </button>
          </div>

          <form onSubmit={handleCalculate} className="glass-panel p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {/* Crop */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.cropSelect}</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                >
                  {['Rice', 'Cotton', 'Maize', 'Tomato', 'Wheat', 'Groundnut'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Disease */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.diseaseInput}</label>
                <select
                  value={diseaseDetected}
                  onChange={(e) => setDiseaseDetected(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                >
                  <option value="Healthy">{t.healthyLabel}</option>
                  <option value="Tomato Early Blight">Tomato Early Blight</option>
                  <option value="Tomato Late Blight">Tomato Late Blight</option>
                  <option value="Potato Late Blight">Potato Late Blight</option>
                  <option value="Corn Common Rust">Corn Common Rust</option>
                  <option value="Apple Black Rot">Apple Black Rot</option>
                </select>
              </div>
            </div>

            {/* N-P-K */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.nitrogen}</label>
                <input
                  type="number"
                  value={N}
                  onChange={(e) => setN(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.phosphorus}</label>
                <input
                  type="number"
                  value={P}
                  onChange={(e) => setP(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.potassium}</label>
                <input
                  type="number"
                  value={K}
                  onChange={(e) => setK(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
            </div>

            {/* pH, Moisture, Temp, Humid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.ph}</label>
                <input
                  type="number"
                  step="0.1"
                  value={pH}
                  onChange={(e) => setPh(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.moist}</label>
                <input
                  type="number"
                  value={moisture}
                  onChange={(e) => setMoisture(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.temp}</label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.humid}</label>
                <input
                  type="number"
                  value={humidity}
                  onChange={(e) => setHumidity(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Activity className="h-5 w-5" />
              )}
              <span>{t.btnCalculate}</span>
            </button>
            {error && <p className="text-xs text-red-500 font-semibold text-center mt-2">{error}</p>}
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-primary-100/30 space-y-6 animate-pulse-subtle">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Score Gauge */}
                <div className="relative h-32 w-32 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" className="stroke-slate-100 fill-transparent" strokeWidth="8" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="54" 
                      className={`fill-transparent stroke-dasharray transition-all duration-1000 ${getGaugeColor(result.health_score)}`} 
                      strokeWidth="10" 
                      strokeDasharray="339.3"
                      strokeDashoffset={339.3 - (339.3 * result.health_score) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{result.health_score}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Index</span>
                  </div>
                </div>

                {/* Score Summary cards */}
                <div className="flex-grow grid grid-cols-3 gap-3 w-full">
                  {/* Soil */}
                  <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/60 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t.soilStatus}</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1.5">{result.soil_status}</span>
                  </div>
                  {/* Weather */}
                  <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/60 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t.weatherRisk}</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1.5">{result.weather_risk}</span>
                  </div>
                  {/* Disease */}
                  <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/60 text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t.diseaseRisk}</span>
                    <span className="text-sm font-bold text-slate-800 block mt-1.5">{result.disease_risk}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations list */}
              <div className="bg-primary-50/30 p-5 rounded-xl border border-primary-100/30 space-y-3">
                <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-600" />
                  <span>{t.recommendations}</span>
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start space-x-2 leading-relaxed">
                      <span className="h-1.5 w-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 h-72 border border-dashed border-slate-200">
              <Activity className="h-12 w-12 text-slate-200 mb-3 animate-pulse-subtle" />
              <p className="font-bold text-sm text-slate-600">{t.resultTitle}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Run the crop health calculation parameters to generate comprehensive diagnostics, risk matrices, and field advisories.</p>
            </div>
          )}

          {/* History */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-700 text-sm flex items-center space-x-2">
              <History className="h-4 w-4 text-slate-400" />
              <span>{t.historyTitle}</span>
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400">{t.emptyHistory}</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h._id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{h.crop_type} Health Scan</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Soil: {h.soil_status} • Weather Risk: {h.weather_risk} • {new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-black px-2.5 py-1 rounded-full text-[11px] ${getScoreBgColor(h.health_score)}`}>
                      {h.health_score}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
