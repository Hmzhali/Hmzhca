import React, { useState, useMemo } from 'react';
import { Sparkles, BrainCircuit, LineChart, ChevronDown, ChevronUp, AlertTriangle, Target, Activity, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { evaluateTradeDecision, EngineInputs } from '../engine';
import { MarketPair } from '../types';

interface TopOpportunitiesProps {
  lang: 'ar' | 'en';
  livePrices?: Record<string, string>;
  pairs: MarketPair[];
}

export default function TopOpportunities({ lang, livePrices = {}, pairs = [] }: TopOpportunitiesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAr = lang === 'ar';

  const engineResults = useMemo(() => {
    return pairs.map(pair => {
      const liveP = livePrices[pair.symbol];
      const p = liveP ? parseFloat(liveP) : pair.currentPrice;
      const inputs: EngineInputs = {
        symbol: pair.symbol,
        currentPrice: p,
        hist5m: [],
        hist15m: [],
        volume24h: pair.volume24h,
        change24h: pair.change24h,
        rsi: pair.rsi,
        sentimentScore: pair.sentimentScore,
        whaleActivity: 40 + Math.random() * 40, 
      };
      const result = evaluateTradeDecision(inputs);
      return { pair, result };
    })
    .filter(res => res.result.action !== 'HOLD') // Only show actionable setups
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 5); // Top 5
  }, [pairs, livePrices]);

  if (engineResults.length === 0) {
    return (
      <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 text-center text-slate-400">
        <BrainCircuit className="w-8 h-8 mx-auto mb-3 text-slate-600" />
        <p>{isAr ? 'لم يعثر محرك القرار الذكي على فرص قوية حالياً.' : 'AI Engine could not find any high-probability setups right now.'}</p>
        <p className="text-xs mt-1">{isAr ? 'يتم فحص السوق باستمرار...' : 'Scanning the market continuously...'}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/60 p-4 md:p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative">
          <BrainCircuit className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
            {isAr ? 'محرك القرار الذكي (الفرص الحية)' : 'AI Decision Engine (Live Setups)'}
          </h2>
          <p className="text-xs text-slate-450 font-medium">
            {isAr 
              ? 'تقييم شامل ومستمر باستخدام الفلاتر المتعددة والذكاء الاصطناعي'
              : 'Continuous multi-filter and AI-driven market evaluation'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {engineResults.map((op, idx) => {
            const { pair, result } = op;
            const isExpanded = expandedId === pair.symbol;
            
            const isBuy = result.action === 'BUY';
            const actionColor = isBuy ? 'text-emerald-400' : 'text-rose-400';
            const bgAction = isBuy ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

            return (
              <motion.div
                key={pair.symbol}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md shadow-black/20 hover:border-slate-700 transition-colors"
              >
                <div 
                  className="p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : pair.symbol)}
                >
                  
                  {/* Left block */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl border shrink-0 ${bgAction}`}>
                       {isBuy ? <Sparkles className="w-6 h-6 text-emerald-400" /> : <Flame className="w-6 h-6 text-rose-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-lg text-slate-100 tracking-tight">{pair.symbol}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${bgAction} ${actionColor}`}>
                          {isBuy ? (isAr ? 'شراء' : 'BUY') : (isAr ? 'بيع' : 'SELL')}
                        </span>
                        {result.score >= 90 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                            {isAr ? 'قوية جداً' : 'STRONG'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {isAr ? result.aiCommentaryAr : result.aiCommentaryEn}
                      </p>
                    </div>
                  </div>

                  {/* Right Stats */}
                  <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end border-t border-slate-800/60 md:border-t-0 pt-3 md:pt-0">
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Score</span>
                        <span className="font-mono text-sm font-black text-yellow-400">{result.score.toFixed(0)}%</span>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Risk/Reward</span>
                        <span className="font-mono text-sm font-bold text-slate-300">{result.riskRewardRatio.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-lg transition">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-800 bg-slate-950/60 text-xs"
                    >
                      <div className="p-5 space-y-5">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1">
                            <span className="text-slate-500 block text-[9px] font-bold uppercase">
                              {isAr ? 'نطاق الدخول' : 'Entry'}
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-300">{pair.currentPrice.toLocaleString()}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1">
                            <span className="text-slate-500 block text-[9px] font-bold uppercase">
                              {isAr ? 'جني الأرباح (TP)' : 'Take Profit'}
                            </span>
                            <span className="font-mono text-sm font-bold text-emerald-400">{result.takeProfitRef.toFixed(4)}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1">
                            <span className="text-slate-500 block text-[9px] font-bold uppercase">
                              {isAr ? 'وقف الخسارة (SL)' : 'Stop Loss'}
                            </span>
                            <span className="font-mono text-sm font-bold text-rose-400">{result.stopLossRef.toFixed(4)}</span>
                          </div>
                        </div>

                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 space-y-3">
                          <h5 className="font-black text-slate-200 flex items-center gap-2 uppercase">
                            <ShieldCheck className="w-4 h-4 text-indigo-400" />
                            {isAr ? 'فلاتر القرار' : 'Decision Filters'}
                          </h5>
                          
                          <div className="flex flex-wrap gap-2 text-[10px]">
                            {Object.entries(result.filtersPassed).map(([key, passed]) => (
                              <div key={key} className={`px-2 py-1 rounded flex items-center gap-1.5 ${passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                <span className="uppercase">{key}</span>
                                <span>{passed ? '✅' : '❌'}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-800/60 text-slate-300 mt-2 space-y-1">
                            {result.reasons.map((r, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-indigo-500">•</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
