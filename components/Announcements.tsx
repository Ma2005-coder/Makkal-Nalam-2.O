
import React from 'react';
import { Bell, Zap, Calendar, MapPin, ExternalLink, ChevronRight, Info } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface AnnouncementsProps {
  language: Language;
}

const Announcements: React.FC<AnnouncementsProps> = ({ language }) => {
  const t = translations[language];
  const isTa = language === 'ta';

  const announcements = [
    { 
      id: 1, 
      title: t.specialAadharCamp, 
      date: t.sunday10am, 
      loc: t.localSchool, 
      desc: t.aadharDesc,
      type: 'event', 
      tag: isTa ? "சிறப்பு முகாம்" : "Special Camp",
      color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconColor: 'bg-emerald-200 text-emerald-800'
    },
    { 
      id: 2, 
      title: t.rationTimingUpdate, 
      date: t.effectiveTomorrow, 
      loc: t.allWardShops, 
      desc: t.rationDesc,
      type: 'alert', 
      tag: isTa ? "முக்கியமான புதுப்பிப்பு" : "Urgent Update",
      color: 'bg-amber-50 text-amber-700 border-amber-100',
      iconColor: 'bg-amber-200 text-amber-800'
    },
    { 
      id: 3, 
      title: t.mobileHealthUnit, 
      date: t.nextTuesday, 
      loc: t.panchayatOffice, 
      desc: t.healthDesc,
      type: 'health', 
      tag: isTa ? "நலவாழ்வு முகாம்" : "Health Drive",
      color: 'bg-blue-50 text-blue-700 border-blue-100',
      iconColor: 'bg-blue-200 text-blue-800'
    },
    {
      id: 4,
      title: t.kalviTitle,
      date: t.kalviDate,
      loc: t.kalviLoc,
      desc: t.kalviDesc,
      type: 'education',
      tag: isTa ? "கல்வி" : "Education",
      color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      iconColor: 'bg-indigo-200 text-indigo-800'
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 pb-24">
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.makkalFeed}</h2>
            <p className="text-slate-500 font-medium">{t.localAlerts}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 ${ann.color}`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 rounded-2xl ${ann.iconColor} shadow-inner`}>
                <Zap size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ann.color} border border-current/20`}>
                {ann.tag}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                {ann.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                {ann.desc}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-300" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isTa ? 'அட்டவணை' : 'Schedule'}</p>
                    <p className="text-[11px] font-bold text-slate-700">{ann.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-300" />
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.locateHelpCenters || (isTa ? 'இடம்' : 'Location')}</p>
                    <p className="text-[11px] font-bold text-slate-700">{ann.loc}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest group/btn hover:translate-x-1 transition-transform">
                  {t.viewDetails} <ChevronRight size={14} />
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={14} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white text-white/5 font-black text-[200px] -mr-20 -mt-20 leading-none pointer-events-none select-none">TN</div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Info size={12} className="text-indigo-300" /> {t.importanceFeed}
          </div>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4 leading-tight">{t.feedTitle}</h2>
          <p className="text-indigo-100/70 text-base font-medium mb-8">
            {t.feedSubtitle}
          </p>
          <button className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-indigo-50 transition-colors flex items-center gap-3">
            {t.managePrefs} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
