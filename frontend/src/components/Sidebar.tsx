import React from 'react';
import { 
  LayoutDashboard, 
  Leaf, 
  Mic, 
  CloudSun, 
  Sprout, 
  FlaskConical, 
  MessageSquare, 
  Activity, 
  Landmark, 
  MapPin,
  Globe,
  Menu,
  X
} from 'lucide-react';

export type PageId = 
  | 'dashboard' 
  | 'disease' 
  | 'voice' 
  | 'weather' 
  | 'fertilizer' 
  | 'pesticide' 
  | 'chatbot' 
  | 'health' 
  | 'schemes' 
  | 'map';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  language: 'en' | 'te' | 'hi';
  setLanguage: (lang: 'en' | 'te' | 'hi') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  setActivePage, 
  language, 
  setLanguage 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Label translations for sidebar items
  const translations = {
    en: {
      brand: "Rythu Bandhu AI",
      brandSub: "Smart Agriculture",
      dashboard: "Dashboard",
      disease: "Disease Detection",
      voice: "Voice Assistant",
      weather: "Weather Advisory",
      fertilizer: "Fertilizers",
      pesticide: "Pesticide Calculator",
      chatbot: "AI Chatbot",
      health: "Crop Health Score",
      schemes: "Govt Schemes",
      map: "Agri Centers Map",
    },
    te: {
      brand: "రైతు బంధు AI",
      brandSub: "స్మార్ట్ వ్యవసాయం",
      dashboard: "డ్యాష్‌బోర్డ్",
      disease: "తెగులు గుర్తింపు",
      voice: "వాయిస్ అసిస్టెంట్",
      weather: "వాతావరణ సలహా",
      fertilizer: "ఎరువుల సిఫార్సు",
      pesticide: "పురుగుమందుల గణన",
      chatbot: "AI చాట్‌బాట్",
      health: "పంట ఆరోగ్య స్కోర్",
      schemes: "ప్రభుత్వ పథకాలు",
      map: "వ్యవసాయ కేంద్రాలు",
    },
    hi: {
      brand: "कृषि बंधु AI",
      brandSub: "स्मार्ट खेती",
      dashboard: "डैशबोर्ड",
      disease: "रोग पहचान",
      voice: "आवाज सहायक",
      weather: "मौसम सलाहकार",
      fertilizer: "उर्वरक सलाह",
      pesticide: "कीटनाशक गणना",
      chatbot: "कृषि चैटबॉट",
      health: "फसल स्वास्थ्य स्कोर",
      schemes: "सरकारी योजनाएं",
      map: "कृषि केंद्र नक्शा",
    }
  };

  const navItems = [
    { id: 'dashboard' as PageId, label: translations[language].dashboard, icon: LayoutDashboard },
    { id: 'disease' as PageId, label: translations[language].disease, icon: Leaf },
    { id: 'voice' as PageId, label: translations[language].voice, icon: Mic },
    { id: 'weather' as PageId, label: translations[language].weather, icon: CloudSun },
    { id: 'fertilizer' as PageId, label: translations[language].fertilizer, icon: Sprout },
    { id: 'pesticide' as PageId, label: translations[language].pesticide, icon: FlaskConical },
    { id: 'chatbot' as PageId, label: translations[language].chatbot, icon: MessageSquare },
    { id: 'health' as PageId, label: translations[language].health, icon: Activity },
    { id: 'schemes' as PageId, label: translations[language].schemes, icon: Landmark },
    { id: 'map' as PageId, label: translations[language].map, icon: MapPin },
  ];

  const handleNavClick = (id: PageId) => {
    setActivePage(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="lg:hidden w-full h-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white flex items-center justify-between px-4 fixed top-0 left-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <Sprout className="h-6 w-6 text-gold-400 animate-pulse-subtle" />
          <div>
            <h1 className="font-bold text-lg leading-tight">{translations[language].brand}</h1>
            <p className="text-xs text-primary-200">{translations[language].brandSub}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1.5 rounded-lg bg-primary-700/50 hover:bg-primary-700 transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-45 w-64 bg-gradient-to-b from-primary-950 to-primary-900 text-slate-100 flex flex-col justify-between border-r border-primary-800/30 shadow-xl transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:z-10
        ${isOpen ? 'translate-x-0 pt-16 lg:pt-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-primary-800/40 hidden lg:flex items-center space-x-3 bg-primary-950/40">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-gold-500 to-primary-500 shadow-md">
            <Sprout className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-gold-200">
              {translations[language].brand}
            </h1>
            <p className="text-xs text-primary-300 font-medium tracking-wider uppercase">{translations[language].brandSub}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-950/20' 
                    : 'text-primary-200 hover:bg-primary-800/30 hover:text-white'}
                `}
              >
                <Icon className={`
                  h-5 w-5 transition-transform duration-200 group-hover:scale-110
                  ${isActive ? 'text-gold-300' : 'text-primary-300 group-hover:text-gold-400'}
                `} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Settings & Language Toggle */}
        <div className="p-4 border-t border-primary-800/40 bg-primary-950/30">
          <div className="flex items-center space-x-2 mb-3 px-2 text-xs font-semibold text-primary-300 uppercase tracking-wider">
            <Globe className="h-3.5 w-3.5" />
            <span>Select Language</span>
          </div>
          <div className="grid grid-cols-3 gap-1 p-1 bg-primary-950/80 rounded-xl border border-primary-800/30">
            {(['en', 'te', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`
                  py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200
                  ${language === lang 
                    ? 'bg-gradient-to-tr from-gold-500 to-gold-600 text-primary-950 shadow' 
                    : 'text-primary-200 hover:bg-primary-800/40'}
                `}
              >
                {lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop shadow */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}
    </>
  );
};
