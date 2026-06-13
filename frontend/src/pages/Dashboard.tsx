import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend 
} from 'recharts';
import { 
  Heart, 
  CloudRain, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  Droplets
} from 'lucide-react';
import { api, HealthResponse, DiseaseResponse } from '../services/api';

interface DashboardProps {
  language: 'en' | 'te' | 'hi';
  setActivePage: (page: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ language, setActivePage }) => {
  const [healthHistory, setHealthHistory] = useState<HealthResponse[]>([]);
  const [diseaseHistory, setDiseaseHistory] = useState<DiseaseResponse[]>([]);
  const [stats, setStats] = useState({
    avgHealth: 85,
    activeDiseases: 0,
    spraySuitability: 'Excellent',
    rainProb: 15
  });

  const translations = {
    en: {
      title: "Farmer Dashboard",
      subtitle: "Real-time crop intelligence & analytics",
      healthCard: "Avg Crop Health",
      sprayCard: "Spray Suitability",
      diseaseCard: "Active Diseases",
      rainCard: "Rain Forecast",
      chartTitle1: "Crop Health Index Trend",
      chartTitle2: "Soil Nutrient & Moisture Breakdown",
      recentActivity: "Recent Disease Diagnoses",
      viewAll: "View details",
      emptyHistory: "No diagnostic history found. Please scan a leaf.",
      quickActions: "Quick Actions",
      diagnoseAction: "Diagnose Leaf Disease",
      fertilizerAction: "Get Fertilizer Plan",
      weatherAction: "Check Spray Advisory",
      noData: "No data logs available"
    },
    te: {
      title: "రైతు డ్యాష్‌బోర్డ్",
      subtitle: "పంటల సమాచారం & విశ్లేషణలు",
      healthCard: "సగటు పంట ఆరోగ్యం",
      sprayCard: "పిచికారీ అనుకూలత",
      diseaseCard: "గుర్తించిన తెగుళ్ళు",
      rainCard: "వర్ష సూచన",
      chartTitle1: "పంట ఆరోగ్య సూచిక ట్రెండ్",
      chartTitle2: "నేల పోషకాలు & తేమ నివేదిక",
      recentActivity: "ఇటీవలి తెగుళ్ల నిర్ధారణలు",
      viewAll: "వివరాలు చూడండి",
      emptyHistory: "ఎటువంటి తెగుళ్ల నిర్ధారణలు లేవు. దయచేసి ఆకును స్కాన్ చేయండి.",
      quickActions: "త్వరిత చర్యలు",
      diagnoseAction: "ఆకు తెగులు గుర్తింపు",
      fertilizerAction: "ఎరువుల ప్రణాళిక",
      weatherAction: "వాతావరణ పిచికారీ సలహా",
      noData: "ఎటువంటి సమాచారం లేదు"
    },
    hi: {
      title: "किसान डैशबोर्ड",
      subtitle: "वास्तविक समय फसल खुफिया और विश्लेषण",
      healthCard: "औसत फसल स्वास्थ्य",
      sprayCard: "छिड़काव उपयुक्तता",
      diseaseCard: "सक्रिय रोग संख्या",
      rainCard: "बारिश का पूर्वानुमान",
      chartTitle1: "फसल स्वास्थ्य सूचकांक प्रवृत्ति",
      chartTitle2: "मिट्टी के पोषक तत्व और नमी विवरण",
      recentActivity: "हाल के रोग निदान",
      viewAll: "विवरण देखें",
      emptyHistory: "कोई निदान इतिहास नहीं मिला। कृपया पत्ती को स्कैन करें।",
      quickActions: "त्वरित कार्रवाई",
      diagnoseAction: "पत्ती रोग पहचान",
      fertilizerAction: "उर्वरक योजना प्राप्त करें",
      weatherAction: "मौसम छिड़काव सलाह देखें",
      noData: "कोई डेटा लॉग उपलब्ध नहीं है"
    }
  };

  const t = translations[language];

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [health, diseases, weather] = await Promise.all([
          api.getHealthHistory().catch(() => [] as HealthResponse[]),
          api.getDiseaseHistory().catch(() => [] as DiseaseResponse[]),
          api.getWeatherAdvisory(16.3067, 80.4365, language).catch(() => null)
        ]);

        setHealthHistory(health);
        setDiseaseHistory(diseases);

        // Compute averages
        const avg = health.length > 0
          ? Math.round(health.reduce((sum, h) => sum + h.health_score, 0) / health.length)
          : 85;

        // Active diseases (not healthy in last 7 days)
        const active = diseases.filter(d => d.disease_name.toLowerCase().indexOf('healthy') === -1).length;

        setStats({
          avgHealth: avg,
          activeDiseases: active,
          spraySuitability: weather ? weather.spray_suitability : 'Excellent',
          rainProb: weather ? weather.rain_probability : 10
        });
      } catch (err) {
        console.error("Failed loading dashboard data", err);
      }
    }
    loadDashboardData();
  }, [language]);

  // Mock charts data fallback if API is empty
  const defaultHealthTrend = healthHistory.length > 0 
    ? healthHistory.map((h, i) => ({ name: `Day ${i+1}`, score: h.health_score }))
    : [
        { name: 'Week 1', score: 78 },
        { name: 'Week 2', score: 82 },
        { name: 'Week 3', score: 80 },
        { name: 'Week 4', score: 88 },
        { name: 'Week 5', score: 92 },
      ];

  const defaultNutrients = [
    { name: 'Nitrogen (N)', optimal: 60, current: 42 },
    { name: 'Phosphorus (P)', optimal: 50, current: 28 },
    { name: 'Potassium (K)', optimal: 60, current: 52 },
    { name: 'Moisture', optimal: 70, current: 40 },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-primary-800 to-primary-700 text-white p-6 rounded-2xl shadow-lg shadow-primary-950/10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-sans">{t.title}</h2>
          <p className="text-primary-100 text-sm mt-1">{t.subtitle}</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center space-x-2 text-sm font-semibold text-gold-300">
          <TrendingUp className="h-4 w-4" />
          <span>Active Growing Season</span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Health Score */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-green-500/10 text-green-600">
            <Heart className="h-6 w-6 fill-green-500/10" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.healthCard}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.avgHealth}%</h3>
          </div>
        </div>

        {/* Card 2: Spray status */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.sprayCard}</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">{stats.spraySuitability}</h3>
          </div>
        </div>

        {/* Card 3: Active Diseases */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-red-500/10 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.diseaseCard}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.activeDiseases}</h3>
          </div>
        </div>

        {/* Card 4: Rain */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4">
          <div className="p-3.5 rounded-xl bg-gold-500/10 text-gold-600">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{t.rainCard}</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.rainProb}%</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="glass-panel p-5 rounded-2xl">
        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">{t.quickActions}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActivePage('disease')}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 border border-emerald-200/50 text-slate-800 font-semibold transition-all duration-300 text-left group"
          >
            <span>{t.diagnoseAction}</span>
            <ArrowRight className="h-4 w-4 text-emerald-600 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            onClick={() => setActivePage('fertilizer')}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 border border-amber-200/50 text-slate-800 font-semibold transition-all duration-300 text-left group"
          >
            <span>{t.fertilizerAction}</span>
            <ArrowRight className="h-4 w-4 text-amber-600 transition-transform group-hover:translate-x-1" />
          </button>
          <button 
            onClick={() => setActivePage('weather')}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200/50 text-slate-800 font-semibold transition-all duration-300 text-left group"
          >
            <span>{t.weatherAction}</span>
            <ArrowRight className="h-4 w-4 text-blue-600 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-700 text-md mb-4 flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>{t.chartTitle1}</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultHealthTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#40966d" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                  dot={{ strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-slate-700 text-md mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <span>{t.chartTitle2}</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaultNutrients} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="current" fill="#40966d" name="Current Levels" radius={[4, 4, 0, 0]} />
                <Bar dataKey="optimal" fill="#ecc622" name="Optimal Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="glass-panel p-5 rounded-2xl">
        <h3 className="font-bold text-slate-700 text-md mb-4 flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <span>{t.recentActivity}</span>
        </h3>
        {diseaseHistory.length === 0 ? (
          <p className="text-slate-400 text-sm py-4">{t.emptyHistory}</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {diseaseHistory.map((item) => (
              <div key={item._id} className="py-3.5 flex justify-between items-center group">
                <div className="flex items-center space-x-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse-subtle" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{item.disease_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.crop} • {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                    {Math.round(item.confidence * 100)}% Match
                  </span>
                  <button 
                    onClick={() => setActivePage('disease')}
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {t.viewAll}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
