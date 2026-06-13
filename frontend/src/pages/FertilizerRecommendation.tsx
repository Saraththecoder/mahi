import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Droplets, 
  Sliders, 
  Clock, 
  CheckCircle,
  HelpCircle,
  TrendingDown,
  RefreshCw,
  ClipboardList
} from 'lucide-react';
import { api, FertilizerResponse } from '../services/api';

interface FertilizerRecommendationProps {
  language: 'en' | 'te' | 'hi';
}

export const FertilizerRecommendation: React.FC<FertilizerRecommendationProps> = ({ language }) => {
  const [cropType, setCropType] = useState('Cotton');
  const [N, setN] = useState<number>(30);
  const [P, setP] = useState<number>(25);
  const [K, setK] = useState<number>(40);
  const [pH, setPh] = useState<number>(6.5);
  const [moisture, setMoisture] = useState<number>(45);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FertilizerResponse | null>(null);
  const [history, setHistory] = useState<FertilizerResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Fertilizer Recommendation System",
      subtitle: "Optimize crop yields using N-P-K soil analysis and agricultural model predictions",
      cropSelect: "Crop Type",
      nitrogen: "Nitrogen (N)",
      phosphorus: "Phosphorus (P)",
      potassium: "Potassium (K)",
      ph: "Soil pH (0.0 - 14.0)",
      moist: "Soil Moisture (%)",
      btnCalculate: "Calculate Fertilizer Plan",
      resultTitle: "Prescribed Fertilization Plan",
      fertilizer: "Recommended Fertilizer",
      quantity: "Required Quantity",
      instructions: "Application Instructions",
      historyTitle: "Soil Recommendation History",
      presetsTitle: "Typical Soil Testing Templates",
      cottonDry: "Cotton on Dry Sandy Soil",
      riceAcidic: "Rice on Acidic Wet Soil",
      tomatoAlkaline: "Tomato on Alkaline Soil",
      maizeBalanced: "Maize on Optimal Soil",
      unitSub: "Nutrient content in mg/kg or ppm",
      emptyHistory: "No soil tests found."
    },
    te: {
      title: "ఎరువుల సిఫార్సు విధానం",
      subtitle: "మట్టిలోని నత్రజని, భాస్వరం, పొటాష్ ఆధారంగా పంటకు కావలసిన ఎరువుల నివేదిక పొందండి",
      cropSelect: "పంట రకం",
      nitrogen: "నత్రజని (N)",
      phosphorus: "భాస్వరం (P)",
      potassium: "పొటాషియం (K)",
      ph: "మట్టి పి.హెచ్ (pH)",
      moist: "నేల తేమ శాతం (%)",
      btnCalculate: "ఎరువుల గణన చేయి",
      resultTitle: "సిఫార్సు చేసిన ఎరువుల నివేదిక",
      fertilizer: "వాడవలసిన ఎరువు",
      quantity: "కావలసిన పరిమాణం",
      instructions: "వాడే విధానం మరియు సమయం",
      historyTitle: "గత సిఫార్సుల చరిత్ర",
      presetsTitle: "సాధారణ మట్టి పరీక్షా నమూనాలు",
      cottonDry: "ఎండిన ఇసుక నేలలో పత్తి",
      riceAcidic: "ఆమ్ల తడి నేలలో వరి",
      tomatoAlkaline: "క్షార నేలలో టొమాటో",
      maizeBalanced: "సమతుల్య నేలలో మొక్కజొన్న",
      unitSub: "పోషక విలువలు mg/kg లేదా ppm లో",
      emptyHistory: "ఎటువంటి మట్టి పరీక్షలు లేవు."
    },
    hi: {
      title: "उर्वरक सिफारिश प्रणाली",
      subtitle: "मिट्टी के एन-पी-के विश्लेषण और फसल प्रकार के आधार पर अनुकूलतम खाद मात्रा जानें",
      cropSelect: "फसल का प्रकार",
      nitrogen: "नाइट्रोजन (N)",
      phosphorus: "फास्फोरस (P)",
      potassium: "पोटेशियम (K)",
      ph: "मिट्टी का पीएच (pH)",
      moist: "मिट्टी की नमी (%)",
      btnCalculate: "उर्वरक योजना की गणना करें",
      resultTitle: "अनुशंसित उर्वरक योजना",
      fertilizer: "अनुशंसित उर्वरक",
      quantity: "आवश्यक मात्रा",
      instructions: "उपयोग करने के निर्देश",
      historyTitle: "मिट्टी परीक्षण इतिहास",
      presetsTitle: "सामान्य मिट्टी परीक्षण टेम्पलेट",
      cottonDry: "सूखी रेतीली मिट्टी पर कपास",
      riceAcidic: "अम्लीय गीली मिट्टी पर धान",
      tomatoAlkaline: "क्षारीय मिट्टी पर टमाटर",
      maizeBalanced: "इष्टतम मिट्टी पर मक्का",
      unitSub: "पोषक तत्व तत्व mg/kg या ppm में",
      emptyHistory: "कोई मिट्टी परीक्षण रिपोर्ट नहीं मिली।"
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getFertilizerHistory();
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
      const res = await api.recommendFertilizer({
        crop_type: cropType,
        N,
        P,
        K,
        pH,
        moisture
      }, language);
      setResult(res);
      loadHistory();
    } catch (err) {
      setError("Failed to query recommendation. Check if backend is active.");
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (c: string, n: number, p: number, k: number, phVal: number, m: number) => {
    setCropType(c);
    setN(n);
    setP(p);
    setK(k);
    setPh(phVal);
    setMoisture(m);
    setResult(null);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form and Template Inputs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Templates */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Sliders className="h-4 w-4 text-slate-400" />
              <span>{t.presetsTitle}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => applyTemplate('Cotton', 15, 20, 45, 6.2, 18)}
                className="p-2 bg-amber-50 hover:bg-amber-100/60 rounded-xl text-left border border-amber-200/40 text-[10px] font-semibold text-amber-900 leading-tight"
              >
                {t.cottonDry}
              </button>
              <button
                onClick={() => applyTemplate('Rice', 20, 18, 25, 4.8, 85)}
                className="p-2 bg-blue-50 hover:bg-blue-100/60 rounded-xl text-left border border-blue-200/40 text-[10px] font-semibold text-blue-900 leading-tight"
              >
                {t.riceAcidic}
              </button>
              <button
                onClick={() => applyTemplate('Tomato', 45, 50, 20, 8.4, 60)}
                className="p-2 bg-red-50 hover:bg-red-100/60 rounded-xl text-left border border-red-200/40 text-[10px] font-semibold text-red-900 leading-tight"
              >
                {t.tomatoAlkaline}
              </button>
              <button
                onClick={() => applyTemplate('Maize', 65, 40, 55, 6.8, 55)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100/60 rounded-xl text-left border border-emerald-200/40 text-[10px] font-semibold text-emerald-900 leading-tight"
              >
                {t.maizeBalanced}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCalculate} className="glass-panel p-6 rounded-2xl space-y-4 shadow-sm">
            {/* Crop selection */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t.cropSelect}</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-slate-800"
              >
                {['Rice', 'Cotton', 'Maize', 'Tomato', 'Wheat', 'Groundnut'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
            <p className="text-[9px] text-slate-400 italic mt-0">{t.unitSub}</p>

            {/* pH & Moisture */}
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <FlaskConical className="h-5 w-5" />}
              <span>{t.btnCalculate}</span>
            </button>
            {error && <p className="text-xs text-red-500 font-semibold text-center mt-2">{error}</p>}
          </form>
        </div>

        {/* Results / History Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-primary-100/30 space-y-5 animate-pulse-subtle">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                  {result.crop_type} Prescriptions
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-2">{t.resultTitle}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fertilizer */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.fertilizer}</span>
                  <p className="text-md font-bold text-primary-700 mt-1">{result.recommended_fertilizer}</p>
                </div>
                {/* Qty */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.quantity}</span>
                  <p className="text-md font-bold text-slate-800 mt-1">{result.quantity}</p>
                </div>
              </div>

              {/* Application instructions */}
              <div className="bg-primary-50/30 p-5 rounded-xl border border-primary-100/30 space-y-2">
                <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-primary-600" />
                  <span>{t.instructions}</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.instructions}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-slate-200">
              <FlaskConical className="h-12 w-12 text-slate-200 mb-3" />
              <p className="font-bold text-sm text-slate-600">{t.resultTitle}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">No analysis has been evaluated yet. Complete the soil chemistry parameters to compute the NPK advice.</p>
            </div>
          )}

          {/* History */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-700 text-sm flex items-center space-x-2">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              <span>{t.historyTitle}</span>
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400">{t.emptyHistory}</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h._id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{h.recommended_fertilizer}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{h.crop_type} • N:{h.N} P:{h.P} K:{h.K} • {new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {h.quantity}
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
