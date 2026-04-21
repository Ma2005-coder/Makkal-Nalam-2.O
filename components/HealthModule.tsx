
import React, { useState } from 'react';
import { Heart, Activity, CheckCircle, Smartphone, Info, Sparkles, Utensils, Apple, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language, UserEligibilityData } from '../types';
import { translations } from '../translations';

interface HealthModuleProps {
  language: Language;
  profile: UserEligibilityData | null;
}

const HealthModule: React.FC<HealthModuleProps> = ({ language, profile }) => {
  const t = translations[language];
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const analyzeHealth = () => {
    setAnalyzing(true);
    // Simulate AI Health Analysis based on family profile
    setTimeout(() => {
      setReport({
        score: 85,
        status: 'Optimal',
        tips: [
          { title: t.nutritionScore, desc: language === 'ta' ? 'குடும்ப உறுப்பினர்களின் ஊட்டச்சத்து அளவு சிறப்பாக உள்ளது.' : 'Family nutrition levels are currently stable.' },
          { title: language === 'ta' ? 'அடுத்த கட்டம்' : 'Next Step', desc: language === 'ta' ? 'குழந்தைகளுக்கான அங்கன்வாடி ஊட்டச்சத்து மையத்தைப் பார்வையிடவும்.' : 'Visit the nearest Anganwadi center for child nutrition monitoring.' }
        ],
        schemes: [
          'Puratchi Thalaivar MGR Nutritious Meal Programme',
          'Dr. Muthulakshmi Reddy Maternity Benefit Scheme'
        ]
      });
      setAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-emerald-600 p-8 md:p-12 text-white relative">
          <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12">
            <Heart size={160} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <Utensils size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t.healthNutrition}</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight">{t.healthAdvisor}</h2>
              <p className="text-emerald-50/80 font-medium max-w-md">{language === 'ta' ? 'உங்கள் குடும்பத்தின் நலனை மேம்படுத்த AI பரிந்துரைகள்.' : 'AI-driven health and nutrition insights based on your family profile.'}</p>
            </div>
            
            {!report && !analyzing && (
              <button 
                onClick={analyzeHealth}
                className="bg-white text-emerald-700 px-8 py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-emerald-50 transition-all flex items-center gap-3 active:scale-95"
              >
                <Sparkles size={24} /> {t.analyzeFamilyHealth}
              </button>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12">
          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
               <div className="relative">
                  <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                  <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 animate-pulse" size={32} />
               </div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{language === 'ta' ? 'குடும்ப சுகாதாரத் தரவை ஆய்வு செய்கிறது...' : 'Analyzing Family Health Metrics...'}</p>
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in zoom-in-95 duration-500">
               <div className="space-y-8">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={80} />
                     </div>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.nutritionScore}</h3>
                     <div className="flex items-end gap-2 mb-4">
                        <span className="text-6xl font-black text-slate-900 leading-none">{report.score}</span>
                        <span className="text-slate-400 font-bold mb-1">/100</span>
                     </div>
                     <p className="text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full inline-block mb-4 border border-emerald-100">
                        {report.status} Access
                     </p>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        {language === 'ta' ? 'உங்கள் குடும்பத் தரவுகளின் அடிப்படையில் கணக்கிடப்பட்ட சுகாதார மதிப்பெண்.' : 'Calculated Health Accessibility Score based on your family profile.'}
                     </p>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.healthTips}</h3>
                     {report.tips.map((tip: any, i: number) => (
                       <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-emerald-200 transition-all">
                          <h4 className="font-black text-slate-900 mb-1 flex items-center gap-2">
                             <Zap size={14} className="text-amber-500" /> {tip.title}
                          </h4>
                          <p className="text-slate-500 text-sm font-medium">{tip.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem]">
                     <h3 className="text-indigo-900 font-black mb-6 flex items-center gap-2">
                        <ShieldCheck size={20} /> {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட திட்டங்கள்' : 'Recommended Schemes'}
                     </h3>
                     <div className="space-y-4">
                        {report.schemes.map((scheme: string, i: number) => (
                           <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-between group hover:shadow-md transition-all">
                              <span className="font-bold text-slate-900 text-sm">{scheme}</span>
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                 <ArrowRight size={14} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-200">
                           <Apple size={24} />
                        </div>
                        <div>
                           <h4 className="font-black text-amber-900">{language === 'ta' ? 'அங்கன்வாடி எச்சரிக்கை' : 'Anganwadi Alert'}</h4>
                           <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.sunday10am}</p>
                        </div>
                     </div>
                     <p className="text-amber-800/80 text-sm font-medium leading-relaxed">
                        {language === 'ta' ? 'உங்கள் குழந்தைகளுக்கான முட்டைகள் மற்றும் ஊட்டச்சத்து பானங்கள் வழங்கும் முகாம் நடைபெறுகிறது.' : 'Nutritional supplement distribution camp (Eggs & Health Drinks) is active at your local ward center.'}
                     </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
               <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                  <Apple size={40} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{language === 'ta' ? 'தயாராக உள்ளது' : 'System Ready'}</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">{language === 'ta' ? 'உங்கள் சுகாதாரத் தேவையைக் கண்டறிய பகுப்பாய்வைத் தொடங்கவும்.' : 'Click analyze to get insights into family health schemes and nutrition centers.'}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthModule;
