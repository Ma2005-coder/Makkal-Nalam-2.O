import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Info, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

// Shared decode/encode functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const getLanguageName = (lang: Language) => {
    if (lang === 'ta') return t.tamil;
    return t.english;
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  }, []);

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const langName = getLanguageName(language);

    try {
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            setIsActive(true);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent.outputTranscription.text);
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => stopSession(),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: `You are a helpful Makkal Nalam assistant. Speak and understand only in ${langName}. Help citizens understand government schemes. Keep it very simple.`,
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error('Failed to start session', error);
      setStatus('idle');
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col justify-center min-h-[60vh] animate-in slide-in-from-bottom-5 duration-700">
      <div className="bg-slate-900 p-8 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden text-center">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
         
         <div className="mb-12 relative z-10">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.aiVoiceIntelligence}</h2>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">{t.talkToMakkalNalam}</p>
         </div>

         <div className="flex flex-col items-center justify-center gap-12 relative z-10">
            <div className="relative group">
               {isActive && (
                 <div className="absolute inset-[-40px] flex justify-center items-center pointer-events-none">
                    <div className="w-40 h-40 border-4 border-emerald-500/20 rounded-full animate-ping" />
                    <div className="w-40 h-40 border-4 border-emerald-500/10 rounded-full animate-ping [animation-delay:0.5s]" />
                 </div>
               )}
               
               <button
                 onClick={isActive ? stopSession : startSession}
                 className={`w-36 h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative z-20 ${
                   isActive 
                   ? 'bg-red-500 text-white rotate-90 scale-90' 
                   : 'bg-emerald-600 text-white hover:scale-105 active:scale-95'
                 }`}
               >
                 {status === 'connecting' ? (
                   <Loader2 size={48} className="animate-spin" />
                 ) : isActive ? (
                   <MicOff size={48} />
                 ) : (
                   <Mic size={48} />
                 )}
               </button>

               <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                  isActive ? 'bg-emerald-500 border-emerald-400 text-slate-900 shadow-xl' : 'bg-slate-800 border-slate-700 text-slate-500'
               }`}>
                  {status.toUpperCase()}
               </div>
            </div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] min-h-[120px] flex flex-col items-center justify-center">
              {transcription ? (
                <p className="text-white text-lg font-medium leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-300 px-4">
                  "{transcription}"
                </p>
              ) : (
                <div className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                   <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isActive ? 'animate-bounce' : 'opacity-20'}`} />
                   <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 [animation-delay:0.2s] ${isActive ? 'animate-bounce' : 'opacity-20'}`} />
                   <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500 [animation-delay:0.4s] ${isActive ? 'animate-bounce' : 'opacity-20'}`} />
                   {isActive ? (language === 'ta' ? 'கேட்கிறேன்...' : 'Listening...') : 'Tap Mic to Start'}
                </div>
              )}
            </div>
         </div>

         <div className="mt-12 pt-12 border-t border-white/5 flex flex-wrap justify-center gap-4 relative z-10">
            {['Pudhumai Penn', 'Magalir Urimai', 'Housing Docs'].map((suggestion, i) => (
              <button 
                key={i} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 text-[10px] font-bold transition-all"
              >
                "{suggestion} ?"
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;