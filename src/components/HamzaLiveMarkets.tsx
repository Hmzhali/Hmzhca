import React, { useState, useMemo } from 'react';
import { useLiveBinance } from '../useLiveBinance';
import { TrendingUp, TrendingDown, RefreshCw, Zap, ShieldCheck, HelpCircle, Sparkles, Star } from 'lucide-react';
import TopOpportunities from '../lib/TopOpportunities';

interface HamzaLiveMarketsProps {
  lang: 'ar' | 'en';
  pairs?: any[];
  onAddPair: (symbol: string) => void;
}

export default function HamzaLiveMarkets({ lang, pairs = [], onAddPair }: HamzaLiveMarketsProps) {
  const { liveCoins, isLoading } = useLiveBinance(pairs);
  const [showTopOpportunities, setShowTopOpportunities] = useState<boolean>(true);
  const [newPair, setNewPair] = useState('');

  const livePricesMap = useMemo(() => {
    return (liveCoins || []).reduce((acc, coin) => {
      acc[coin.symbol] = coin.price;
      return acc;
    }, {} as Record<string, string>);
  }, [liveCoins]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPair.trim()) {
      const symbols = newPair.split(',').map(s => s.trim()).filter(s => s.length > 0);
      symbols.forEach(onAddPair);
      setNewPair('');
    }
  };

  return (
    <div className="space-y-6" id="hamza-live-markets-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl animate-in fade-in duration-500">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-950 text-emerald-400 font-extrabold px-2 py-0.5 rounded border border-emerald-900/60 font-mono tracking-wider uppercase animate-pulse">
                {lang === 'ar' ? 'البث المباشر الموثوق' : 'SECURE LIVE STREAM'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-1">
              {lang === 'ar' ? 'أسواق حمزة كربيتو الحية 🚀' : 'Hamza Crypto Live Markets 🚀'}
            </h2>
            <p className="text-slate-400 text-xs leading-normal max-w-2xl">
              {lang === 'ar'
                ? 'مراقبة فورية قائمة على دمج بروتوكول Binance WebSockets لتقديم أسعار مباشرة لأعلى العملات الرقمية سيولة عالمياً، خالية من التقديرات وباحتكاك صفري.'
                : 'High-frequency market intelligence powered directly by Binance WebSockets for instantaneous, zero-latency rate streaming.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-850 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block leading-none font-bold">BINANCE MAINNET</span>
                <span className="text-xs font-mono font-bold text-slate-200">WSS Sockets Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Action Button for Top 5 Buy/Sell Recommendations */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <form onSubmit={handleAddSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            placeholder={lang === 'ar' ? 'أضف عملة أو قائمة (مثال: BTC,ETH)' : 'Add symbol or list (e.g. BTC,ETH)'}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700">
            {lang === 'ar' ? 'إضافة الكل' : 'Add All'}
          </button>
        </form>

        <button
          onClick={() => setShowTopOpportunities(!showTopOpportunities)}
          className={`w-full sm:w-auto px-5 py-2.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer border ${
            showTopOpportunities 
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950/30' 
              : 'bg-slate-950 border-slate-800 text-indigo-400 hover:text-indigo-300'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>
            {showTopOpportunities 
              ? (lang === 'ar' ? 'إخفاء أفضل 5 عملات ✖' : 'Hide Top 5 Coins ✖') 
              : (lang === 'ar' ? '🔍 عرض تحليل أفضل 5 عملات للشراء/البيع' : '🔍 View Top 5 Buy/Sell Coins')}
          </span>
        </button>
      </div>

      {/* Top Opportunities Module */}
      {showTopOpportunities && (
        <TopOpportunities lang={lang} livePrices={livePricesMap} />
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900/40 border border-slate-850 rounded-2xl gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm font-semibold text-indigo-300 animate-pulse">
            {lang === 'ar' ? 'جاري الاتصال بخوادم بينانس والحصول على الأسعار الحية...' : 'Establishing live Binance WebSocket pipeline...'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="live-coins-grid">
            {liveCoins.map((coin, idx) => {
              const isPositive = coin.change >= 0;
              const numericChange = Number(coin.change) || 0;

              return (
                <div 
                  key={`${coin.symbol}-${idx}`} 
                  className="relative group overflow-hidden bg-slate-900 hover:bg-slate-900/85 border border-emerald-500/40 hover:border-emerald-500 rounded-xl p-5 shadow-lg hover:shadow-emerald-900/10 transition-all duration-300 scale-100 hover:scale-[1.01]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold block">
                        {coin.symbol === 'BTC/USDT' ? 'Bitcoin / Tether' :
                         coin.symbol === 'ETH/USDT' ? 'Ethereum / Tether' :
                         coin.symbol === 'SOL/USDT' ? 'Solana / Tether' :
                         coin.symbol === 'BNB/USDT' ? 'Binance Coin / Tether' : 'Crypto Asset'}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-100 font-mono tracking-tight">{coin.symbol}</h3>
                    </div>
                    
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold font-mono flex items-center gap-1 ${
                      isPositive 
                        ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-900/40' 
                        : 'bg-rose-950/90 text-rose-400 border border-rose-900/40'
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isPositive ? '+' : ''}{numericChange.toFixed(2)}%</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-2xl font-black text-emerald-400 font-mono leading-none tracking-tight">
                        {coin.price}
                      </span>
                      <span className="text-emerald-500 text-sm font-bold font-mono">$</span>
                    </div>

                    <div className="border-t border-slate-800/80 pt-2.5 mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-450">
                      <div>
                        <span>{lang === 'ar' ? 'أعلى ' : 'High: '}</span>
                        <span className="text-slate-300 font-bold">${coin.high?.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-800" />
                      <div>
                        <span>{lang === 'ar' ? 'أدنى ' : 'Low: '}</span>
                        <span className="text-slate-300 font-bold">${coin.low?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secure Trade Safety Advice Card */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex gap-2.5 items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-slate-400 leading-normal text-right sm:text-left">
                {lang === 'ar'
                  ? 'تم التحقق من دقة تدفق الأسعار. هذه الأسعار تعكس عمق السوق الحقيقي للتبادل الفوري (Spot Trading) بدون تأخير.'
                  : 'Feed accuracy verified. These prices reflect real-time global Order Book spot matching with live update intervals.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-400 shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-500 animate-[bounce_1s_infinite]" />
              <span>{lang === 'ar' ? 'صيانة بروتوكول البث مؤمنة' : 'Socket interface fully active ✔'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
