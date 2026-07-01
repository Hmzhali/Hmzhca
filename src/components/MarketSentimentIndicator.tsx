/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketPair, SentimentData } from '../types';
import { TrendingUp, TrendingDown, Layers, Activity, Zap, Shield, Sparkles } from 'lucide-react';

interface MarketSentimentIndicatorProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
}

export default function MarketSentimentIndicator({ lang, activePair }: MarketSentimentIndicatorProps) {
  const [aiSentiment, setAiSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Volatility math
  const priceRange = activePair.high24h - activePair.low24h;
  const spreadPercent = activePair.low24h > 0 ? (priceRange / activePair.low24h) * 100 : 0;
  
  // Calculate historical trend based on 24h performance and price proximity to high/low
  const rangeProximityPercent = priceRange > 0 
    ? ((activePair.currentPrice - activePair.low24h) / priceRange) * 100
    : 50;

  // Sentiment classification algorithms
  let marketBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let biasStrength = 50; // out of 100

  // Technical indicator
  if (activePair.change24h > 1.2 || (activePair.change24h > 0 && rangeProximityPercent > 70)) {
    marketBias = 'BULLISH';
    biasStrength = Math.min(100, 50 + Math.round(activePair.change24h * 10) + Math.round(rangeProximityPercent / 4));
  } else if (activePair.change24h < -1.2 || (activePair.change24h < 0 && rangeProximityPercent < 30)) {
    marketBias = 'BEARISH';
    biasStrength = Math.min(100, 50 + Math.round(Math.abs(activePair.change24h) * 10) + Math.round((100 - rangeProximityPercent) / 4));
  } else {
    marketBias = 'NEUTRAL';
    biasStrength = 40 + Math.round(Math.abs(50 - rangeProximityPercent));
  }

  // Fetch AI Sentiment to supplement technical indicators
  useEffect(() => {
    let active = true;
    const loadAISentiment = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/gemini/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: activePair.symbol, lang }),
        });
        if (response.ok && active) {
          const result = await response.json();
          setAiSentiment(result);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && err.message !== 'Failed to fetch') {
          console.warn('Silent skip of sentiment summary fetch', err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAISentiment();
    return () => {
      active = false;
    };
  }, [activePair.symbol, lang]);

  // Use AI score to adjust bias strength slightly if available
  const finalBiasStrength = aiSentiment ? Math.round((biasStrength + aiSentiment.score) / 2) : biasStrength;

  // Local Arabic / English translations dictionary
  const d = {
    title: lang === 'ar' ? 'ملخص معنويات السوق والاتجاه الفوري' : 'Market Sentiment Indicator',
    subtitle: lang === 'ar' ? 'فحص تقلبات الأسعار والاتجاهات التاريخية لدعم قرارات البوتات' : 'Deconstruct continuous market bias and price swings in real-time',
    trendLabel: lang === 'ar' ? 'الاتجاه التاريخي (٢٤ ساعة)' : 'Historical 24h Trend',
    volatilityLabel: lang === 'ar' ? 'معدل تقلب الزوج الفوري' : 'Real-time Span Volatility',
    volHigh: lang === 'ar' ? 'مرتفع جداً (اضطراب)' : 'Extreme (Turbulent)',
    volMedium: lang === 'ar' ? 'معتدل (نشط)' : 'Moderate (Healthy)',
    volLow: lang === 'ar' ? 'منخفض (مستقر)' : 'Low (Stable)',
    bullish: lang === 'ar' ? 'صعودي قوي (Bullish)' : 'Strongly Bullish Bias',
    bearish: lang === 'ar' ? 'هبوطي حذر (Bearish)' : 'Active Bearish Sentiment',
    neutral: lang === 'ar' ? 'حيادي متزن (Neutral)' : 'Sideways Consolidation',
    biasLabel: lang === 'ar' ? 'خلاصة المعنويات الحالية' : 'Algorithmic Summary Bias',
    aiVerdict: lang === 'ar' ? 'تقييم فوري مدعوم بالذكاء الاصطناعي:' : 'Gemini AI Integrated Insights:',
    aiThinking: lang === 'ar' ? 'جاري تحليل الاتجاهات ماليًا...' : 'Analyzing key trends...',
    strengthLabel: lang === 'ar' ? 'قوة الاتجاه العام' : 'Calculated Trend Intensity',
  };

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden" 
      id="market-sentiment-indicator-root"
    >
      {/* Visual top bar glow based on direction side */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-300 ${
        marketBias === 'BULLISH' 
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
          : marketBias === 'BEARISH' 
          ? 'bg-gradient-to-r from-rose-500 to-rose-400' 
          : 'bg-gradient-to-r from-amber-500 to-amber-400'
      }`} />

      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-850 pb-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-indigo-400" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5 leading-none">
              {d.title}
            </h3>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {d.subtitle}
            </span>
          </div>
        </div>

        {/* Action badge with calculated intensity */}
        <span className="text-[9px] font-mono bg-slate-950 font-bold px-2 py-1 rounded-lg border border-slate-800 text-slate-300">
          SPREAD: {spreadPercent.toFixed(2)}%
        </span>
      </div>

      {/* Sentiment summaries, historical volatility and dynamic progress indicator side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {/* Sentiment Gauge Bias Summary */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-wider">
              {d.biasLabel}
            </span>
            <div className="flex items-center gap-2.5">
              {marketBias === 'BULLISH' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              )}
              {marketBias === 'BEARISH' && (
                <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
              )}
              {marketBias === 'NEUTRAL' && (
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Activity className="w-4 h-4" />
                </div>
              )}
              <div>
                <span className={`text-sm font-extrabold block ${
                  marketBias === 'BULLISH' ? 'text-emerald-400' : marketBias === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {marketBias === 'BULLISH' ? d.bullish : marketBias === 'BEARISH' ? d.bearish : d.neutral}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {lang === 'ar' ? `بناءً على تغير ٢٤ساعة الحاصل (${activePair.change24h.toFixed(2)}%)` : `Driven by 24h market swing index (${activePair.change24h.toFixed(2)}%)`}
                </span>
              </div>
            </div>
          </div>

          {/* Trend strength indicator tracker bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1 text-[9px] text-slate-400">
              <span>{d.strengthLabel}</span>
              <span className="font-mono font-bold text-white">{finalBiasStrength}%</span>
            </div>
            <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  marketBias === 'BULLISH' 
                    ? 'bg-emerald-500' 
                    : marketBias === 'BEARISH' 
                    ? 'bg-rose-500' 
                    : 'bg-amber-400'
                }`}
                style={{ width: `${finalBiasStrength}%` }}
              />
            </div>
          </div>
          
          {/* AI Sentiment Score bar */}
          {aiSentiment && (
            <div className="mt-3 pt-3 border-t border-slate-850">
              <div className="flex justify-between items-center mb-1 text-[9px] text-indigo-300">
                <span>{lang === 'ar' ? 'مؤشر تفاؤل السوق (Gemini)' : 'Market Sentiment Score'}</span>
                <span className="font-mono font-bold text-white">{aiSentiment.score}%</span>
              </div>
              <div className="bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${aiSentiment.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Market Indicators List Column */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Volatility Status Item */}
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-900">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span>{d.volatilityLabel}</span>
              </div>
              <span className={`font-mono text-[10px] font-bold uppercase ${
                spreadPercent >= 5 ? 'text-rose-400' : spreadPercent >= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {spreadPercent >= 5 ? d.volHigh : spreadPercent >= 2 ? d.volMedium : d.volLow}
              </span>
            </div>

            {/* Price Proximity To 24h Highs */}
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-900/40">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Zap className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === 'ar' ? 'مستوى السعر الحالي للقمة' : 'Current Price Level relative to High'}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-300">
                {rangeProximityPercent.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Integrated Quick Insights Footer */}
          <div className="bg-slate-900/60 p-2 rounded border border-slate-850 flex gap-1.5 items-start mt-1">
            <div className="p-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-[10px] text-slate-400 leading-normal select-text">
              <span className="font-bold text-slate-200 block mb-0.5">
                {d.aiVerdict}
              </span>
              {loading ? (
                <span className="animate-pulse flex items-center gap-1 text-[9px] text-indigo-400">
                  <Activity className="w-2.5 h-2.5 animate-spin" />
                  {d.aiThinking}
                </span>
              ) : aiSentiment ? (
                <span className="italic block">
                  {lang === 'ar' ? aiSentiment.classification_ar : aiSentiment.classification} - {lang === 'ar' ? aiSentiment.rationale_ar : aiSentiment.rationale_en}
                </span>
              ) : (
                <span className="text-slate-500 italic block">
                  {lang === 'ar' ? 'مستقر في انتظار تقييم جيري المعايرة.' : 'Evaluating volatility support structure.'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
