
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink, Loader2, Info, Landmark, Building2, Zap } from 'lucide-react';
import { searchNearbyCenters } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../translations';

const ServiceCenters: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ text: string; sources: any[] } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const findCenters = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchNearbyCenters(lat, lng, language);
      setData(results);
    } catch (err) {
      setError(t.errConnect);
    } finally {
      setLoading(false);
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError(t.locationError);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        findCenters(latitude, longitude);
      },
      (err) => {
        setLoading(false);
        setError(t.locationError);
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t.findHelp}</h2>
        <p className="text-slate-500">{t.locateHelpCenters}</p>
      </div>

      {!location && !loading && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Navigation size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{t.locationRequired}</h3>
          <button
            onClick={handleGeoLocation}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 mx-auto"
          >
            <MapPin size={18} /> {t.useLocation}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={48} className="animate-spin text-emerald-600" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.findingCenters}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-700 text-center font-medium">
          {error}
        </div>
      )}

      {data && !loading && (
        <div className="space-y-8 pb-20">
          {/* Advanced Map Interface */}
          <div className="bg-white p-4 rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden group">
             <div className="relative h-[400px] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100">
                {/* Simulated Map Background - Using a stylized pattern */}
                <div className="absolute inset-0 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/78.1,11.1,6,0/800x600?access_token=pk.xxx')] bg-cover bg-center" />
                
                {/* Interactive Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Simulated Pin Points */}
                <div className="absolute top-1/4 left-1/3 animate-bounce">
                   <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-900/40 border-4 border-white">
                      <Landmark size={20} />
                   </div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-4 py-1 text-[8px] font-black uppercase text-emerald-900 bg-white/80 backdrop-blur-md rounded-full shadow-sm whitespace-nowrap">e-Sevai (Head)</div>
                </div>

                <div className="absolute bottom-1/3 right-1/4 animate-bounce [animation-delay:1s]">
                   <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-900/40 border-2 border-white">
                      <Building2 size={16} />
                   </div>
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-4 py-1 text-[8px] font-black uppercase text-indigo-900 bg-white/80 backdrop-blur-md rounded-full shadow-sm whitespace-nowrap">Dist. Collectorate</div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                   <div className="bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl border border-slate-700 flex items-center gap-3">
                      <Zap size={14} className="text-amber-400" /> {t.mapInterface}
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Info size={24} /></div> {language === 'ta' ? 'அருகிலுள்ள மையங்கள்' : 'Validated Local Centers'}
            </h3>
            <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed mb-10 font-medium bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              {data.text}
            </div>

            {data.sources && data.sources.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">{t.officialSources}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.sources.map((source: any, i: number) => {
                    const url = source.web?.uri || source.maps?.uri;
                    const title = source.web?.title || source.maps?.title || t.centerDetails;
                    if (!url) return null;
                    return (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-emerald-600 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                           <div className="w-10 h-10 bg-slate-50 flex items-center justify-center shrink-0 rounded-xl group-hover:bg-emerald-50 transition-colors">
                              <MapPin size={18} className="text-slate-400 group-hover:text-emerald-600" />
                           </div>
                           <span className="font-bold text-slate-900 text-sm truncate">{title}</span>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCenters;
