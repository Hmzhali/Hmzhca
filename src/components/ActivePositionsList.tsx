import React from 'react';
import { FuturesPosition } from '../types';
import { X, TrendingUp, TrendingDown, Cpu, Sparkles, Target, ShieldCheck } from 'lucide-react';

interface ActivePositionsListProps {
  positions: FuturesPosition[];
  onClosePosition: (id: string) => void;
  lang: 'ar' | 'en';
}

export default function ActivePositionsList({ positions, onClosePosition, lang }: ActivePositionsListProps) {
  if (positions.length === 0) {
    return (
      <div className="text-center p-6 text-slate-500 text-xs">
        {lang === 'ar' ? 'لا توجد صفقات مفتوحة حالياً' : 'No active positions'}
      </div>
    );
  }

  return (
    <div className="space-y-2" id="active-positions-list">
      {positions.map((p) => {
        const isPositive = p.unrealizedPnl >= 0;
        
        // Smart Trailing Calculation
        const isSmart = p.isSmartTrailing && p.activationPrice;
        const isActivated = isSmart && (p.side === 'LONG' ? p.currentPrice >= p.activationPrice! : p.currentPrice <= p.activationPrice!);
        
        let protectionPrice = 0;
        if (isSmart && p.trailingStopOffset && p.peakPrice) {
          const offset = p.trailingStopOffset / 100;
          protectionPrice = p.side === 'LONG' 
            ? p.peakPrice * (1 - offset)
            : p.peakPrice * (1 + offset);
        }

        return (
          <div key={p.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-100">{p.symbol}</span>
                  <span className={`text-[9px] px-1.5 rounded ${p.side === 'LONG' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-rose-900/50 text-rose-300'}`}>
                    {p.side} {p.leverage}x
                  </span>
                  {p.isSmartTrailing && (
                    <span className="flex items-center gap-0.5 bg-indigo-900/50 text-indigo-300 text-[8px] px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                      <Cpu className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 flex flex-col gap-0.5 mt-1">
                  <div>{lang === 'ar' ? 'سعر الدخول:' : 'Entry:'} ${p.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                  <div className="text-slate-500">
                    {p.id.startsWith('pos-live-') ? (lang === 'ar' ? 'السعر (Mark):' : 'Mark Price:') : (lang === 'ar' ? 'السعر:' : 'Price:')} 
                    ${p.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`flex items-center justify-end gap-1 font-mono text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    ${p.unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                  <div className={`text-[10px] font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {p.unrealizedPnlPercent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                  </div>
                </div>

                <button
                  onClick={() => onClosePosition(p.id)}
                  className="p-1.5 rounded-full hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition"
                  title={lang === 'ar' ? 'إغلاق' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Smart Trailing Monitor Bar */}
            {isSmart && (
              <div className="bg-slate-950/50 border border-indigo-900/20 rounded-md p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isActivated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                      {isActivated 
                        ? (lang === 'ar' ? 'ملاحقة السعر نشطة' : 'AI Trailing Active') 
                        : (lang === 'ar' ? 'في انتظار التفعيل' : 'Awaiting Activation')}
                    </span>
                  </div>
                  {isActivated && (
                    <div className="flex items-center gap-1 text-[8px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      SECURED
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[8px]">
                  <div className="space-y-0.5">
                    <div className="text-slate-500 flex items-center gap-1">
                      <Target className="w-2.5 h-2.5" />
                      {lang === 'ar' ? 'نقطة التعادل/التفعيل:' : 'Activation/BE:'}
                    </div>
                    <div className="text-slate-200 font-mono font-bold">${p.activationPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <div className="text-slate-500 flex items-center justify-end gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                      {lang === 'ar' ? 'حماية الربح الحالية:' : 'Current Protection:'}
                    </div>
                    <div className={`font-mono font-bold ${isActivated ? 'text-indigo-400' : 'text-slate-600'}`}>
                      {isActivated ? `$${protectionPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '---'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar Visualization */}
                <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
                  {!isActivated ? (
                    <div 
                      className="absolute left-0 top-0 h-full bg-indigo-500/40 transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (Math.abs(p.currentPrice - p.entryPrice) / Math.abs(p.activationPrice! - p.entryPrice)) * 100))}%` 
                      }}
                    />
                  ) : (
                    <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-emerald-600/20 via-emerald-500/40 to-emerald-400/20 animate-shimmer" />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
