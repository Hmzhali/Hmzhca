import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Zap, X, AlertTriangle } from 'lucide-react';

interface Props {
  lang: 'ar' | 'en';
}

export default function WakeLockToggle({ lang }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // A tiny silent MP3 base64 to keep audio context active
  const silentAudioSrc = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

  useEffect(() => {
    // Setup audio element for background keep-alive
    const audio = new Audio(silentAudioSrc);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggleKeepAlive = async () => {
    if (isActive) {
      // Disable everything
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch (e) {
          console.warn('Wake Lock release warning:', e);
        }
        wakeLockRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsActive(false);
    } else {
      let wakeLockSuccess = false;
      let audioSuccess = false;

      // 1. Try Audio Keep-Alive (Works in background too)
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          audioSuccess = true;
        } catch (err) {
          console.warn('Audio play warning:', err);
        }
      }

      // 2. Try Screen Wake Lock (Requires visible tab)
      if ('wakeLock' in navigator) {
        try {
          const lock = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current = lock;
          wakeLockSuccess = true;
          
          lock.addEventListener('release', () => {
            // Wake lock released (e.g. user minimized window)
            // But audio might still be running!
            wakeLockRef.current = null;
          });
        } catch (err: any) {
          console.warn('Wake Lock warning (expected inside sandboxed iframe):', err);
        }
      }

      if (wakeLockSuccess || audioSuccess) {
        setIsActive(true);
        if (!wakeLockSuccess && audioSuccess) {
          // If in iframe, wake lock fails but audio might succeed
          console.warn("Screen wake lock failed (likely due to iframe), but Background Audio is active.");
        }
      } else {
        setShowWarning(true);
      }
    }
  };

  return (
    <>
      <button
        onClick={toggleKeepAlive}
        title={lang === 'ar' ? 'وضع اليقظة: إبقاء المنصة نشطة في الخلفية' : 'Keep-Alive Mode: Run in background'}
        className={`p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
          isActive 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-transparent'
        }`}
      >
        {isActive ? <Zap className="w-5 h-5 animate-pulse" /> : <Moon className="w-5 h-5" />}
      </button>

      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100">
            <button 
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-bold">
                {lang === 'ar' ? 'وضع اليقظة مقيد بالمعاينة' : 'Keep-Alive Restricted'}
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {lang === 'ar' 
                ? 'المنصة تعمل حالياً في وضع المعاينة (نافذة مضمنة Iframe) داخل منصة AI Studio، وهي بيئة أمنية تقيد ميزات إبقاء الشاشة مضاءة (Screen Wake Lock).' 
                : 'The terminal is running in a sandboxed preview frame (iframe) which restricts Screen Wake Lock API calls by browser policy.'}
              <br /><br />
              {lang === 'ar'
                ? 'لتمكين هذه الميزة بكفاءة، يرجى النقر على زر "فتح في علامة تبويب جديدة ↗️" في أعلى يمين الشاشة وتشغيلها من هناك.'
                : 'To fully leverage Keep-Alive, please open the application in a new tab by clicking the "Open in new tab ↗" button at the top-right of your screen.'}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'فهمت ذلك' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
