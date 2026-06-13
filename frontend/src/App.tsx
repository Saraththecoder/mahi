import React, { useState } from 'react';
import { Sidebar, PageId } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { VoiceAssistant } from './pages/VoiceAssistant';
import { WeatherAdvisory } from './pages/WeatherAdvisory';
import { FertilizerRecommendation } from './pages/FertilizerRecommendation';
import { PesticideCalculator } from './pages/PesticideCalculator';
import { AIChatbot } from './pages/AIChatbot';
import { CropHealthScore } from './pages/CropHealthScore';
import { GovernmentSchemes } from './pages/GovernmentSchemes';
import { AgricultureCenters } from './pages/AgricultureCenters';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [language, setLanguage] = useState<'en' | 'te' | 'hi'>('en');

  // Render the selected component
  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard language={language} setActivePage={setActivePage} />;
      case 'disease':
        return <DiseaseDetection language={language} />;
      case 'voice':
        return <VoiceAssistant language={language} />;
      case 'weather':
        return <WeatherAdvisory language={language} />;
      case 'fertilizer':
        return <FertilizerRecommendation language={language} />;
      case 'pesticide':
        return <PesticideCalculator language={language} />;
      case 'chatbot':
        return <AIChatbot language={language} />;
      case 'health':
        return <CropHealthScore language={language} />;
      case 'schemes':
        return <GovernmentSchemes language={language} />;
      case 'map':
        return <AgricultureCenters language={language} />;
      default:
        return <Dashboard language={language} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 overflow-hidden w-full">
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        language={language} 
        setLanguage={setLanguage} 
      />

      {/* Main Panel Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 lg:pt-0 h-[calc(100vh-4rem)] lg:h-screen">
        {renderPageContent()}
      </main>
    </div>
  );
};

export default App;
