import React, { useState } from 'react';
import ManualTrading from './ManualTrading';
import BotTrading from './BotTrading';
import { MarketPair, TradeOrder, UserPortfolio, TradingBot } from '../types';

interface SpotTradingProps {
  lang: 'ar' | 'en';
  activePair: string;
  pairs: MarketPair[];
  
  // Manual Trading Props
  onSubmitOrder: (order: TradeOrder) => void;
  orders: TradeOrder[];
  portfolio: UserPortfolio;
  
  // Bot Trading Props
  activeBots: TradingBot[];
  onCreateBot: (bot: any) => void;
  onDeleteBot: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function SpotTrading(props: SpotTradingProps) {
  const [mode, setMode] = useState<'MANUAL' | 'BOTS'>('MANUAL');
  const isAr = props.lang === 'ar';

  const activePairObj = props.pairs.find(p => p.symbol === props.activePair) || props.pairs[0];

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setMode('MANUAL')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
            mode === 'MANUAL' 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isAr ? 'التداول اليدوي' : 'Manual Trade'}
        </button>
        <button
          onClick={() => setMode('BOTS')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
            mode === 'BOTS' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {isAr ? 'بوتات التداول' : 'Trading Bots'}
        </button>
      </div>

      {mode === 'MANUAL' ? (
        <ManualTrading
          lang={props.lang}
          activePair={activePairObj}
          onSubmitOrder={props.onSubmitOrder}
          orders={props.orders}
          portfolio={props.portfolio}
        />
      ) : (
        <BotTrading
          lang={props.lang}
          activePair={activePairObj}
          activeBots={props.activeBots}
          onCreateBot={props.onCreateBot}
          onDeleteBot={props.onDeleteBot}
          onToggleStatus={props.onToggleStatus}
        />
      )}
    </div>
  );
}
