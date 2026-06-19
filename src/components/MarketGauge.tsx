/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { MarketPair, SentimentData } from '../types';
import { BrainCircuit, RefreshCw, AlertTriangle, HelpCircle, Flame, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MarketGaugeProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
}

export default function MarketGauge({ lang, activePair }: MarketGaugeProps) {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSentiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: activePair.symbol, lang }),
      });

      if (!response.ok) {
        throw new Error(lang === 'ar' ? 'فشل الاتصال بخادم الاستخبارات المالي.' : 'Failed to communicate with the intelligent analysis server.');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError' && err.message !== 'Failed to fetch') {
        console.warn(err);
      }
      setError(err.message || 'System connectivity error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, [activePair.symbol, lang]);

  // Compute needle endpoint based on score (0 to 100)
  const score = data?.score ?? 50;
  const angleDeg = -180 + (score / 100) * 180;
  const rad = (angleDeg * Math.PI) / 180;
  const needleLen = 82;
  const needleX = 120 + needleLen * Math.cos(rad);
  const needleY = 120 + needleLen * Math.sin(rad);

  // Determine sentiment classification texts & colors
  const getLabelAndColor = () => {
    if (score <= 20) {
      return { 
        text_en: 'Extreme Fear', 
        text_ar: 'خوف شديد', 
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]'
      };
    }
    if (score <= 40) {
      return { 
        text_en: 'Fear', 
        text_ar: 'خوف', 
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]'
      };
    }
    if (score <= 60) {
      return { 
        text_en: 'Neutral', 
        text_ar: 'حيادي', 
        color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25)]'
      };
    }
    if (score <= 80) {
      return { 
        text_en: 'Greed', 
        text_ar: 'طمع', 
        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
      };
    }
    return { 
      text_en: 'Extreme Greed', 
      text_ar: 'طمع شديد', 
      color: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
      glow: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]'
    };
  };

  const currentDef = getLabelAndColor();
  const titleText = lang === 'ar' ? 'مؤشر الخوف والجشع ماليًا' : 'AI Fear & Greed Index';
  const subtitleText = lang === 'ar' ? 'تحليل معنويات السوق المدعم بذكاء جيميناي الفوري' : 'Live pair sentiment synthesized by Gemini AI';
  const labelText = lang === 'ar' ? 'التصنيف الفوري' : 'Current Sentiment';
  const refreshText = lang === 'ar' ? 'تحديث استخباري' : 'Analyze Live';
  const errorText = lang === 'ar' ? 'تعذر تحميل مؤشر معنويات السوق المالي.' : 'Error fetching sentiment index.';
  const retryText = lang === 'ar' ? 'إعادة المحاولة' : 'Retry analysis';

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col h-full overflow-hidden" 
      id="market-fear-greed-panel"
    >
      {/* Decorative top grid effect */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500" />
      
      {/* Header section with icon and refresh control */}
      <div className="flex items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <BrainCircuit className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-none">
              {titleText}
              {data?.simulated && (
                <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-bold uppercase">
                  SIM
                </span>
              )}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-1 tracking-tight">
              {subtitleText}
            </span>
          </div>
        </div>

        <button
          onClick={fetchSentiment}
          disabled={loading}
          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded border border-slate-700 hover:border-slate-650 transition cursor-pointer flex items-center justify-center disabled:opacity-40"
          title={refreshText}
          id="refresh-sentiment-btn"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4" id="gauge-loading-slot">
          {/* Pulsing visual element */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
            <BrainCircuit className="w-10 h-10 text-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5 animate-pulse">
            <p className="text-xs font-mono font-bold text-slate-300">
              {lang === 'ar' ? `جاري مراجعة وتحليل معنويات ${activePair.symbol}...` : `Scanning volume data for ${activePair.symbol}...`}
            </p>
            <p className="text-[10px] text-slate-500">
              {lang === 'ar' ? 'تفكيك الاتجاهات وتصنيف الرغبة الشرائية' : 'Deconstructing exchange depth & market anxiety'}
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4" id="gauge-error-slot">
          <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">{errorText}</h4>
            <p className="text-[10px] text-slate-400 font-mono">{error}</p>
          </div>
          <button
            onClick={fetchSentiment}
            className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-755 border border-slate-700 text-white rounded cursor-pointer transition"
          >
            {retryText}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between" id="gauge-display-slot">
          {/* SVG Speedometer gauge display */}
          <div className="relative flex flex-col items-center py-2">
            <svg viewBox="0 0 240 135" className="w-full max-w-[220px] mx-auto select-none" id="sentiment-svg-meter">
              <defs>
                <linearGradient id="gauge-segments-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" /> {/* Red */}
                  <stop offset="25%" stopColor="#f97316" /> {/* Orange */}
                  <stop offset="50%" stopColor="#fbbf24" /> {/* Yellow */}
                  <stop offset="75%" stopColor="#10b981" /> {/* Green */}
                  <stop offset="100%" stopColor="#14b8a6" /> {/* Teal */}
                </linearGradient>
              </defs>

              {/* Backing arc */}
              <path
                d="M 20 120 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="#1e293b"
                strokeWidth="24"
                strokeLinecap="round"
              />

              {/* Main colored gauge track */}
              <path
                d="M 20 120 A 100 100 0 0 1 220 120"
                fill="none"
                stroke="url(#gauge-segments-grad)"
                strokeWidth="24"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Segment Tick mark overlay delineators */}
              <path d="M 60 40 l 4 7" stroke="#0f172a" strokeWidth="2.5" />
              <path d="M 120 20 l 0 8" stroke="#0f172a" strokeWidth="2.5" />
              <path d="M 180 40 l -4 7" stroke="#0f172a" strokeWidth="2.5" />

              {/* Standard text markings inside */}
              <text x="32" y="112" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0</text>
              <text x="120" y="38" fill="#bc4747" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                {lang === 'ar' ? 'هدوء' : 'BALANCED'}
              </text>
              <text x="208" y="112" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">100</text>

              {/* Dynamic Animated dial needle */}
              <line
                x1="120"
                y1="120"
                x2={needleX}
                y2={needleY}
                stroke="#f8fafc"
                strokeWidth="4"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Center point pin socket */}
              <circle cx="120" cy="120" r="10" fill="#0f172a" stroke="#f1f5f9" strokeWidth="3" />
              <circle cx="120" cy="120" r="4" fill="#10b981" />
            </svg>

            {/* Glowing Digital Score overlay */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-3xl font-black font-mono tracking-tight text-white select-text" id="sentiment-score-badge">
                {score}
              </span>
              <div className={`mt-1 px-3 py-1 text-[11px] font-extrabold rounded border select-none transition-all uppercase tracking-wider flex items-center gap-1 ${currentDef.color} ${currentDef.glow}`}>
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>
                  {lang === 'ar' ? data?.classification_ar : data?.classification}
                </span>
              </div>
            </div>
          </div>

          {/* Rationale and Assessment Explanation Box */}
          <div className="mt-5 space-y-2 select-text" id="sentiment-rationale-box">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans border-b border-slate-800 pb-1.5">
              <span>{lang === 'ar' ? 'التحكيم الفني المالي لـ جيميناي' : 'Gemini Financial Adjudication'}</span>
              <span>{activePair.symbol}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans italic" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? data?.rationale_ar : data?.rationale_en}
            </p>

            {/* Live Indicator Advice Tag footer */}
            <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-850 flex gap-2 items-start" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="p-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                {lang === 'ar' 
                  ? 'مؤشر استشاري لتقييم السيولة اللحظية. لا يعتبر توصية مالية مباشرة للشراء أو البيع.' 
                  : 'Advisory volume-weighted metric. This does not constitute direct advice to open margin coordinates.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
