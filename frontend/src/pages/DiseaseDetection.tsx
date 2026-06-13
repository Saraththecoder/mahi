import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Leaf, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  ClipboardList, 
  Loader2,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { api, DiseaseResponse } from '../services/api';

interface DiseaseDetectionProps {
  language: 'en' | 'te' | 'hi';
}

export const DiseaseDetection: React.FC<DiseaseDetectionProps> = ({ language }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseResponse | null>(null);
  const [history, setHistory] = useState<DiseaseResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Crop Disease Detection",
      subtitle: "Scan crop leaves to detect infections, symptoms, and treatment plans",
      uploadTitle: "Upload Leaf Image",
      uploadClick: "Click to upload",
      uploadDrag: "or drag and drop here",
      uploadSub: "Supports JPG, JPEG, PNG (Max 5MB)",
      btnScan: "Analyze Crop Health",
      results: "Diagnostic Results",
      confidence: "Confidence Score",
      symptoms: "Observed Symptoms",
      treatment: "Cure & Treatment Recommendations",
      prevention: "Prevention Guidelines",
      historyTitle: "Scan History Logs",
      mockSamples: "Quick Mock Testing Samples",
      testEarlyBlight: "Tomato Early Blight",
      testLateBlight: "Potato Late Blight",
      testRust: "Corn Rust",
      testHealthy: "Healthy Tomato Leaf",
      confidenceSub: "Probability match of the classification CNN",
      savingLog: "Saving report to central ledger...",
      emptyHistory: "No diagnostic reports found."
    },
    te: {
      title: "పంట తెగులు గుర్తింపు",
      subtitle: "తెగుళ్ళు, లక్షణాలు మరియు నివారణ పద్ధతులను తెలుసుకోవడానికి ఆకును స్కాన్ చేయండి",
      uploadTitle: "ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి",
      uploadClick: "అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
      uploadDrag: "లేదా ఇక్కడ లాగి వదలండి",
      uploadSub: "JPG, JPEG, PNG ఫార్మాట్లు (గరిష్టంగా 5MB)",
      btnScan: "ఆకును విశ్లేషించు",
      results: "నిర్ధారణ ఫలితాలు",
      confidence: "ఖచ్చితత్వ శాతం (కాన్ఫిడెన్స్)",
      symptoms: "గమనించిన లక్షణాలు",
      treatment: "చికిత్స నివారణ పద్ధతులు",
      prevention: "ముందస్తు జాగ్రత్తలు",
      historyTitle: "గత నివేదికల చరిత్ర",
      mockSamples: "త్వరిత పరీక్షా నమూనాలు",
      testEarlyBlight: "టొమాటో ఆకుమచ్చ తెగులు",
      testLateBlight: "బంగాళాదుంప లేట్ బ్లైట్",
      testRust: "మొక్కజొన్న తుప్పు తెగులు",
      testHealthy: "ఆరోగ్యకరమైన ఆకు",
      confidenceSub: "శీలీంద్రనాశిని నమూనా సరిపోలిక సంభావ్యత",
      savingLog: "కేంద్ర సర్వర్లో నివేదిక భద్రపరుస్తోంది...",
      emptyHistory: "ఎటువంటి పాత నివేదికలు లేవు."
    },
    hi: {
      title: "फसल रोग पहचान",
      subtitle: "संक्रमणों, लक्षणों और उपचार योजनाओं का पता लगाने के लिए फसल की पत्तियों को स्कैन करें",
      uploadTitle: "पत्ती की छवि अपलोड करें",
      uploadClick: "अपलोड करने के लिए क्लिक करें",
      uploadDrag: "या यहां खींचें और छोड़ें",
      uploadSub: "JPG, JPEG, PNG समर्थन (अधिकतम 5MB)",
      btnScan: "फसल स्वास्थ्य का विश्लेषण करें",
      results: "निदान परिणाम",
      confidence: "आत्मविश्वास स्कोर (सटीकता)",
      symptoms: "देखे गए लक्षण",
      treatment: "इलाज और उपचार सिफारिशें",
      prevention: "रोकथाम दिशानिर्देश",
      historyTitle: "स्कैन इतिहास लॉग",
      mockSamples: "त्वरित परीक्षण नमूने",
      testEarlyBlight: "टमाटर का अगेती रोग",
      testLateBlight: "आलू का पछेती झुलसा",
      testRust: "मक्के का गेरूआ रोग",
      testHealthy: "स्वस्थ पत्ती",
      confidenceSub: "वर्गीकरण सीएनएन की मिलान संभावना",
      savingLog: "केंद्रीय बहीखाता में रिपोर्ट सहेजी जा रही है...",
      emptyHistory: "कोई निदान रिपोर्ट नहीं मिली।"
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getDiseaseHistory();
      setHistory(data);
    } catch (err) {
      console.error("Error loading scan history", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.detectDisease(selectedFile, language);
      setResult(res);
      loadHistory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to classify image. Ensure the backend server is running.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick testing using mock files
  const triggerMockTest = async (diseaseName: string, fileNameKeyword: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Create a dummy image blob (red square)
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = "#40966d";
        ctx.fillRect(0, 0, 100, 100);
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const mockFile = new File([blob], `${fileNameKeyword}_leaf.jpg`, { type: 'image/jpeg' });
        setSelectedFile(mockFile);
        setPreviewUrl(canvas.toDataURL());
        
        // Scan directly
        const res = await api.detectDisease(mockFile, language);
        setResult(res);
        loadHistory();
        setLoading(false);
      }, 'image/jpeg');
    } catch (err) {
      setError("Mock testing failed. Connection to server lost.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5 rounded-2xl flex flex-col items-center">
            <h3 className="font-bold text-slate-700 text-sm w-full mb-3 self-start">{t.uploadTitle}</h3>
            
            <label className="w-full flex flex-col items-center px-4 py-8 bg-slate-50 text-slate-400 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100/50 hover:border-primary-400 transition-colors group">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-44 object-contain rounded-lg shadow-sm" />
              ) : (
                <div className="flex flex-col items-center text-center space-y-2">
                  <Upload className="h-10 w-10 text-slate-300 group-hover:text-primary-500 transition-colors" />
                  <span className="font-semibold text-slate-600 text-sm">{t.uploadClick}</span>
                  <span className="text-xs">{t.uploadDrag}</span>
                  <span className="text-xs text-slate-300 mt-2">{t.uploadSub}</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/jpg,.jpeg,.jpg,.png" onChange={handleFileChange} />
            </label>

            {selectedFile && (
              <div className="w-full mt-4 flex items-center justify-between p-3 bg-primary-50 rounded-xl text-primary-900 border border-primary-100">
                <div className="flex items-center space-x-2 truncate">
                  <FileImage className="h-5 w-5 text-primary-600 shrink-0" />
                  <span className="text-xs font-semibold truncate">{selectedFile.name}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-200 px-2 py-0.5 rounded text-primary-900 shrink-0">
                  Ready
                </span>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={!selectedFile || loading}
              className={`
                w-full mt-4 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-md
                ${selectedFile && !loading
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing Image...</span>
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5" />
                  <span>{t.btnScan}</span>
                </>
              )}
            </button>
            {error && <p className="text-xs font-semibold text-red-500 mt-2 w-full text-center">{error}</p>}
          </div>

          {/* Quick Mock samples */}
          <div className="glass-panel p-5 rounded-2xl">
            <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">{t.mockSamples}</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => triggerMockTest('Tomato Early Blight', 'early_blight')}
                className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-red-50 border border-red-200/40 text-red-800 hover:bg-red-100/50 text-left truncate flex items-center space-x-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                <span className="truncate">{t.testEarlyBlight}</span>
              </button>
              <button 
                onClick={() => triggerMockTest('Potato Late Blight', 'late_blight')}
                className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-200/40 text-amber-800 hover:bg-amber-100/50 text-left truncate flex items-center space-x-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                <span className="truncate">{t.testLateBlight}</span>
              </button>
              <button 
                onClick={() => triggerMockTest('Corn Rust', 'rust')}
                className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-orange-50 border border-orange-200/40 text-orange-800 hover:bg-orange-100/50 text-left truncate flex items-center space-x-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                <span className="truncate">{t.testRust}</span>
              </button>
              <button 
                onClick={() => triggerMockTest('Healthy Leaf', 'healthy')}
                className="py-2.5 px-3 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-200/40 text-emerald-800 hover:bg-emerald-100/50 text-left truncate flex items-center space-x-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                <span className="truncate">{t.testHealthy}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results / History Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-primary-100/30 space-y-5 animate-pulse-subtle">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                    {result.crop}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">{result.disease_name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">{t.confidence}</span>
                  <span className="text-2xl font-black text-primary-700">{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-600 h-full rounded-full transition-all duration-500" style={{ width: `${result.confidence * 100}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{t.confidenceSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Symptoms */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                  <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>{t.symptoms}</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {result.symptoms.map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start space-x-1.5">
                        <span className="h-1 w-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Treatment */}
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50">
                  <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <Activity className="h-4 w-4 text-primary-600" />
                    <span>{t.treatment}</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {result.treatment.map((t, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start space-x-1.5">
                        <span className="h-1 w-1 bg-primary-600 rounded-full mt-1.5 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prevention */}
              <div className="bg-primary-50/30 p-4 rounded-xl border border-primary-100/30">
                <h4 className="font-bold text-xs text-primary-800 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary-600" />
                  <span>{t.prevention}</span>
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.prevention.map((p, idx) => (
                    <li key={idx} className="text-xs text-primary-950 flex items-start space-x-1.5">
                      <span className="h-1.5 w-1.5 bg-primary-500 rounded-full mt-1.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center text-slate-400 h-64 border border-dashed border-slate-200">
              <Leaf className="h-12 w-12 text-slate-200 mb-3" />
              <p className="font-bold text-sm text-slate-600">{t.results}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">No analysis active. Upload leaf details or run a sample test to generate a diagnosis.</p>
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
                      <h4 className="font-bold text-slate-800">{h.disease_name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{h.crop} • {new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {Math.round(h.confidence * 100)}% match
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
