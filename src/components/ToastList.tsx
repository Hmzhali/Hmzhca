/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ToastNotification } from '../types';
import { X, Zap, Sparkles, TrendingUp, BellRing, ArrowUp, ArrowDown, Grid, RefreshCw, AlertTriangle, BrainCircuit } from 'lucide-react';

interface ToastListProps {
  lang: 'ar' | 'en';
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export default function ToastList({ lang, toasts, onDismiss }: ToastListProps) {
  return (
    <div
      className={`fixed bottom-16 z-50 max-w-md w-[88%] sm:w-96 flex flex-col gap-3 pointer-events-none ${
        lang === 'ar' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
      }`}
      style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
      id="arbitrage-toast-hub"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            lang={lang}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: ToastNotification;
  lang: 'ar' | 'en';
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, lang, onDismiss }: ToastItemProps) {
  const isVolatilityWarning = !!toast.isVolatilityWarning;
  const duration = isVolatilityWarning ? 7000 : 5000; // Volatility warnings are crucial, keep longer
  const isPriceAlert = toast.botId === 'price-alert';

  // Setup auto-dismiss timer
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isGrid = toast.botType === 'GRID';
  const botName = isGrid
    ? (lang === 'ar' ? 'بوت التداول الشبكي (Grid Bot)' : 'Spot Grid Bot')
    : (lang === 'ar' ? 'بوت التراكم الدوري (DCA Bot)' : 'DCA Cycle Bot');

  const containerStyle = isVolatilityWarning
    ? "pointer-events-auto w-full bg-slate-900/98 border border-rose-500/50 shadow-[0_12px_40px_rgba(244,63,94,0.3)] rounded-xl overflow-hidden backdrop-blur-md border-l-4 border-l-rose-500 animate-pulse-subtle"
    : isPriceAlert
    ? "pointer-events-auto w-full bg-slate-900/95 border border-amber-500/30 shadow-[0_10px_35px_-5px_rgba(245,158,11,0.2)] rounded-xl overflow-hidden backdrop-blur-md"
    : toast.isMilestone
    ? "pointer-events-auto w-full bg-slate-950/95 border border-indigo-500/50 shadow-[0_10px_35px_-5px_rgba(99,102,241,0.25)] rounded-xl overflow-hidden backdrop-blur-md animate-pulse-subtle"
    : "pointer-events-auto w-full bg-slate-900/95 border border-emerald-500/25 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.15)] rounded-xl overflow-hidden backdrop-blur-md";

  const barColor = isVolatilityWarning
    ? "bg-rose-500"
    : isPriceAlert 
    ? "bg-amber-500" 
    : toast.isMilestone
    ? "bg-indigo-500 animate-pulse"
    : "bg-emerald-500/80";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      className={containerStyle}
      id={`toast-item-${toast.id}`}
    >
      <div className="p-4 flex gap-3.5 items-start">
        {/* Pulsing Visual Icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border relative ${
          isVolatilityWarning
            ? 'bg-rose-500/15 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)] animate-bounce'
            : isPriceAlert 
            ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
            : toast.isMilestone
            ? 'bg-indigo-500/15 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse'
            : isGrid
            ? 'bg-cyan-500/10 border-cyan-500/25 shadow-[0_0_12px_rgba(6,182,212,0.1)]'
            : 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
        }`}>
          {isVolatilityWarning ? (
            <AlertTriangle className="w-5 h-5 text-rose-450" />
          ) : isPriceAlert ? (
            <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
          ) : toast.isMilestone ? (
            <Sparkles className="w-5 h-5 text-indigo-400" />
          ) : isGrid ? (
            <Grid className="w-4 h-4 text-cyan-400 animate-pulse" />
          ) : (
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          )}
          <span className={`absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full animate-ping ${
            isVolatilityWarning ? 'bg-rose-500' : isPriceAlert ? 'bg-amber-500' : toast.isMilestone ? 'bg-indigo-500' : 'bg-emerald-500'
          }`} />
        </div>

        {/* Content text block */}
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide font-sans">
              {isVolatilityWarning
                ? (lang === 'ar' ? '⚠️ تحذير تقلب ذكي (AI)' : '⚠️ Smart Volatility Alert (AI)')
                : isPriceAlert 
                ? (lang === 'ar' ? 'تنبيه السوق المستهدف!' : 'Target Threshold Hit!') 
                : toast.isMilestone
                ? (lang === 'ar' ? '🚀 إنجاز استثنائي للبوت!' : '🚀 Bot milestone achieved!')
                : (lang === 'ar' ? 'تمت صفقة موازنة آمنة!' : 'Arbitrage Trade Filled!')}
            </span>
            <span className="text-[9px] font-mono text-slate-500">
              {new Date(toast.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white leading-snug">
            {isVolatilityWarning
              ? (lang === 'ar' ? 'حركة أسعار حادة مفاجئة (تنبيه ذكي)' : 'Sudden Sharp Volatility Event')
              : isPriceAlert 
              ? (lang === 'ar' ? 'تنبيه مراقبة سعر فوري' : botName) 
              : toast.isMilestone
              ? (lang === 'ar' ? `تجاوز العائد نسبة +${toast.milestonePercentage}%!` : `Net ROI crossed +${toast.milestonePercentage}% milestone!`)
              : botName}
          </h4>

          {isVolatilityWarning ? (
            <div className="space-y-2 mt-1.5">
              <div className="flex items-center gap-2 bg-rose-950/40 p-2 rounded-lg border border-rose-900/35">
                <div className="flex-1">
                  <span className="text-[9px] text-rose-300 block">{lang === 'ar' ? 'الزوج المتقلب' : 'Violent Pair'}</span>
                  <span className="text-xs font-mono font-black text-rose-100">{toast.symbol}</span>
                </div>
                
                <div className="text-right">
                  <span className="text-[9px] text-rose-300 block">{lang === 'ar' ? 'معدل التغير < دقيقة' : 'Rate / min'}</span>
                  <span className="text-xs font-mono font-black text-rose-450" dir="ltr">
                    {toast.volatilityChange && toast.volatilityChange > 0 ? '+' : ''}{toast.volatilityChange?.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 text-[10px] leading-relaxed text-slate-300">
                <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-rose-900/10">
                  <BrainCircuit className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-bold text-rose-300 text-[9px] uppercase tracking-wider">{lang === 'ar' ? 'تحليل محرك الذكاء الاصطناعي' : 'AI Market Intelligence Engine'}</span>
                </div>
                <p className="font-sans leading-normal text-slate-200">
                  {lang === 'ar' ? toast.aiExplanationAr : toast.aiExplanationEn}
                </p>
                <div className="mt-1 pt-1 flex justify-between text-[8px] text-slate-550 font-mono border-t border-slate-800/10">
                  <span>{lang === 'ar' ? 'سعر البداية:' : 'Start:'} ${(toast.volatilityPriceStart || 0).toFixed(2)}</span>
                  <span>{lang === 'ar' ? 'السعر الحالي:' : 'Current:'} ${(toast.volatilityPriceEnd || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : isPriceAlert ? (
            <div className="space-y-2 mt-1.5">
              <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'رمز الزوج' : 'Trading Pair'}</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{toast.symbol}</span>
                </div>
                
                <div className="text-left select-text">
                  <span className="text-[10px] text-slate-400 block text-right">{lang === 'ar' ? 'السعر المستهدف' : 'Target Price'}</span>
                  <span className="text-xs font-mono font-extrabold text-amber-400 flex items-center gap-1 justify-end">
                    {(toast as any).condition === 'ABOVE' ? <ArrowUp className="w-3 h-3 text-emerald-400 inline" /> : <ArrowDown className="w-3 h-3 text-rose-400 inline" />}
                    {(toast as any).value?.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </span>
                </div>
              </div>
              {toast.aiExplanationAr && (
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-900 text-[10px] leading-relaxed text-slate-300">
                    <div className="flex items-center gap-1.5 pb-1 mb-1 border-b border-amber-900/10">
                      <BrainCircuit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-300 text-[9px] uppercase tracking-wider">{lang === 'ar' ? 'تحليل ذكي (Gemini)' : 'Gemini Smart Analysis'}</span>
                    </div>
                    <p className="font-sans leading-normal text-slate-200">
                      {lang === 'ar' ? toast.aiExplanationAr : toast.aiExplanationEn}
                    </p>
                  </div>
              )}
            </div>
          ) : toast.isMilestone ? (
            <div className="flex flex-col gap-1.5 mt-1.5 bg-indigo-950/40 p-2 rounded-lg border border-indigo-900/35">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 block">{lang === 'ar' ? 'الآلية المستخدمة' : 'Bot Strategy'}</span>
                  <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
                    {isGrid ? <Grid className="w-3.5 h-3.5 text-cyan-400" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                    {botName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-indigo-300 block">{lang === 'ar' ? 'الزوج المشغل' : 'Active Pair'}</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{toast.symbol}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-indigo-900/20 flex justify-between items-center text-xs">
                <span className="text-[10px] text-indigo-300">{lang === 'ar' ? 'العائد الفوري المكتسب' : 'Triggering Yield profit'}</span>
                <span className="font-mono font-bold text-emerald-400">+{(toast.profit ?? 0).toFixed(2)} USDT</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
              <div className="flex-1">
                <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'زوج العملات' : 'Trading Pair'}</span>
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  {isGrid ? <Grid className="w-3.5 h-3.5 text-cyan-400" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="font-mono">{toast.symbol}</span>
                </span>
              </div>
              
              <div className="text-left select-text">
                <span className="text-[10px] text-slate-400 block text-right">{lang === 'ar' ? 'العائد الفوري' : 'USDT Earned'}</span>
                <span className="text-xs font-mono font-extrabold text-emerald-400 flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3.5 h-3.5 inline text-emerald-400" />
                  +{(toast.profit ?? 0).toFixed(2)} USDT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition shrink-0 self-start cursor-pointer"
          title={lang === 'ar' ? 'إغلاق' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Countdown Visual Line Indicator */}
      <div className="w-full h-1 bg-slate-950/50">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`h-full ${barColor}`}
        />
      </div>
    </motion.div>
  );
}
