import React, { useEffect, useState } from 'react';
import { History, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  margin: number;
  leverage: number;
  realizedPnl: number;
  timestamp: string;
}

interface BotTradesHistoryProps {
  lang: 'ar' | 'en';
}

export default function BotTradesHistory({ lang }: BotTradesHistoryProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [botEnabled, setBotEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.text())
      .then(text => {
        if (text.startsWith('<!') || text.includes('Rate exceeded')) return;
        const d = JSON.parse(text);
        setBotEnabled(d.botEnabled);
      })
      .catch((e: any) => {
        if (e.message !== 'Failed to fetch') console.error(e);
      });
  }, []);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch('/api/bot/trades');
        if (!response.ok) return;
        const text = await response.text();
        if (text.startsWith('<!') || text.includes('Rate exceeded')) return;
        const data = JSON.parse(text);
        if (data.trades) {
          setTrades(data.trades);
        }
      } catch (e: any) {
        if (e.message !== 'Failed to fetch') {
          console.error('Error fetching trades', e);
        }
      }
    };
    fetchTrades();
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleScalper = async () => {
    try {
      const resp = await fetch('/api/bot/toggle', { method: 'POST' });
      if (!resp.ok) return;
      const text = await resp.text();
      if (text.startsWith('<!') || text.includes('Rate exceeded')) return;
      const data = JSON.parse(text);
      setBotEnabled(data.botEnabled);
    } catch (e) {
      console.error('Failed to toggle bot', e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col mb-5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Autonomous Scalper Toggle inside History */}
      <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/50 mb-5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${botEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}/>
            <div>
               <h4 className="text-xs font-bold text-slate-100">{lang === 'ar' ? 'نظام السكالبينج المستقل' : 'Autonomous Scalping System'}</h4>
               <p className="text-[9px] text-slate-400">{lang === 'ar' ? 'يعمل في الخلفية دائماً، وسيبقى يعمل حتى وإن أغلقت الصفحة.' : 'Runs in background 24/7, even if you close the app.'}</p>
            </div>
         </div>
         <button onClick={toggleScalper} className={`px-4 py-1.5 text-xs rounded font-black transition ${botEnabled ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-slate-800 text-slate-400'}`}>
            {botEnabled ? (lang === 'ar' ? 'نشط 🟢' : 'ACTIVE 🟢') : (lang === 'ar' ? 'معطل 🔴' : 'DISABLED 🔴')}
         </button>
      </div>

      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
        <History className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-black text-slate-100">
          {lang === 'ar' ? 'سجل الأرباح الخاطفة (السكالبينج)' : 'Autonomous Scalping History'}
        </h3>
      </div>
      
      <div className="overflow-y-auto w-full pr-2 space-y-2 custom-scrollbar max-h-[300px]">
        {trades.length === 0 ? (
          <div className="text-center p-6 text-slate-500 text-xs text-balance">
            {lang === 'ar' ? 'لا توجد صفقات منفذة حتى الآن. البوت يترقب الفرص...' : 'No trades executed yet. The bot is analyzing...'}
          </div>
        ) : (
          trades.map((trade, index) => (
            <div key={`${trade.id}-${index}`} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] hover:border-slate-700 transition">
               <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{trade.symbol}</span>
                    <span className={`px-1.5 rounded font-black text-[9px] ${trade.side?.includes('LONG') ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50' : 'bg-rose-950/80 text-rose-400 border border-rose-900/50'}`}>
                      {trade.side ? trade.side.replace('_SCALP', '') : trade.side} {trade.leverage}x
                    </span>
                 </div>
                 <span className="text-[9px] text-slate-500">{new Date(trade.timestamp).toLocaleString()}</span>
               </div>
               
               <div className="flex flex-col text-right">
                  <span className={`font-mono font-bold flex items-center justify-end gap-1 ${trade.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.realizedPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trade.realizedPnl >= 0 ? '+' : ''}${trade.realizedPnl?.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {lang === 'ar' ? 'من' : 'In'} ${trade.entryPrice?.toLocaleString()} {lang === 'ar' ? 'إلى' : 'Out'} ${trade.exitPrice?.toLocaleString()}
                  </span>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
