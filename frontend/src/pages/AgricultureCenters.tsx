import React, { useEffect, useState, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  Layers, 
  Phone, 
  Clock, 
  Loader2,
  Navigation,
  ChevronRight,
  Info
} from 'lucide-react';
import { api, CenterResponse } from '../services/api';

interface AgricultureCentersProps {
  language: 'en' | 'te' | 'hi';
}

export const AgricultureCenters: React.FC<AgricultureCentersProps> = ({ language }) => {
  const [centers, setCenters] = useState<CenterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const LeafletLibRef = useRef<any>(null);

  const translations = {
    en: {
      title: "Nearby Agriculture Centers",
      subtitle: "Locate government offices, soil testing laboratories, and seed distribution hubs",
      allType: "All Centers",
      lab: "Soil Testing Labs",
      office: "Agriculture Offices",
      seed: "Seed Distribution Centers",
      radiusLabel: "Search Radius",
      contact: "Contact",
      hours: "Working Hours",
      dist: "distance",
      loadingMap: "Initializing OpenStreetMap canvas...",
      noCenters: "No centers found matching selection. Try expanding your search radius.",
      directions: "Focus on Map",
      km: "km"
    },
    te: {
      title: "వ్యవసాయ కేంద్రాల పటము",
      subtitle: "ప్రభుత్వ కార్యాలయాలు, మట్టి పరీక్షా కేంద్రాలు మరియు విత్తన సరఫరా కేంద్రాలను గుర్తించండి",
      allType: "అన్ని కేంద్రాలు",
      lab: "మట్టి పరీక్షా కేంద్రాలు",
      office: "వ్యవసాయ కార్యాలయాలు",
      seed: "విత్తన పంపిణీ కేంద్రాలు",
      radiusLabel: "శోధన పరిధి (దూరం)",
      contact: "ఫోన్ నెంబర్",
      hours: "పని వేళలు",
      dist: "దూరం",
      loadingMap: "ఓపెన్‌స్ట్రీట్‌మ్యాప్ కాన్వాస్ లోడ్ అవుతోంది...",
      noCenters: "ఈ పరిధిలో ఎటువంటి కేంద్రాలు లేవు. దయచేసి దూరం పరిధిని పెంచండి.",
      directions: "మ్యాప్‌లో చూడు",
      km: "కి.మీ"
    },
    hi: {
      title: "नजदीकी कृषि केंद्र नक्शा",
      subtitle: "सरकारी कार्यालयों, मृदा परीक्षण प्रयोगशालाओं और बीज वितरण केंद्रों का पता लगाएं",
      allType: "सभी केंद्र",
      lab: "मृदा परीक्षण लैब",
      office: "कृषि कार्यालय",
      seed: "बीज वितरण केंद्र",
      radiusLabel: "खोज त्रिज्या (दूरी)",
      contact: "संपर्क",
      hours: "कार्य समय",
      dist: "दूरी",
      loadingMap: "नक्शा कैनवास लोड किया जा रहा है...",
      noCenters: "कोई केंद्र नहीं मिला। कृपया खोज त्रिज्या बढ़ाएं।",
      directions: "नक्शे पर दिखाएं",
      km: "किमी"
    }
  };

  const t = translations[language];

  // Dynamic injection of Leaflet CSS to ensure tiles render perfectly
  useEffect(() => {
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    async function initMap() {
      if (!mapContainerRef.current) return;
      
      // Dynamic import of Leaflet on client side to prevent compile issue
      const L = await import('leaflet');
      LeafletLibRef.current = L;

      // Default center: Guntur coordinates
      const defaultLat = 16.3067;
      const defaultLon = 80.4365;

      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([defaultLat, defaultLon], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapRef.current);

        markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
      }
      
      loadCenters();
    }
    
    initMap();
    
    return () => {
      // Clean up map on component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Trigger reload markers when filters or radius changes
  useEffect(() => {
    loadCenters();
  }, [activeType, radius]);

  const loadCenters = async () => {
    if (!mapRef.current || !LeafletLibRef.current) return;
    const L = LeafletLibRef.current;
    
    setLoading(true);
    setError(null);
    try {
      // Coordinates of user (Guntur)
      const lat = 16.3067;
      const lon = 80.4365;

      const data = await api.getAgricultureCenters(activeType, lat, lon, radius);
      setCenters(data);

      // Clear existing markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      }

      // Add markers
      data.forEach((center) => {
        // Customize marker color based on type
        let markerBg = 'bg-primary-600';
        if (center.type.includes('Lab')) markerBg = 'bg-blue-600';
        else if (center.type.includes('Seed')) markerBg = 'bg-emerald-600';
        else if (center.type.includes('Office')) markerBg = 'bg-amber-600';

        // Use custom HTML DivIcon to bypass missing png file errors in bundle builds
        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div class="h-8 w-8 rounded-full border-2 border-white text-white ${markerBg} shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const popupHTML = `
          <div class="p-1 min-w-[200px]">
            <h4 class="font-bold text-xs text-slate-800 leading-tight mb-1">${center.name}</h4>
            <span class="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${center.type}</span>
            <p class="text-[10px] text-slate-500 mt-2 leading-relaxed">${center.address}</p>
            ${center.contact_number ? `<p class="text-[10px] text-primary-700 font-semibold mt-1">📞 ${center.contact_number}</p>` : ''}
          </div>
        `;

        const marker = L.marker([center.latitude, center.longitude], { icon: customIcon })
          .bindPopup(popupHTML);
          
        markersGroupRef.current.addLayer(marker);
      });

      // Fit map bounds to show markers if any found
      if (data.length > 0) {
        const group = L.featureGroup(data.map(d => L.marker([d.latitude, d.longitude])));
        mapRef.current.fitBounds(group.getBounds().pad(0.15));
      }
    } catch (err) {
      setError("Failed to query agriculture centers directory.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const focusCenterOnMap = (center: CenterResponse) => {
    if (mapRef.current) {
      mapRef.current.setView([center.latitude, center.longitude], 14);
      // Open popup on that marker
      if (markersGroupRef.current) {
        markersGroupRef.current.eachLayer((layer: any) => {
          const latlng = layer.getLatLng();
          if (latlng.lat === center.latitude && latlng.lng === center.longitude) {
            layer.openPopup();
          }
        });
      }
      // Scroll smoothly to map on mobile
      mapContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-grow p-6 overflow-hidden flex flex-col h-full max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
          <MapPin className="h-6 w-6 text-primary-600 animate-pulse-subtle" />
          <span>{t.title}</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Control filters bar */}
      <div className="shrink-0 grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 items-center">
        {/* Type filters */}
        <div className="md:col-span-8 flex flex-wrap gap-1.5">
          <button 
            onClick={() => setActiveType(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${activeType === null ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {t.allType}
          </button>
          <button 
            onClick={() => setActiveType('Soil Testing Lab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${activeType === 'Soil Testing Lab' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {t.lab}
          </button>
          <button 
            onClick={() => setActiveType('Agriculture Office')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${activeType === 'Agriculture Office' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {t.office}
          </button>
          <button 
            onClick={() => setActiveType('Seed Distribution Center')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${activeType === 'Seed Distribution Center' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {t.seed}
          </button>
        </div>

        {/* Radius filter */}
        <div className="md:col-span-4 flex items-center justify-end space-x-2 w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{t.radiusLabel}</span>
          <select 
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
          >
            <option value="10">10 {t.km}</option>
            <option value="25">25 {t.km}</option>
            <option value="50">50 {t.km}</option>
            <option value="100">100 {t.km}</option>
          </select>
        </div>
      </div>

      {/* Main Map Canvas and Sidebar Directory */}
      <div className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map */}
        <div className="lg:col-span-2 relative bg-slate-100 rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[300px] lg:h-full">
          <div ref={mapContainerRef} className="w-full h-full" />
          
          {!mapRef.current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-2" />
              <p className="text-xs font-semibold">{t.loadingMap}</p>
            </div>
          )}
        </div>

        {/* Sidebar Directory */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-4 flex flex-col h-[280px] lg:h-full min-h-0">
          <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-3 flex items-center space-x-1">
            <Layers className="h-3.5 w-3.5" />
            <span>List of nearby offices</span>
          </h3>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600 mr-2" />
              <span className="text-xs font-medium">Refreshing list...</span>
            </div>
          ) : error ? (
            <p className="text-xs text-red-500 font-semibold">{error}</p>
          ) : centers.length === 0 ? (
            <div className="flex-grow flex flex-col justify-center items-center text-slate-400 text-center p-4">
              <Info className="h-10 w-10 text-slate-200 mb-2" />
              <p className="text-xs font-semibold">{t.noCenters}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {centers.map((center) => (
                <div 
                  key={center._id} 
                  className="bg-white hover:bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer flex justify-between items-start group"
                  onClick={() => focusCenterOnMap(center)}
                >
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-primary-700 transition-colors">{center.name}</h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{center.address}</p>
                    
                    <div className="flex flex-col space-y-0.5 text-[9px] text-slate-400">
                      {center.contact_number && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-2.5 w-2.5 shrink-0" />
                          <span>{center.contact_number}</span>
                        </div>
                      )}
                      {center.working_hours && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-2.5 w-2.5 shrink-0" />
                          <span>{center.working_hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 space-y-1.5">
                    {center.distance_km !== undefined && (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {center.distance_km} {t.km}
                      </span>
                    )}
                    <button className="text-[10px] font-bold text-primary-600 hover:underline flex items-center space-x-0.5 shrink-0">
                      <span>{t.directions}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
