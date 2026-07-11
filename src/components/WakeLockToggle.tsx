import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Zap } from 'lucide-react';

interface Props {
  lang: 'ar' | 'en';
}

export default function WakeLockToggle({ lang }: Props) {
  const [isActive, setIsActive] = useState(false);
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
          console.error(e);
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
          console.error('Audio play error:', err);
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
          console.error('Wake Lock error:', err);
        }
      }

      if (wakeLockSuccess || audioSuccess) {
        setIsActive(true);
        if (!wakeLockSuccess && audioSuccess) {
          // If in iframe, wake lock fails but audio might succeed
          console.warn("Screen wake lock failed (likely due to iframe), but Background Audio is active.");
        }
      } else {
        alert(lang === 'ar' ? '⚠️ المنصة تعمل في وضع المعاينة (نافذة مضمنة) الذي يمنع خاصية إبقاء الشاشة مضاءة.\n\nيرجى النقر على زر (فتح في علامة تبويب جديدة ↗️) أعلى يمين الشاشة، ثم تفعيل الخاصية من هناك لتعمل بكفاءة.' : '⚠️ The platform is running in preview mode (iframe) which blocks the screen wake lock feature.\n\nPlease click the (Open in new tab ↗️) button at the top right of the screen, and activate the feature from there to work properly.');
      }
    }
  };

  return (
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
  );
}
