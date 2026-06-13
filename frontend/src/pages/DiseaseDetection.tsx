import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  // Stable ref — never re-created, so the file dialog always opens reliably
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const applyFile = useCallback((file: File) => {
    // Revoke previous object URL to free memory
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      applyFile(e.target.files[0]);
      // Reset so re-selecting the same file still fires onChange
      e.target.value = '';
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) applyFile(file);
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
  const triggerMockTest = async (_diseaseName: string, fileNameKeyword: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw a simple leaf-like green gradient for mock
        const grad = ctx.createRadialGradient(100, 100, 10, 100, 100, 100);
        grad.addColorStop(0, '#4ade80');
        grad.addColorStop(1, '#166534');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 200, 200);
      }

      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          try {
            if (!blob) throw new Error('Canvas blob creation failed');
            const mockFile = new File([blob], `${fileNameKeyword}_leaf.jpg`, { type: 'image/jpeg' });
            setSelectedFile(mockFile);
            setPreviewUrl(canvas.toDataURL());
            const res = await api.detectDisease(mockFile, language);
            setResult(res);
            loadHistory();
            resolve();
          } catch (e) { reject(e); }
        }, 'image/jpeg');
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mock testing failed. Connection to server lost.';
      setError(message);
    } finally {
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

            {/* Hidden file input — lives outside the drop zone so re-renders never block the dialog */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/jpg,.jpeg,.jpg,.png"
              onChange={handleFileChange}
            />

            {/* Drop zone — plain div triggers inputRef.click() on click */}
            <div
              role="button"
              tabIndex={0}
              onClick={openFilePicker}
              onKeyDown={(e) => e.key === 'Enter' && openFilePicker()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full flex flex-col items-center px-4 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none
                ${ isDragging
                  ? 'border-primary-500 bg-primary-50 scale-[1.01]'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 hover:border-primary-400'
                }`}
            >
              {previewUrl ? (
                <div className="relative group/preview w-full flex flex-col items-center">
                  <img src={previewUrl} alt="Preview" className="h-44 object-contain rounded-lg shadow-sm" />
                  <span className="mt-2 text-[11px] font-semibold text-primary-600 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                    Click to change image
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2 text-slate-400">
                  <Upload className={`h-10 w-10 transition-colors ${isDragging ? 'text-primary-500' : 'text-slate-300'}`} />
                  <span className="font-semibold text-slate-600 text-sm">{t.uploadClick}</span>
                  <span className="text-xs">{t.uploadDrag}</span>
                  <span className="text-xs text-slate-300 mt-2">{t.uploadSub}</span>
                </div>
              )}
            </div>

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
