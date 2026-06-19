import React from 'react';
import { FuturesPosition } from '../types';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="space-y-2">
      {positions.map((p) => {
        const isPositive = p.unrealizedPnl >= 0;
        return (
          <div key={p.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-100">{p.symbol}</span>
                <span className={`text-[9px] px-1.5 rounded ${p.side === 'LONG' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-rose-900/50 text-rose-300'}`}>
                  {p.side} {p.leverage}x
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                {lang === 'ar' ? 'سعر الدخول:' : 'Entry:'} ${p.entryPrice.toLocaleString()}
              </div>
            </div>
            
            <div className="text-right">
              <div className={`flex items-center gap-1 font-mono text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                ${p.unrealizedPnl.toFixed(2)} ({p.unrealizedPnlPercent.toFixed(2)}%)
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
        );
      })}
    </div>
  );
}
