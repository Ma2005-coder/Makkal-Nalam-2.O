
import React, { useState, useEffect } from 'react';
import { Trash2, MapPin, Camera, Send, CheckCircle2, AlertTriangle, Loader2, Navigation, Lightbulb, Construction, Droplets, Info, CheckCircle, Clock, Waves, TrafficCone, Landmark, MegaphoneIcon, ShieldCheck, Zap } from 'lucide-react';
import { Language, CivicIssue, UserEligibilityData, RoadmapStepItem } from '../types';
import { translations } from '../translations';
import { analyzeCivicPhoto } from '../services/geminiService';

const CivicRoadmapStep: React.FC<{ label: string; status: 'completed' | 'current' | 'upcoming'; isLast?: boolean }> = ({ label, status, isLast }) => (
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
    {status === 'current' && (
      <div className="absolute top-8 bg-amber-500 text-white text-[6px] px-1 rounded-sm uppercase font-black whitespace-nowrap animate-pulse">
        {status}
      </div>
    )}
  </div>
);

interface CivicReportProps {
  language: Language;
}

const CivicReport: React.FC<CivicReportProps> = ({ language }) => {
  const [issueType, setIssueType] = useState('garbage');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [activeReports, setActiveReports] = useState<CivicIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  
  const t = translations[language];
  const isTa = language === 'ta';
  const sessionIdentifier = localStorage.getItem('current_session');

  useEffect(() => {
    if (sessionIdentifier) {
      const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
      if (saved) {
        const profile: UserEligibilityData = JSON.parse(saved);
        if (profile.civicIssues) {
          setActiveReports(profile.civicIssues);
        }
      }
    }
  }, [sessionIdentifier]);

  const issueCategories = [
    { id: 'garbage', label: t.issueGarbage, icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'light', label: t.issueLight, icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'road', label: t.issueRoad, icon: Construction, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'drainage', label: t.issueDrainage, icon: Droplets, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'water', label: t.issueWater, icon: Waves, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'traffic', label: t.issueTraffic, icon: TrafficCone, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'property', label: t.issueProperty, icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'other', label: t.issueOther, icon: MegaphoneIcon, color: 'text-slate-600', bg: 'bg-slate-50' },
  ];

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setLocation(`${lat}, ${lng} (Auto-detected)`);
          setIsDetecting(false);
        },
        (error) => {
          console.error(error);
          setIsDetecting(false);
          alert(t.locationError);
        }
      );
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPhoto(file);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;
      const result = await analyzeCivicPhoto(base64, issueType, language);
      setAiAnalysis(result);
      
      // Auto-fill or suggest corrections
      if (result.detectedIssueType && issueCategories.some(c => c.id === result.detectedIssueType)) {
        setIssueType(result.detectedIssueType);
      }
      
      if (result.analysis) {
        setDescription(prev => prev ? `${prev}\n\n${result.analysis}` : result.analysis);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission and save to profile
    setTimeout(() => {
      const newIssue: CivicIssue = {
        id: Math.random().toString(36).substr(2, 9),
        type: issueType,
        location: location,
        status: 'logged',
        dateReported: new Date().toLocaleDateString(),
        refNumber: `CIV-${Math.floor(100000 + Math.random() * 900000)}`,
        roadmap: [
          { 
            label: t.roadLogged, 
            status: 'completed', 
            description: isTa ? "புகார் மையத்தில் பெறப்பட்டது." : "Report officially received by District Command Center.",
            authority: isTa ? "மாவட்ட கட்டுப்பாட்டு மையம்" : "District Command Center"
          },
          { 
            label: t.roadAssigned, 
            status: 'current', 
            description: isTa ? "உள்ளூர் கள அலுவலர் நியமிக்கப்பட்டுள்ளார்." : "Local Field Unit / Sanitary Inspector assigned for spot verification.",
            authority: isTa ? "நகராட்சி / மாநகராட்சி அலுவலகம்" : "Municipality / Corporation Office"
          },
          { 
            label: t.roadInProgress, 
            status: 'upcoming', 
            description: isTa ? "பழுதுபார்க்கும் பணிகள் தொடங்கப்பட உள்ளன." : "Maintenance team scheduled for site resolution.",
            authority: isTa ? "பொதுப்பணித் துறை / மின் வாரியம்" : "Public Works / TANGEDCO"
          },
          { 
            label: t.roadResolved, 
            status: 'upcoming', 
            description: isTa ? "பணி முடிக்கப்பட்டு ஆய்வு செய்யப்படும்." : "Issue resolved and internal quality check completed.",
            authority: isTa ? "ஆணையர் அலுவலகம்" : "Commissioner Office"
          }
        ],
        description: description,
        analysis: aiAnalysis ? {
            analysis: aiAnalysis.analysis,
            severity: aiAnalysis.severity,
            details: aiAnalysis.details,
            safetyRisk: aiAnalysis.safetyRisk,
            identifier: aiAnalysis.identifier
        } : undefined
      };

      if (sessionIdentifier) {
        const saved = localStorage.getItem(`user_profile_${sessionIdentifier}`);
        let profile: any;
        
        if (saved) {
          profile = JSON.parse(saved);
        } else {
          profile = {
            name: '',
            phone: sessionIdentifier,
            civicIssues: [],
            activeApplications: [],
            reminders: [],
            documents: {},
            permAddress: { doorNo: '', village: '', taluk: '', district: '', pincode: '' },
            tempAddress: { doorNo: '', village: '', taluk: '', district: '', pincode: '' },
            isSameAddress: true
          };
        }
        
        const updatedIssues = [newIssue, ...(profile.civicIssues || [])];
        profile.civicIssues = updatedIssues;
        localStorage.setItem(`user_profile_${sessionIdentifier}`, JSON.stringify(profile));
        setActiveReports(updatedIssues);
      }

      setIsSubmitting(false);
      setSubmitted(true);
      // Reset form
      setLocation('');
      setDescription('');
      setPhoto(null);
      setAiAnalysis(null);
    }, 1500);
  };

  const getActiveStepInfo = (roadmap: RoadmapStepItem[]) => {
    return roadmap.find(s => s.status === 'current') || roadmap.find(s => s.status === 'completed');
  };

  return (
    <div className="animate-in slide-in-from-bottom-5 duration-700 pb-24 space-y-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-8 md:p-12 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shrink-0 border border-white/30">
                <Construction size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">{t.garbageReport}</h1>
                <p className="text-emerald-50 font-medium opacity-90">{t.cleanCity}</p>
              </div>
            </div>
          </div>

          {submitted ? (
            <div className="p-12 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100 mx-auto">
                <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{t.done}</h2>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                {t.garbageSubmitted}
                </p>
                <button 
                onClick={() => setSubmitted(false)}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                {t.reportExclusion || 'Report Another'}
                </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                {/* Category Selection */}
                <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {t.issueType}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {issueCategories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        onClick={() => setIssueType(cat.id)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        issueType === cat.id 
                        ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                        }`}
                    >
                        <cat.icon size={24} className={issueType === cat.id ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className={`text-[9px] font-black uppercase text-center ${issueType === cat.id ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {cat.label}
                        </span>
                    </button>
                    ))}
                </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {t.garbageLocation}
                </label>
                <div className="relative group">
                    <input
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Street name, landmark..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:border-emerald-500 focus:bg-white transition-all pr-12"
                    />
                    <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetecting}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                    title={t.detectLocation}
                    >
                    {isDetecting ? <Loader2 size={24} className="animate-spin" /> : <Navigation size={22} />}
                    </button>
                </div>
                </div>

                {/* Description Section */}
                <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {t.garbageDescription}
                </label>
                <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    placeholder="Details help our team respond faster..."
                />
                </div>

                {/* Photo Upload Simulation */}
                <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {t.garbagePhoto}
                </label>
                <div 
                    className={`border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
                    photo ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-400 h-40'
                    }`}
                    onClick={() => document.getElementById('photo-upload')?.click()}
                >
                    <input 
                    type="file" 
                    id="photo-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    />
                    {photo ? (
                    <div className="flex items-center gap-4 text-emerald-700 font-bold">
                        <Camera size={24} />
                        <span>{photo.name}</span>
                        <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPhoto(null); }}
                        className="text-slate-400 hover:text-red-500"
                        >
                        {t.remove}
                        </button>
                    </div>
                    ) : (
                    <>
                        <Camera size={32} className="text-slate-300" />
                        <span className="text-slate-400 text-sm font-bold">{t.garbagePhoto}</span>
                    </>
                    )}
                </div>

                {/* AI Analysis Result in Form */}
                {aiAnalysis && !isAnalyzing && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <Zap size={16} />
                      </div>
                      <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">{t.aiResponse}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t.aiIdentifiedIssue}</p>
                        <p className="text-xs font-bold text-indigo-900">{aiAnalysis.analysis}</p>
                      </div>
                      {aiAnalysis.identifier && aiAnalysis.identifier !== "None" && aiAnalysis.identifier !== "N/A" && (
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t.aiDetectedId}</p>
                          <p className="text-xs font-mono font-black text-indigo-900 bg-white px-2 py-1 rounded-lg border border-indigo-100 inline-block uppercase">{aiAnalysis.identifier}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t.severity}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          aiAnalysis.severity?.toLowerCase().includes('high') || aiAnalysis.severity?.toLowerCase().includes('critical') 
                          ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {aiAnalysis.severity}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t.safetyRisk}</p>
                        <p className="text-xs font-bold text-indigo-900">{aiAnalysis.safetyRisk}</p>
                      </div>
                    </div>
                  </div>
                )}
                </div>

                {/* Warning Note */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                    {t.recordDisclaimer || "This report will be transmitted to the local municipality for immediate action."}
                </p>
                </div>

                {/* Submit Button */}
                <div className="space-y-4">
                    {isAnalyzing && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                            <Loader2 className="animate-spin text-indigo-600" size={20} />
                            <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">{t.analyzingPhoto}</p>
                        </div>
                    )}
                    
                    <button
                        disabled={isSubmitting || isAnalyzing}
                        type="submit"
                        className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                    >
                        {isSubmitting || isAnalyzing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {isAnalyzing ? t.analyzingPhoto : t.processing}
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                {t.submitGarbage}
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 opacity-50">
                        <ShieldCheck size={12} className="text-slate-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{t.blockchainVerified}</span>
                    </div>
                </div>
            </form>
          )}
        </div>
      </div>

      {/* Tracking Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between px-2">
            <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                <MapPin className="text-emerald-600" size={20} /> {t.activeCivicReports}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.trackYourReports}</p>
            </div>
            {activeReports.length > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">{activeReports.length} {t.active}</span>
            )}
        </div>

        {activeReports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center">
                <Info size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t.reportsNone}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {activeReports.map((report) => {
                    const category = issueCategories.find(c => c.id === report.type) || issueCategories[0];
                    const activeStep = getActiveStepInfo(report.roadmap);
                    
                    return (
                        <div key={report.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:border-emerald-200 hover:shadow-md group">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${category.bg} ${category.color}`}>
                                        <category.icon size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900 leading-tight">{category.label}</h3>
                                            <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Ref: {report.refNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5 overflow-hidden">
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 truncate">
                                                <MapPin size={10} /> {report.location}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 shrink-0 uppercase tracking-widest">• {report.dateReported}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                     {activeStep?.label}
                                </div>
                            </div>

                            <div className="flex justify-between items-start w-full max-w-2xl mx-auto mb-6 px-4">
                                {report.roadmap.map((step, sIdx) => (
                                    <CivicRoadmapStep 
                                        key={sIdx} 
                                        label={step.label} 
                                        status={step.status} 
                                        isLast={sIdx === report.roadmap.length - 1} 
                                    />
                                ))}
                            </div>

                            <div className="space-y-4 mb-6">
                                {report.roadmap.filter(s => s.status !== 'upcoming').map((step, sIdx) => (
                                    <div key={sIdx} className={`p-4 rounded-2xl border ${step.status === 'current' ? 'bg-amber-50 border-amber-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {step.status === 'completed' ? <CheckCircle size={14} className="text-emerald-600" /> : <Clock size={14} className="text-amber-600" />}
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${step.status === 'current' ? 'text-amber-900' : 'text-slate-600'}`}>{step.label}</span>
                                            </div>
                                            {step.authority && (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg border border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500">
                                                    <Landmark size={10} /> {step.authority}
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-[10px] font-medium leading-relaxed ${step.status === 'current' ? 'text-amber-800' : 'text-slate-500'}`}>{step.description}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-medium text-slate-600 italic mb-4">
                                "{report.description}"
                            </div>

                            {report.analysis && (
                                <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 md:p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Zap size={14} className="text-indigo-600" />
                                        <span className="text-[9px] font-black text-indigo-900 uppercase tracking-[0.2em]">{t.aiResponse}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.details}</p>
                                            <p className="text-[10px] font-bold text-indigo-800 leading-relaxed">{report.analysis.details}</p>
                                        </div>
                                        {report.analysis.identifier && report.analysis.identifier !== "None" && report.analysis.identifier !== "N/A" && (
                                            <div>
                                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.aiDetectedId}</p>
                                                <p className="text-[10px] font-mono font-black text-indigo-900 bg-white px-2 py-1 rounded-lg border border-indigo-100 inline-block uppercase">{report.analysis.identifier}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.severity}</p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                report.analysis.severity?.toLowerCase().includes('high') || report.analysis.severity?.toLowerCase().includes('critical') 
                                                ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {report.analysis.severity}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t.safetyRisk}</p>
                                            <p className="text-[10px] font-bold text-indigo-800 leading-relaxed">{report.analysis.safetyRisk}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default CivicReport;
