
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle, Clock, LayoutDashboard, MapPin, Bookmark, X, FileText, User, Bell, ShieldCheck, Briefcase, Activity, Zap, FileCheck, ArrowRight, ArrowDown, ChevronRight, Construction, Trash2, Lightbulb, Droplets, Waves, TrafficCone, Landmark, MegaphoneIcon, AlertCircle, Sparkles, Building2, Wallet, Database, Share2, CloudLightning, Utensils, Heart } from 'lucide-react';
import { getDashboardStats, getProactiveRecommendations } from '../services/geminiService';
import { Language, UserEligibilityData, Application, Reminder, AppView, RoadmapStepItem, CivicIssue, ProactiveAlert } from '../types';
import { translations } from '../translations';

const DBTFlowStep: React.FC<{ label: string; date?: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }> = ({ label, date, status, isLast }) => (
  <div className="flex flex-col items-center relative flex-1">
    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 border-2 ${
      status === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 
      status === 'current' ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-300'
    }`}>
      {label === translations.en.treasury || label === translations.ta.treasury ? <Building2 size={16} /> : 
       label === translations.en.districtReg || label === translations.ta.districtReg ? <Database size={16} /> : <Wallet size={16} />}
    </div>
    {!isLast && (
      <div className={`absolute left-[60%] top-5 w-full h-[2px] -z-0 ${status === 'completed' ? 'bg-indigo-600' : 'bg-slate-100'}`} />
    )}
    <div className="mt-3 text-center">
      <p className={`text-[8px] font-black uppercase tracking-widest ${status === 'upcoming' ? 'text-slate-300' : 'text-slate-900'}`}>{label}</p>
      {date && <p className="text-[6px] font-bold text-slate-400 mt-0.5">{date}</p>}
    </div>
  </div>
);

const CivicRoadmapStep: React.FC<{ label: string; authority?: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }> = ({ label, authority, status, isLast }) => (
  <div className="flex flex-col items-center relative flex-1">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all border-2 ${
      status === 'completed' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 
      status === 'current' ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-300'
    }`}>
      {status === 'completed' ? <CheckCircle size={10} /> : status === 'current' ? <Clock size={10} /> : <div className="w-1 h-1 bg-slate-200 rounded-full" />}
    </div>
    {!isLast && (
      <div className={`absolute left-1/2 top-3 w-full h-[2px] -z-0 ${status === 'completed' ? 'bg-emerald-600' : 'bg-slate-100'}`} />
    )}
    <p className={`mt-2 text-[8px] font-black uppercase tracking-tighter text-center px-1 truncate w-full ${status === 'upcoming' ? 'text-slate-300' : 'text-slate-700'}`}>
      {label}
    </p>
    {status === 'current' && authority && (
      <p className="mt-1 text-[5px] font-black uppercase bg-slate-50 text-slate-500 px-1 py-0.5 rounded-sm truncate w-full text-center max-w-[50px]">
        {authority}
      </p>
    )}
  </div>
);

const RoadmapStep: React.FC<{ label: string; description?: string; authority?: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }> = ({ label, description, authority, status, isLast }) => (
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
    {status === 'current' && authority && (
      <p className="mt-1 text-[5px] font-black uppercase bg-slate-100 text-slate-500 px-1 py-0.5 rounded-sm truncate w-full text-center max-w-[60px]">
        {authority}
      </p>
    )}
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
  const [civicIssues, setCivicIssues] = useState<CivicIssue[]>([]);
  const [grievances, setGrievances] = useState<CivicIssue[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [profile, setProfile] = useState<UserEligibilityData | null>(null);
  const [proactiveAlerts, setProactiveAlerts] = useState<ProactiveAlert[]>([]);
  const [isCashed, setIsCashed] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const sessionIdentifier = localStorage.getItem('current_session');
  const t = translations[language];
  const isTa = language === 'ta';

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
            if (parsedProfile.civicIssues) setCivicIssues(parsedProfile.civicIssues);
            if (parsedProfile.grievances) setGrievances(parsedProfile.grievances);
            if (parsedProfile.reminders) setReminders(parsedProfile.reminders);
            setDisplayName(parsedProfile.name || sessionIdentifier);

            // Fetch Proactive Recommendations
            getProactiveRecommendations(parsedProfile, language).then(setProactiveAlerts);
            setIsCashed(true);

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

  const renderActiveApps = (compact: boolean = false) => {
    const appsToRender = compact ? activeApps.slice(0, 2) : activeApps;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
             <Briefcase className="text-emerald-500" size={18} /> {t.activeAppTitle}
          </h3>
          {activeApps.length > 0 && (
            <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest">{activeApps.length} Active</span>
          )}
        </div>
        {appsToRender.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {appsToRender.map((app, idx) => {
              const hasCustomRoadmap = app.roadmap && app.roadmap.length > 0;
              const weight = hasCustomRoadmap ? (app.currentStepIndex ?? 1) : getStatusWeight(app.status);
              const isDisbursed = app.status === 'disbursed';
              
              return (
                <div key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:border-emerald-200 group">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                           <FileCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900">{app.schemeName}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{app.refNumber} • {app.dateApplied}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        {isDisbursed && (
                          <div className="bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={10} /> {t.blockchainVerified}
                          </div>
                        )}
                        <div className="bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                            {hasCustomRoadmap ? (app.roadmap!.find(s => s.status === 'current')?.label || t.roadApplied) : (app.status.toUpperCase())}
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-start w-full max-w-lg mx-auto mb-2">
                      {hasCustomRoadmap ? (
                        app.roadmap!.map((step, sIdx) => (
                          <RoadmapStep 
                            key={sIdx} 
                            label={step.label} 
                            authority={step.authority}
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

                  {/* DBT Simulation Section */}
                  {isDisbursed && (
                    <div className="mt-8 pt-8 border-t border-dashed border-slate-100">
                       <div className="flex items-center justify-between mb-6">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                            <Wallet className="text-indigo-600" size={12} /> {t.dbtTracker}
                          </h5>
                          <p className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Ref: DBT-TXN-99210
                          </p>
                       </div>
                       
                       <div className="flex justify-between items-start w-full max-w-md mx-auto">
                          <DBTFlowStep label={t.treasury} date="Apr 18" status="completed" />
                          <DBTFlowStep label={t.districtReg} date="Apr 19" status="completed" />
                          <DBTFlowStep label={t.bankCredit} date="Apr 19" status="current" isLast />
                       </div>
                       
                       <div className="mt-6 flex items-center justify-center gap-4">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex-1 text-center">
                             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Amount Disbursed</p>
                             <p className="text-sm font-black text-slate-900">₹12,000</p>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex-1 text-center">
                             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Audit Trail</p>
                             <button className="text-[8px] font-black text-indigo-600 flex items-center justify-center gap-1 mx-auto hover:underline uppercase tracking-tighter">
                                <Share2 size={8} /> Verified Log
                             </button>
                          </div>
                       </div>
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
  };

  const renderCivicIssues = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <Construction className="text-blue-600" size={18} /> {t.activeCivicReports}
        </h3>
        {civicIssues.length > 0 && (
          <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest">{civicIssues.length} Tracking</span>
        )}
      </div>
      {civicIssues.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {civicIssues.map((issue, idx) => {
            const activeStep = issue.roadmap.find(s => s.status === 'current') || issue.roadmap.find(s => s.status === 'completed');
            
            const getIssueIcon = (type: string) => {
                switch(type) {
                    case 'garbage': return Trash2;
                    case 'light': return Lightbulb;
                    case 'road': return Construction;
                    case 'drainage': return Droplets;
                    case 'water': return Waves;
                    case 'traffic': return TrafficCone;
                    case 'property': return Landmark;
                    default: return MegaphoneIcon;
                }
            };
            const IssueIcon = getIssueIcon(issue.type);

            return (
              <div key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:border-blue-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                         <IssueIcon size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{issue.location}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{issue.refNumber} • {issue.dateReported}</p>
                      </div>
                   </div>
                   <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest">
                      {activeStep?.label}
                   </div>
                </div>
                
                <div className="flex justify-between items-start w-full max-w-lg mx-auto mb-2">
                    {issue.roadmap.map((step, sIdx) => (
                        <CivicRoadmapStep 
                            key={sIdx} 
                            label={step.label} 
                            authority={step.authority}
                            status={step.status} 
                            isLast={sIdx === issue.roadmap.length - 1} 
                        />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t.reportsNone}</p>
        </div>
      )}
    </div>
  );

  const renderGrievances = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={18} /> {t.grievanceRoadmap}
        </h3>
        {grievances.length > 0 && (
          <span className="text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-widest">{grievances.length} {t.active}</span>
        )}
      </div>
      {grievances.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {grievances.map((issue, idx) => {
            const activeStep = issue.roadmap.find(s => s.status === 'current') || issue.roadmap.find(s => s.status === 'completed');
            return (
              <div key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:border-red-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-3">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                         <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{issue.type}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{issue.refNumber} • {issue.dateReported}</p>
                      </div>
                   </div>
                   <div className="bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-700 text-[9px] font-black uppercase tracking-widest">
                      {activeStep?.label}
                   </div>
                </div>
                
                <div className="flex justify-between items-start w-full max-w-lg mx-auto mb-2">
                    {issue.roadmap.map((step, sIdx) => (
                        <CivicRoadmapStep 
                            key={sIdx} 
                            label={step.label} 
                            authority={step.authority}
                            status={step.status} 
                            isLast={sIdx === issue.roadmap.length - 1} 
                        />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{isTa ? 'இதுவரை குறைகள் எதுவும் பதிவு செய்யப்படவில்லை.' : 'No grievances filed yet.'}</p>
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
                {isCashed && (
                  <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/20 flex items-center gap-1.5 animate-pulse">
                    <CloudLightning size={10} className="text-amber-300" /> {t.availableOffline}
                  </div>
                )}
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

              {/* 3.1. Advanced Intelligence Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-600 group-hover:rotate-12 transition-transform">
                    <Zap size={100} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-3">
                      <Zap className="text-emerald-500 fill-emerald-500" size={20} /> {t.welfareIntelligence}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed max-w-[240px]">
                      {t.newsFeedDesc}
                    </p>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700">Gazette #TN-2026-04</span>
                        <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Analyzed</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium leading-tight italic">
                        "Eligibility for Farmer Support has been expanded to include leased-land tenants."
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                  onClick={() => (window as any).dispatchEvent(new CustomEvent('navTo', { detail: AppView.HEALTH_MODULE }))}
                >
                  <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                    <Utensils size={120} />
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <Heart className="text-white" size={20} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight">{t.healthAdvisor}</h3>
                      </div>
                      <p className="text-indigo-100/70 text-xs font-medium leading-relaxed">
                        {language === 'ta' ? 'ஊட்டச்சத்து மற்றும் ஆரோக்கியம் தொடர்பான அரசு பலன்கள்.' : 'Nutrition and health benefits linked to your profile.'}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest">
                       {language === 'ta' ? 'ஆய்வு செய்' : 'Explore Now'} <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>

            {/* 3.5. Proactive AI Agent Alerts */}
            {proactiveAlerts.length > 0 && (
              <div className="animate-in slide-in-from-left-4 duration-700">
                <div className="bg-indigo-900 p-6 md:p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12">
                      <Sparkles size={120} />
                   </div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                            <Zap className="text-amber-400 fill-amber-400" size={20} />
                         </div>
                         <div>
                            <h3 className="text-lg font-black tracking-tight">{t.proactiveAgent}</h3>
                            <p className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest">Active Intelligence Session</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {proactiveAlerts.map((alert, idx) => (
                           <div key={idx} className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all cursor-pointer">
                              <div>
                                 <h4 className="text-sm font-black text-white mb-2 flex items-center gap-2 group-hover:text-amber-300 transition-colors">
                                   {alert.title} <ArrowRight size={14} />
                                 </h4>
                                 <p className="text-[11px] text-indigo-100/70 leading-relaxed font-medium">{alert.description}</p>
                              </div>
                              <button className="mt-6 w-full py-3 bg-white text-indigo-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                                 {alert.cta}
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* 4. Active Applications Section */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
               {renderActiveApps(true)}
            </div>

            {/* 4.5. Civic Issues Section */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-150">
               {renderCivicIssues()}
            </div>

            {/* 4.6. Grievance Section */}
            <div className="animate-in slide-in-from-bottom-4 duration-500 delay-175">
               {renderGrievances()}
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

        {activeView === AppView.APPLICATIONS && (
          <div className="animate-in slide-in-from-bottom-5 duration-700">
             <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t.activeAppTitle}</h2>
                <p className="text-slate-500 font-medium">{isTa ? 'சமர்ப்பிக்கப்பட்ட விண்ணப்பங்கள் மற்றும் அதிகாரப்பூர்வ நடைமுறைகளின் விரிவான கண்காணிப்பு.' : 'Detailed tracking of your submitted applications and official procedures.'}</p>
             </div>
             {renderActiveApps(false)}
          </div>
        )}

        {activeView === AppView.SAVED && (
          <div className="animate-in slide-in-from-bottom-5 duration-700">
             <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t.offlineReminders}</h2>
                <p className="text-slate-500 font-medium">{t.availableOffline} - {isTa ? 'இந்த நடைமுறைகளை இணைய இணைப்பு இல்லாமல் அணுகலாம்.' : 'These procedures are accessible without internet connection.'}</p>
             </div>
             {renderSavedSchemes()}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
