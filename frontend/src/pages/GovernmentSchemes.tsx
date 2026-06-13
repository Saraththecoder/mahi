import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  HelpCircle, 
  Gift, 
  Layers, 
  ExternalLink,
  Loader2
} from 'lucide-react';
import { api, SchemeResponse } from '../services/api';

interface GovernmentSchemesProps {
  language: 'en' | 'te' | 'hi';
}

export const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({ language }) => {
  const [schemes, setSchemes] = useState<SchemeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const translations = {
    en: {
      title: "Government Welfare Schemes",
      subtitle: "Browse state and central agricultural grants, financial credits, and crop insurance policies",
      allBtn: "All Schemes",
      categoryTitle: "Categories",
      eligibility: "Eligibility Criteria",
      benefits: "Benefits & Subsidies",
      documents: "Required Documents",
      process: "How to Apply",
      visitWebsite: "Visit Official Portal",
      noSchemes: "No schemes found for this selection. Seed the database to view defaults.",
      loadingSchemes: "Querying government ledger...",
    },
    te: {
      title: "ప్రభుత్వ సంక్షేమ పథకాలు",
      subtitle: "కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ వ్యవసాయ సబ్సిడీలు, రుణాలు మరియు బీమా పథకాలు",
      allBtn: "అన్ని పథకాలు",
      categoryTitle: "వర్గాలు",
      eligibility: "అర్హత నిబంధనలు",
      benefits: "ప్రయోజనాలు & సబ్సిడీలు",
      documents: "కావలసిన పత్రాలు",
      process: "దరఖాస్తు విధానం",
      visitWebsite: "అధికారిక వెబ్‌సైట్ సందర్శించండి",
      noSchemes: "ఎటువంటి పథకాలు లేవు. దయచేసి డేటాబేస్ సీడ్ చేయండి.",
      loadingSchemes: "ప్రభుత్వ నివేదికలు సేకరిస్తోంది...",
    },
    hi: {
      title: "सरकारी कल्याणकारी योजनाएं",
      subtitle: "राज्य और केंद्र सरकार के कृषि अनुदान, वित्तीय ऋण और फसल बीमा पॉलिसियां देखें",
      allBtn: "सभी योजनाएं",
      categoryTitle: "श्रेणियाँ",
      eligibility: "पात्रता मानदंड",
      benefits: "लाभ और सब्सिडी",
      documents: "आवश्यक दस्तावेज",
      process: "आवेदन कैसे करें",
      visitWebsite: "आधिकारिक वेबसाइट पर जाएं",
      noSchemes: "कोई योजना नहीं मिली। कृपया डेटाबेस सीड करें।",
      loadingSchemes: "योजनाओं की जानकारी खोजी जा रही है...",
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadSchemes();
  }, [activeCategory, language]);

  const loadSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getGovernmentSchemes(activeCategory, language);
      setSchemes(data);
    } catch (err) {
      setError("Failed to fetch schemes list. Ensure DB is seeded and backend is online.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSchemeId(prev => prev === id ? null : id);
  };

  // Unique categories gathered from templates
  const categories = [
    { id: 'Income Support', label: language === 'te' ? 'పెట్టుబడి సహాయం' : language === 'hi' ? 'आय सहायता' : 'Income Support' },
    { id: 'Crop Insurance', label: language === 'te' ? 'పంట బీమా' : language === 'hi' ? 'फसल बीमा' : 'Crop Insurance' },
    { id: 'Credit and Loan', label: language === 'te' ? 'వ్యవసాయ రుణాలు' : language === 'hi' ? 'ऋण सहायता' : 'Credit and Loan' },
    { id: 'State Welfare', label: language === 'te' ? 'రాష్ట్ర సంక్షేమం' : language === 'hi' ? 'राज्य कल्याण' : 'State Welfare' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <Landmark className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 pb-1 shrink-0">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${activeCategory === null ? 'bg-primary-600 text-white border-primary-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          {t.allBtn}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 ${activeCategory === c.id ? 'bg-primary-600 text-white border-primary-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin text-primary-600 mb-3" />
          <p className="text-sm font-semibold">{t.loadingSchemes}</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-xs font-semibold text-red-500 mb-2">{error}</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-400">
          <Landmark className="h-12 w-12 mx-auto text-slate-200 mb-3" />
          <p className="text-sm font-semibold">{t.noSchemes}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {schemes.map((scheme) => {
            const isExpanded = expandedSchemeId === scheme._id;
            return (
              <div 
                key={scheme._id}
                className="glass-panel rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm hover:shadow transition-shadow duration-300"
              >
                {/* Expandable Header bar */}
                <button
                  onClick={() => toggleExpand(scheme._id)}
                  className="w-full p-5 flex justify-between items-center text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-tr from-primary-600 to-primary-700 rounded-xl text-white shadow-sm">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                        {scheme.category}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm sm:text-md mt-1">{scheme.title}</h3>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Expanded Details body */}
                {isExpanded && (
                  <div className="px-5 pb-6 border-t border-slate-100/80 bg-slate-50/30 space-y-6 pt-5 animate-pulse-subtle">
                    {/* Description */}
                    <div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {scheme.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Eligibility list */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200/50 space-y-3">
                        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                          <HelpCircle className="h-4 w-4 text-amber-500" />
                          <span>{t.eligibility}</span>
                        </h4>
                        <ul className="space-y-2">
                          {scheme.eligibility.map((el, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{el}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Benefits list */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200/50 space-y-3">
                        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                          <Gift className="h-4 w-4 text-primary-600" />
                          <span>{t.benefits}</span>
                        </h4>
                        <ul className="space-y-2">
                          {scheme.benefits.map((ben, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed font-medium">{ben}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Required Documents */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200/50 space-y-3">
                        <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{t.documents}</span>
                        </h4>
                        <ul className="space-y-2">
                          {scheme.required_documents.map((doc, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{doc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Application Process and Website link */}
                      <div className="bg-white p-4.5 rounded-xl border border-slate-200/50 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                            <Layers className="h-4 w-4 text-primary-600" />
                            <span>{t.process}</span>
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {scheme.application_process}
                          </p>
                        </div>

                        <a 
                          href={scheme.official_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="py-3 px-4 rounded-xl border border-primary-200 bg-primary-50/50 hover:bg-primary-50 text-primary-800 text-xs font-bold flex items-center justify-center space-x-2 transition-all self-stretch text-center"
                        >
                          <span>{t.visitWebsite}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
