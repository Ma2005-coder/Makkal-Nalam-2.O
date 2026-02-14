
import React, { useState, useEffect } from 'react';
import { Search, Info, Loader2, Bookmark, Check, ExternalLink, GraduationCap, Heart, Landmark, Users, Tractor, Briefcase, Anchor, Accessibility, LayoutGrid, Sparkles, ArrowLeft, ShieldCheck, ChevronRight, FileText, Banknote, ListChecks } from 'lucide-react';
import { searchSchemes } from '../services/geminiService';
import { Language, UserEligibilityData, Reminder } from '../types';
import { translations } from '../translations';

interface AIScheme {
  name: string;
  shortSummary: string;
  description: string;
  eligibility: string[];
  benefits: string;
  sector: string;
}

interface ExplorerProps {
  language: Language;
  onApplyNow: (schemeName: string) => void;
}

const Explorer: React.FC<ExplorerProps> = ({ language, onApplyNow }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ schemes: AIScheme[]; sources: any[] } | null>(null);
  const [activeScheme, setActiveScheme] = useState<AIScheme | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const userPhone = localStorage.getItem('current_session');
  const t = translations[language];
  // Fix: Defined isTa to check if the language is Tamil
  const isTa = language === 'ta';

  const sectors = [
    { id: 'magalir', label: t.sectorMagalir, icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-100', query: 'Magalir Nalam / Women welfare schemes' },
    { id: 'education', label: t.sectorKalvi, icon: GraduationCap, color: 'bg-blue-50 text-blue-600 border-blue-100', query: 'Education and Scholarship schemes' },
    { id: 'agriculture', label: t.sectorUlavar, icon: Tractor, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', query: 'Agriculture and Farmer subsidy schemes' },
    { id: 'housing', label: t.sectorVeedu, icon: Landmark, color: 'bg-amber-50 text-amber-600 border-amber-100', query: 'Housing and urban development schemes' },
    { id: 'health', label: t.sectorNalam, icon: Heart, color: 'bg-red-50 text-red-600 border-red-100', query: 'Healthcare and Health Insurance schemes' },
    { id: 'pension', label: t.sectorPension, icon: Users, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', query: 'Social security and Pension schemes' },
    { id: 'workers', label: t.sectorWorkers, icon: Briefcase, color: 'bg-slate-50 text-slate-600 border-slate-100', query: 'Labor welfare and Employment schemes' },
    { id: 'fisheries', label: t.sectorFisheries, icon: Anchor, color: 'bg-cyan-50 text-cyan-600 border-cyan-100', query: 'Fisheries and Coastal welfare schemes' },
    { id: 'disabled', label: t.sectorDifferentlyAbled, icon: Accessibility, color: 'bg-purple-50 text-purple-600 border-purple-100', query: 'Differently Abled welfare schemes' },
  ];

  useEffect(() => {
    if (userPhone) {
      const saved = localStorage.getItem(`user_profile_${userPhone}`);
      if (saved) {
        const profile: UserEligibilityData = JSON.parse(saved);
        if (profile.reminders) {
          setSavedIds(new Set(profile.reminders.map(r => r.schemeName)));
        }
      }
    }
  }, [userPhone]);

  const handleSearch = async (manualQuery?: string) => {
    const searchQuery = manualQuery || query;
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setResults(null);
    setActiveScheme(null);
    try {
      const data = await searchSchemes(searchQuery, language);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSectorClick = (sector: typeof sectors[0]) => {
    setQuery(sector.label);
    handleSearch(sector.query);
  };

  const saveToReminders = (name: string, eligibility: string[]) => {
    if (!userPhone) return;
    const saved = localStorage.getItem(`user_profile_${userPhone}`);
    let profile: UserEligibilityData = saved ? JSON.parse(saved) : { reminders: [] };
    
    const newReminder: Reminder = {
      id: Math.random().toString(36).substr(2, 9),
      schemeName: name,
      documentsNeeded: eligibility.length > 0 ? eligibility : ["Aadhar Card", "Smart Card", "Income Certificate"],
      savedDate: new Date().toLocaleDateString()
    };

    profile.reminders = [...(profile.reminders || []), newReminder];
    localStorage.setItem(`user_profile_${userPhone}`, JSON.stringify(profile));
    setSavedIds(prev => new Set(prev).add(name));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header section - hide when viewing details on mobile */}
      <div className={`mb-10 text-center space-y-2 ${activeScheme ? 'hidden lg:block' : 'block'}`}>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.schemeFinder}</h2>
        <p className="text-slate-500 text-lg font-medium">{t.searchTNWelfare}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Sectors List */}
        <div className={`lg:col-span-1 space-y-8 ${activeScheme ? 'hidden lg:block' : 'block'}`}>
           <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <LayoutGrid size={14} className="text-emerald-500" /> {t.exploreBySector}
              </h3>
              <div className="flex flex-col gap-2">
                 {sectors.map((sector) => (
                   <button
                     key={sector.id}
                     onClick={() => handleSectorClick(sector)}
                     className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group ${
                       query === sector.label 
                         ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                         : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/50'
                     }`}
                   >
                     <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                       query === sector.label ? 'bg-white/20' : sector.color
                     }`}>
                       <sector.icon size={18} />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{sector.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Search bar - hide when viewing details */}
          {!activeScheme && (
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-14 pr-4 py-5 bg-white rounded-3xl shadow-xl border border-slate-100 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all outline-none text-lg text-slate-700 placeholder-slate-400"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 disabled:bg-slate-200 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-200"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : t.search}
              </button>
            </form>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles size={40} className="text-emerald-600" />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t.verifying}</p>
            </div>
          )}

          {/* Results Grid View */}
          {results && !activeScheme && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Sparkles size={20} className="text-emerald-600" /> {t.searchResult}
                </h3>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-widest">{results.schemes.length} Matches</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.schemes.map((scheme, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveScheme(scheme)}
                    className="bg-white p-8 rounded-[3rem] border border-slate-100 text-left transition-all hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[3rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="relative z-10 space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                         <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full tracking-widest">{scheme.sector}</span>
                      </div>
                      <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">{scheme.name}</h4>
                      <p className="text-sm text-slate-500 font-medium line-clamp-2">{scheme.shortSummary}</p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest relative z-10">
                       {t.viewDetails} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Sources Section */}
              {results.sources && results.sources.length > 0 && (
                <div className="bg-slate-100/50 p-8 rounded-[2.5rem] border border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t.verificationSources}</h4>
                  <div className="flex flex-wrap gap-3">
                    {results.sources.map((source: any, i: number) => {
                      const url = source.web?.uri || source.maps?.uri;
                      const title = source.web?.title || source.maps?.title || "Official Portal";
                      if (!url) return null;
                      return (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl text-[10px] font-bold border border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
                        >
                          <ExternalLink size={12} /> {title}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Individual Scheme Detail View */}
          {activeScheme && (
            <div className="animate-in slide-in-from-right duration-500 space-y-8 pb-20">
              <button 
                onClick={() => setActiveScheme(null)}
                className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors mb-6 group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {isTa ? 'பின்செல்' : 'Back to Results'}
              </button>

              <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-emerald-950 p-10 md:p-14 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-40" />
                   <div className="relative z-10 space-y-6">
                      <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                        {activeScheme.sector}
                      </span>
                      <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight max-w-2xl">{activeScheme.name}</h2>
                      <p className="text-emerald-100/70 text-lg md:text-xl font-medium max-w-xl italic">"{activeScheme.shortSummary}"</p>
                   </div>
                </div>

                <div className="p-10 md:p-14 space-y-12">
                   <section className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                         <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText size={22} /></div>
                         {t.viewDetails}
                      </h3>
                      <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                        {activeScheme.description}
                      </p>
                   </section>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <section className="space-y-6">
                         <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><ListChecks size={22} /></div>
                            {isTa ? 'தகுதி வரம்புகள்' : 'Eligibility Criteria'}
                         </h3>
                         <ul className="space-y-4">
                            {activeScheme.eligibility.map((item, i) => (
                               <li key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="mt-1 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                     <Check size={12} />
                                  </div>
                                  <span className="text-sm text-slate-700 font-bold">{item}</span>
                               </li>
                            ))}
                         </ul>
                      </section>

                      <section className="space-y-6">
                         <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><Banknote size={22} /></div>
                            {isTa ? 'திட்டத்தின் நன்மைகள்' : 'Scheme Benefits'}
                         </h3>
                         <div className="p-6 bg-amber-50/30 rounded-[2.5rem] border border-amber-100/50">
                            <p className="text-slate-700 font-bold leading-relaxed text-base">
                               {activeScheme.benefits}
                            </p>
                         </div>
                      </section>
                   </div>

                   <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                      <button 
                        onClick={() => onApplyNow(activeScheme.name)}
                        className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                      >
                         <ShieldCheck size={24} /> {t.applyNow}
                      </button>
                      <button 
                        onClick={() => saveToReminders(activeScheme.name, activeScheme.eligibility)}
                        disabled={savedIds.has(activeScheme.name)}
                        className={`w-full sm:w-auto px-10 py-5 rounded-[2rem] font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 border-2 ${
                          savedIds.has(activeScheme.name) 
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default' 
                            : 'bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                         {savedIds.has(activeScheme.name) ? <Check size={24} /> : <Bookmark size={24} />}
                         {savedIds.has(activeScheme.name) ? t.savedToVault : t.saveOffline}
                      </button>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {!results && !loading && !activeScheme && (
            <div className="bg-emerald-950 p-12 md:p-20 rounded-[4rem] text-center text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-800 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900 rounded-full -ml-32 -mb-32 blur-3xl opacity-30" />
               <div className="relative z-10 space-y-8">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
                     <Search size={48} className="text-emerald-300" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight">{isTa ? 'திட்டங்களைக் கண்டறியவும்' : 'Discover Welfare Schemes'}</h3>
                    <p className="text-emerald-100/70 text-base md:text-lg max-w-md mx-auto font-medium leading-relaxed">
                      Select a sector from the left to browse programs or use the search bar to find a specific scheme by name.
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explorer;
