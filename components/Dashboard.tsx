
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle, Clock, LayoutDashboard, MapPin, Bookmark, X, FileText, User, Bell, ShieldCheck, Briefcase, Activity, Zap, FileCheck, ArrowRight, ArrowDown, ChevronRight } from 'lucide-react';
import { getDashboardStats } from '../services/geminiService';
import { Language, UserEligibilityData, Application, Reminder, AppView, RoadmapStepItem } from '../types';
import { translations } from '../translations';

const RoadmapStep: React.FC<{ label: string; description?: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }> = ({ label, description, status, isLast }) => (
  <div className="flex flex-col items-center relative flex-1">
    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-2 ${
      status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 
      status === 'current' ? 'bg-amber-500 border-amber-500 text-white animate-pulse shadow-lg shadow-amber-200' : 'bg-white border-slate-200 text-slate-300'
    }`}>
      {status === 'completed' ? <CheckCircle size={12} /> : status === 'current' ? <Clock size={12} /> : <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-200 rounded-full" />}
    </div>
    {!isLast && (
      <div className={`absolute left-1/2 top-3.5 md:top-4 w-full h-[2px] -z-0 ${status === 'completed' ? 'bg-emerald-600' : 'bg-slate-100'}`} />
    )}
    <p className={`mt-2 md:mt-3 text-[7px] md:text-[8px] font-black uppercase tracking-tighter text-center px-1 max-w-[80px] truncate ${status === 'upcoming' ? 'text-slate-300' : 'text-slate-700'}`}>
      {label}
    </p>
  </div>
);

interface DashboardProps {
  language: Language;
  activeView: AppView;
  onTriggerAlert?: (type: 'email' | 'phone', message: string, sub: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ language, activeView, onTriggerAlert }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeApps, setActiveApps] = useState<Application[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [profile, setProfile] = useState<UserEligibilityData | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const sessionIdentifier = localStorage.getItem('current_session');
  const t = translations[language];

  const announcements = [
    { id: 1, title: t.specialAadharCamp, date: t.sunday10am, loc: t.localSchool, type: 'event', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 2, title: t.rationTimingUpdate, date: t.effectiveTomorrow, loc: t.allWardShops, type: 'alert', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { id: 3, title: t.mobileHealthUnit, date: t.nextTuesday, loc: t.panchayatOffice, type: 'health', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
        
        if (sessionIdentifier) {
          const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
          if (saved) {
            const parsedProfile: UserEligibilityData = JSON.parse(saved);
            setProfile(parsedProfile);
            if (parsedProfile.activeApplications) setActiveApps(parsedProfile.activeApplications);
            if (parsedProfile.reminders) setReminders(parsedProfile.reminders);
            setDisplayName(parsedProfile.name || sessionIdentifier);

            if (onTriggerAlert) {
                const expiringDocs = [
                    { type: 'incomeCert', label: t.uploadIncome },
                ].filter(d => parsedProfile?.documents?.[d.type as any]);

                if (expiringDocs.length > 0) {
                    onTriggerAlert(
                        'phone', 
                        t.notifyDocExpired, 
                        t.notifyDocExpiredDesc.replace('{doc}', expiringDocs[0].label)
                    );
                }
            }
          } else {
            setDisplayName(sessionIdentifier);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [sessionIdentifier]);

  const deleteReminder = (id: string) => {
    if (!sessionIdentifier) return;
    const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
    if (!saved) return;
    const currentProfile: UserEligibilityData = JSON.parse(saved);
    const updated = (currentProfile.reminders || []).filter(r => r.id !== id);
    currentProfile.reminders = updated;
    localStorage.setItem(`user_profile_${sessionIdentifier}`, JSON.stringify(currentProfile));
    setReminders(updated);
  };

  const getStatusWeight = (status: Application['status']) => {
    switch (status) {
      case 'applied': return 0;
      case 'vao': return 1;
      case 'ri': return 2;
      case 'tahsildar': return 3;
      case 'disbursed': return 4;
      default: return 0;
    }
  };

  const getStepStatus = (currentWeight: number, stepWeight: number) => {
    if (currentWeight > stepWeight) return 'completed';
    if (currentWeight === stepWeight) return 'current';
    return 'upcoming';
  };

  const checkDocStatus = (docType: keyof NonNullable<UserEligibilityData['documents']>) => {
    const doc = profile?.documents?.[docType];
    if (!doc) return 'missing';
    if (docType === 'incomeCert') return 'expiring'; 
    return 'ready';
  };

  const renderActiveApps = (compact: boolean = false) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <LayoutDashboard className="text-emerald-600" size={18} /> {t.activeAppTitle}
        </h3>
        {compact && activeApps.length > 0 && (
          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest">{activeApps.length} Total</span>
        )}
      </div>
      {activeApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {activeApps.map((app, idx) => {
            const hasCustomRoadmap = app.roadmap && app.roadmap.length > 0;
            const weight = hasCustomRoadmap ? (app.currentStepIndex ?? 1) : getStatusWeight(app.status);
            
            return (
              <div key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:border-emerald-200 group">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">{app.schemeName}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">Ref: {app.refNumber}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">Applied: {app.dateApplied}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2.5">
                    <MapPin size={14} className="text-emerald-600" />
                    <div>
                      <p className="text-[8px] font-black text-emerald-700/60 uppercase leading-none mb-0.5">{t.assignedVAO}</p>
                      <p className="text-[10px] font-black text-emerald-900">{t.assignedVaoName}</p>
                    </div>
                  </div>
                </div>
                
                {/* Horizontal simplified view for dashboard */}
                <div className="flex justify-between items-start w-full max-w-xl mx-auto mb-4">
                  {hasCustomRoadmap ? (
                    app.roadmap!.map((step, sIdx) => (
                      <RoadmapStep 
                        key={sIdx} 
                        label={step.label} 
                        status={step.status} 
                        isLast={sIdx === app.roadmap!.length - 1} 
                      />
                    ))
                  ) : (
                    <>
                      <RoadmapStep label={t.roadApplied} status={getStepStatus(weight, 0)} />
                      <RoadmapStep label={t.roadVAO} status={getStepStatus(weight, 1)} />
                      <RoadmapStep label={t.roadRI} status={getStepStatus(weight, 2)} />
                      <RoadmapStep label={t.roadTahsildar} status={getStepStatus(weight, 3)} />
                      <RoadmapStep label={t.roadDisbursed} status={getStepStatus(weight, 4)} isLast />
                    </>
                  )}
                </div>

                {/* Show active step description if available */}
                {hasCustomRoadmap && app.roadmap && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-medium text-slate-500 italic">
                    {app.roadmap.find(s => s.status === 'current')?.description || "Application is being processed according to the official path."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
          <Briefcase size={40} className="mx-auto text-slate-200 mb-3" />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.noActiveApps}</h3>
          <p className="text-slate-400 mt-0.5 text-[10px]">{t.startExploring}</p>
        </div>
      )}
    </div>
  );

  const renderSavedSchemes = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <Bookmark className="text-amber-600" size={18} /> {t.offlineReminders}
        </h3>
        <div className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{t.availableOffline}</div>
      </div>
      {reminders.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 p-10 rounded-[2rem] text-center">
          <Bookmark size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold text-xs">{t.noReminders}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 relative group transition-all hover:shadow-md hover:border-amber-200">
              <button onClick={() => deleteReminder(reminder.id)} className="absolute top-3 right-3 p-1.5 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
              <div className="mb-4">
                <span className="text-[8px] font-black text-amber-700 uppercase tracking-widest mb-0.5 block">{t.savedWelfareProgram}</span>
                <h3 className="text-base font-black text-slate-900 leading-tight pr-6">{reminder.schemeName}</h3>
              </div>
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileCheck size={10} className="text-emerald-500" /> {t.whatToBring}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {reminder.documentsNeeded.map((doc, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-700 text-[9px] font-bold rounded-lg">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400">{t.archived}: {reminder.savedDate}</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-tighter">
                  <CheckCircle size={10} /> {t.readyToVisitCSC}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in slide-in-from-bottom-5 duration-700 pb-24">
      <div className="space-y-8">
        
        {activeView === AppView.DASHBOARD && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Dashboard Header - Aggressively compacted */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-4 p-3.5 md:p-4 bg-emerald-600 rounded-[1.75rem] shadow-lg shadow-emerald-900/10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/20 backdrop-blur-md rounded-[1rem] flex items-center justify-center shrink-0 border border-white/30 shadow-xl">
                  <User size={24} className="text-emerald-50" />
                </div>
                <div className="relative z-10">
                  <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-emerald-100/70 mb-0">{t.welcomeCitizen}</p>
                  <h2 className="text-base md:text-xl font-black tracking-tight leading-tight">{displayName}</h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="bg-emerald-500/50 backdrop-blur-sm text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-white/10">Verified Citizen</span>
                  </div>
                </div>
              </div>

              {/* 2. Announcements - Compact Scrolling Bulletin */}
              <div className="w-full md:w-[35%] bg-white p-3.5 rounded-[1.75rem] shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <h3 className="font-black text-slate-900 text-[9px] flex items-center gap-2 uppercase tracking-[0.1em] bg-white pr-2"><Bell size={10} className="text-emerald-500" /> {t.makkalFeed}</h3>
                  <span className="bg-emerald-100 text-emerald-700 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest">{profile?.permAddress.district || "TN"}</span>
                </div>
                
                <div className="relative flex-1 overflow-hidden h-[70px]">
                  <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
                  
                  <div className="animate-bulletin flex flex-col gap-1.5 py-1">
                    {announcements.map((ann, i) => (
                      <div key={`ann-1-${i}`} className={`p-2 rounded-[0.75rem] border ${ann.color} flex items-start gap-2 transition-all hover:scale-[1.02] cursor-default shrink-0`}>
                        <Zap size={10} className="shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black leading-tight mb-0 truncate">{ann.title}</p>
                          <p className="text-[6px] font-bold opacity-70 uppercase tracking-widest">{ann.date} • {ann.loc}</p>
                        </div>
                      </div>
                    ))}
                    {announcements.map((ann, i) => (
                      <div key={`ann-2-${i}`} className={`p-2 rounded-[0.75rem] border ${ann.color} flex items-start gap-2 transition-all hover:scale-[1.02] cursor-default shrink-0`}>
                        <Zap size={10} className="shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black leading-tight mb-0 truncate">{ann.title}</p>
                          <p className="text-[6px] font-bold opacity-70 uppercase tracking-widest">{ann.date} • {ann.loc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. General Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t.tnSchemes, value: '320+', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: t.beneficiaries, value: '4.2M+', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { label: t.ekycVerified, value: '2.8M', icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                { label: t.avgPayout, value: `9 ${t.days}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-start gap-3 transition-all hover:shadow-md">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-inner`}>
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Active Applications Section */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
               {renderActiveApps(true)}
            </div>

            {/* 5. Saved Schemes Section */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
               {renderSavedSchemes()}
            </div>
          </div>
        )}

        {activeView === AppView.DOCUMENTS && (
          <div className="animate-in fade-in duration-500">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" size={28} /> {t.docReadiness}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium mt-1.5">{t.statusMandatoryCerts}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { type: 'aadharCard', label: t.aadhar, icon: FileText },
                  { type: 'rationCard', label: t.smartCard, icon: FileText },
                  { type: 'incomeCert', label: t.uploadIncome, icon: TrendingUp },
                  { type: 'communityCert', label: t.uploadCommunity, icon: User },
                  { type: 'eduCert', label: t.uploadEdu, icon: FileText },
                ].map((doc, i) => {
                  const status = checkDocStatus(doc.type as any);
                  return (
                    <div key={i} className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-5 ${
                      status === 'ready' ? 'bg-white border-slate-100 shadow-sm' : 
                      status === 'expiring' ? 'bg-amber-50 border-amber-200 shadow-lg shadow-amber-900/5' : 'bg-red-50/20 border-dashed border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 
                          status === 'expiring' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <doc.icon size={24} />
                        </div>
                        {status !== 'ready' && <Activity size={18} className="animate-pulse text-amber-500" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{doc.label.split('(')[0].trim()}</p>
                        <span className={`text-lg font-black ${
                          status === 'ready' ? 'text-emerald-600' : 
                          status === 'expiring' ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {status === 'ready' ? t.ready : status === 'expiring' ? t.renewSoon : t.missingDoc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
