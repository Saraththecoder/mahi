import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Crop, 
  Bug, 
  Map, 
  AlertOctagon, 
  Info,
  Droplet,
  History,
  CheckCircle
} from 'lucide-react';
import { api, PesticideResponse } from '../services/api';

interface PesticideCalculatorProps {
  language: 'en' | 'te' | 'hi';
}

const CROP_DISEASES: Record<string, string[]> = {
  Rice: ['Blast', 'Stem Borer'],
  Cotton: ['Bollworm', 'Aphids'],
  Tomato: ['Early Blight', 'Late Blight'],
  General: ['Other Pest']
};

export const PesticideCalculator: React.FC<PesticideCalculatorProps> = ({ language }) => {
  const [crop, setCrop] = useState('Rice');
  const [disease, setDisease] = useState('Blast');
  const [area, setArea] = useState<number>(1.0);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PesticideResponse | null>(null);
  const [history, setHistory] = useState<PesticideResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Pesticide Dosage Calculator",
      subtitle: "Acquire safe chemical dilution guidelines and exact volume requirements scaled to your field size",
      cropSelect: "Crop",
      diseaseSelect: "Target Disease/Pest",
      areaInput: "Farm Area (Acres)",
      btnCalculate: "Calculate Dosage",
      resultTitle: "Pesticide Prescription",
      pesticideName: "Recommended Chemical",
      pesticideQty: "Pesticide Quantity",
      waterQty: "Water Dilution Quantity",
      frequency: "Spraying Schedule",
      safety: "Safety Precautions",
      historyTitle: "Pesticide Logs",
      areaHelper: "Enter decimal acreage (e.g. 2.5 acres)",
      emptyHistory: "No calculations saved."
    },
    te: {
      title: "పురుగుమందుల మోతాదు గణన",
      subtitle: "మీ పొలం విస్తీర్ణానికి సరిపోయే రసాయన మోతాదు మరియు నీటి నిష్పత్తిని లెక్కించండి",
      cropSelect: "పంట",
      diseaseSelect: "వచ్చిన తెగులు / పురుగు",
      areaInput: "పంట విస్తీర్ణం (ఎకరాలు)",
      btnCalculate: "మోతాదు లెక్కించు",
      resultTitle: "పురుగుమందు సిఫార్సు",
      pesticideName: "సిఫార్సు చేసిన రసాయనం",
      pesticideQty: "పురుగుమందు పరిమాణం",
      waterQty: "కలపవలసిన నీటి పరిమాణం",
      frequency: "పిచికారీ షెడ్యూల్",
      safety: "వ్యక్తిగత రక్షణ జాగ్రత్తలు",
      historyTitle: "గత గణనల చరిత్ర",
      areaHelper: "ఎకరాల సంఖ్యను నమోదు చేయండి (ఉదా: 2.5 ఎకరాలు)",
      emptyHistory: "ఎటువంటి పాత రికార్డులు లేవు."
    },
    hi: {
      title: "कीटनाशक खुराक कैलकुलेटर",
      subtitle: "अपने खेत के आकार के अनुसार रासायनिक कीटनाशकों की सटीक मात्रा और पानी के घोल की गणना करें",
      cropSelect: "फसल",
      diseaseSelect: "लक्षित बीमारी / कीट",
      areaInput: "खेत का क्षेत्रफल (एकड़)",
      btnCalculate: "खुराक की गणना करें",
      resultTitle: "कीटनाशक पर्चा (सिफारिश)",
      pesticideName: "अनुशंसित रसायन",
      pesticideQty: "कीटनाशक मात्रा",
      waterQty: "घोल के लिए पानी की मात्रा",
      frequency: "छिड़काव समय-सारणी",
      safety: "सुरक्षा सावधानियां",
      historyTitle: "कीटनाशक लॉग इतिहास",
      areaHelper: "एकड़ दर्ज करें (जैसे 2.5 एकड़)",
      emptyHistory: "कोई लॉग नहीं मिला।"
    }
  };

  const t = translations[language];

  // Update disease selection when crop changes
  useEffect(() => {
    const diseases = CROP_DISEASES[crop] || CROP_DISEASES['General'];
    setDisease(diseases[0]);
  }, [crop]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getPesticideHistory();
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
      const res = await api.calculatePesticide({
        crop,
        disease,
        area
      }, language);
      setResult(res);
      loadHistory();
    } catch (err) {
      setError("Dosage calculation failed. Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <FlaskConical className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form panel */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleCalculate} className="glass-panel p-6 rounded-2xl space-y-4 shadow-sm">
            {/* Crop */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                <span className="flex items-center space-x-1">
                  <Crop className="h-3 w-3" />
                  <span>{t.cropSelect}</span>
                </span>
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-slate-800"
              >
                {Object.keys(CROP_DISEASES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Disease */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                <span className="flex items-center space-x-1">
                  <Bug className="h-3 w-3" />
                  <span>{t.diseaseSelect}</span>
                </span>
              </label>
              <select
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-slate-800"
              >
                {(CROP_DISEASES[crop] || CROP_DISEASES['General']).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                <span className="flex items-center space-x-1">
                  <Map className="h-3 w-3" />
                  <span>{t.areaInput}</span>
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:border-primary-400 focus:outline-none"
              />
              <p className="text-[9px] text-slate-400 italic mt-1">{t.areaHelper}</p>
            </div>

            <button
              type="submit"
              disabled={loading || area <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-md hover:from-primary-700 hover:to-primary-800 transition-all"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FlaskConical className="h-5 w-5" />
              )}
              <span>{t.btnCalculate}</span>
            </button>
            {error && <p className="text-xs text-red-500 font-semibold text-center mt-2">{error}</p>}
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-primary-100/30 space-y-5 animate-pulse-subtle">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                  {result.crop} • {result.area} Acres
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-2">{t.resultTitle}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chem name */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.pesticideName}</span>
                  <p className="text-sm font-bold text-primary-700 mt-1">{result.pesticide_name}</p>
                </div>
                {/* Chem Qty */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.pesticideQty}</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{result.pesticide_quantity}</p>
                </div>
                {/* Water Qty */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    <span className="flex items-center space-x-1">
                      <Droplet className="h-3 w-3 text-blue-500" />
                      <span>{t.waterQty}</span>
                    </span>
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{result.water_quantity}</p>
                </div>
                {/* Freq */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t.frequency}</span>
                  <p className="text-sm font-semibold text-slate-700 mt-1 leading-snug">{result.frequency}</p>
                </div>
              </div>

              {/* Safety instructions */}
              <div className="bg-red-50/30 p-5 rounded-xl border border-red-100/30 space-y-2">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertOctagon className="h-4 w-4 text-red-500" />
                  <span>{t.safety}</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.safety_instructions}
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-slate-200">
              <FlaskConical className="h-12 w-12 text-slate-200 mb-3" />
              <p className="font-bold text-sm text-slate-600">{t.resultTitle}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">Provide crop species, infestation types, and agricultural sizing to acquire dilution schedules.</p>
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
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                {history.map((h) => (
                  <div key={h._id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{h.pesticide_name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{h.crop} • {h.disease} • {h.area} Acres • {new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                      {h.pesticide_quantity} / {h.water_quantity}
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
