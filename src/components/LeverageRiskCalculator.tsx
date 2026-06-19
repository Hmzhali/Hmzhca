/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketPair } from '../types';
import { AlertOctagon, HelpCircle, RefreshCw, Sparkles, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LeverageRiskCalculatorProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
  defaultPrice: number;
  defaultLeverage: number;
  defaultSide: 'BUY' | 'SELL';
  onApplyToForm?: (price: string, leverage: number, side: 'BUY' | 'SELL') => void;
}

export default function LeverageRiskCalculator({
  lang,
  activePair,
  defaultPrice,
  defaultLeverage,
  defaultSide,
  onApplyToForm
}: LeverageRiskCalculatorProps) {
  // Sync core values with parent form, but allow manual simulation overrides in the calculator
  const [direction, setDirection] = useState<'BUY' | 'SELL'>(defaultSide);
  const [entryPrice, setEntryPrice] = useState<string>(defaultPrice.toString());
  const [leverage, setLeverage] = useState<number>(defaultLeverage);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Synchronize state when defaults from parent manual trading form change
  useEffect(() => {
    setDirection(defaultSide);
  }, [defaultSide]);

  useEffect(() => {
    setEntryPrice(defaultPrice.toString());
  }, [defaultPrice]);

  useEffect(() => {
    setLeverage(defaultLeverage);
  }, [defaultLeverage]);

  // Handle price reset button
  const handleResetToCurrentPrice = () => {
    setEntryPrice(activePair.currentPrice.toFixed(2));
  };

  const parsedPrice = parseFloat(entryPrice) || 0;

  // Calculate Estimation of Liquidation Price
  // Maintenance Margin Ratio (MMR) is typically 0.5% (0.005) on tier-1 exchanges
  const MMR = 0.005;
  let liquidationPrice = 0;

  if (parsedPrice > 0 && leverage > 0) {
    if (direction === 'BUY') {
      // Long position liquidation formula: Entry * (1 - 1/leverage + MMR)
      liquidationPrice = parsedPrice * (1 - 1 / leverage + MMR);
      if (liquidationPrice < 0) liquidationPrice = 0;
    } else {
      // Short position liquidation formula: Entry * (1 + 1/leverage - MMR)
      liquidationPrice = parsedPrice * (1 + 1 / leverage - MMR);
    }
  }

  // Calculate percentage of movement required to hit liquidation
  const priceDistancePercent = parsedPrice > 0
    ? (Math.abs(parsedPrice - liquidationPrice) / parsedPrice) * 100
    : 0;

  // Determine risk level category dynamically
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (leverage >= 25 || priceDistancePercent <= 4) {
    riskLevel = 'HIGH';
  } else if (leverage >= 10 || priceDistancePercent <= 10) {
    riskLevel = 'MEDIUM';
  }

  // Dictionary translations
  const d = {
    title: lang === 'ar' ? 'حاسبة مخاطر الرافعة المالية الهامشية' : 'Leverage & Liquidation Risk Calculator',
    subtitle: lang === 'ar' ? 'قم بتقدير سعر التصفية ونسبة تحمّل الهامش لتجنب تصفية العقد' : 'Estimate liquidation thresholds and leverage tolerance to secure positions',
    direction: lang === 'ar' ? 'اتجاه الصفقة المتوقع' : 'Target Position Mode',
    long: lang === 'ar' ? 'شراء / صعود (Long)' : 'Long / Buy Position',
    short: lang === 'ar' ? 'بيع / هبوط (Short)' : 'Short / Sell Position',
    entryPrice: lang === 'ar' ? 'سعر الدخول المقدر (USDT)' : 'Est. Entry Price (USDT)',
    leverage: lang === 'ar' ? 'مضاعف الرافعة المالية' : 'Leverage Multiplier',
    reset: lang === 'ar' ? 'السعر الحالي' : 'Use Current Price',
    liquidationHeader: lang === 'ar' ? 'سعر التصفية المقدر' : 'Estimated Liquidation Price',
    distanceHeader: lang === 'ar' ? 'النسبة المئوية المتبقية للتصفية' : 'Movement to Liquidation',
    riskHeader: lang === 'ar' ? 'مؤشر خطورة المركز الهامشي' : 'Leverage Risk Grade',
    riskLow: lang === 'ar' ? 'مخاطر منخفضة' : 'Low Risk Tier',
    riskMedium: lang === 'ar' ? 'مخاطر متوسطة' : 'Medium Risk Tier',
    riskHigh: lang === 'ar' ? 'مخاطر مرتفعة جداً!' : 'Extreme Hazard Grid!',
    explanationToggle: lang === 'ar' ? 'كيف يتم احتساب التصفية؟' : 'How does liquidation work?',
    explanationText: lang === 'ar' 
      ? 'التصفية (Liquidation) تحدث عندما تنفد أموال المحفظة التابعة للهامش المودع لتغطية خسائر الصفقة المفتوحة. كلما ارتفعت الرافعة المالية، صغر الهامش المطلوب للتداول واقترب سعر التصفية من سعر دخولك، مما يعرض المركز للإغلاق الجبري الفوري عند أي تحرك طفيف للسوق عكس اتجاهك.'
      : 'Liquidation occurs when the market moves against your leveraged position, and your margin balance falls below the maintenance requirement. Highly leveraged trades require tiny negative fluctuations to hit the liquidation price, resulting in auto-closure of the trade and loss of margin.',
    applyBtn: lang === 'ar' ? 'تطبيق القيم الحالية على استمارة التداول اليدوي' : 'Apply values to manual trade form',
    safeZone: lang === 'ar' ? 'منطقة آمنة نسبياً' : 'Relatively Safe Zone',
    hazardZone: lang === 'ar' ? 'تحذير تصفية وشيك' : 'Imminent Liquidation Danger',
  };

  const handleApplyValues = () => {
    if (onApplyToForm && parsedPrice > 0) {
      onApplyToForm(entryPrice, leverage, direction);
    }
  };

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden" 
      id="leverage-risk-calculator-root"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Decorative ambient subtle light corner */}
      <div className={`absolute top-0 opacity-[0.03] pointer-events-none w-32 h-32 rounded-full blur-2xl ${
        riskLevel === 'HIGH' ? 'bg-rose-500 right-0' : riskLevel === 'MEDIUM' ? 'bg-amber-500 left-0' : 'bg-emerald-500 right-0'
      }`} />

      {/* Header Area */}
      <div className="flex items-center gap-2.5 mb-4 border-b border-slate-850 pb-3 justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
            riskLevel === 'HIGH' 
              ? 'bg-rose-500/10 border-rose-500/30' 
              : riskLevel === 'MEDIUM' 
              ? 'bg-amber-500/10 border-amber-500/20' 
              : 'bg-emerald-500/10 border-emerald-500/20'
          }`}>
            <ShieldAlert className={`w-4.5 h-4.5 ${
              riskLevel === 'HIGH' ? 'text-rose-400 animate-pulse' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
            }`} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 leading-none">
              {d.title}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-1 tracking-tight">
              {d.subtitle}
            </span>
          </div>
        </div>
        
        {/* Help button explanation tag */}
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          id="calc-help-explanation-toggle-btn"
          className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          title={d.explanationToggle}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Explanatory Context Modal banner */}
      {showExplanation && (
        <div 
          className="mb-4 p-3 bg-slate-950/80 border border-amber-500/20 rounded-lg text-[11px] text-slate-300 leading-relaxed font-sans relative"
          id="calc-explanation-banner"
        >
          <p>{d.explanationText}</p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-500 font-semibold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Formula MMR ≈ 0.5% (Binance/Bybit Standard)</span>
          </div>
        </div>
      )}

      {/* Interactive controls grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Position direction selection */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1.5 font-bold">
            {d.direction}
          </label>
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 h-9">
            <button
              type="button"
              onClick={() => setDirection('BUY')}
              id="calc-dir-buy-btn"
              className={`text-[10px] font-bold rounded flex items-center justify-center gap-0.5 transition cursor-pointer select-none ${
                direction === 'BUY'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'شراء' : 'Long'}</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('SELL')}
              id="calc-dir-sell-btn"
              className={`text-[10px] font-bold rounded flex items-center justify-center gap-0.5 transition cursor-pointer select-none ${
                direction === 'SELL'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'بيع' : 'Short'}</span>
            </button>
          </div>
        </div>

        {/* Input price entry */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] text-slate-400 block font-bold">
              {d.entryPrice}
            </label>
            <button
              type="button"
              onClick={handleResetToCurrentPrice}
              id="calc-sync-price-btn"
              className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer bg-slate-850/50 hover:bg-slate-800 border border-slate-750/30 px-1 py-0.5 rounded"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>{d.reset}</span>
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              id="calc-entry-price-input"
              className="w-full bg-slate-950 text-slate-100 font-mono text-xs px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:border-amber-500/50 h-9"
              placeholder="0.00"
            />
            <span className="absolute right-2.5 top-2.5 text-[8px] text-slate-500 font-mono select-none">USDT</span>
          </div>
        </div>

        {/* Custom Leverage multiplier slider & number selection */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[10px] text-slate-400 block font-bold">
              {d.leverage}
            </label>
            <span className="text-[10px] text-amber-400 font-mono font-extrabold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              {leverage}x
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              id="calc-leverage-slider-input"
              className="flex-1 accent-amber-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800"
            />
            <input
              type="number"
              min="1"
              max="100"
              value={leverage}
              onChange={(e) => setLeverage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              id="calc-leverage-number-input"
              className="w-12 text-center bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 rounded-lg py-1 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Outputs & Results Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-850">
        {/* Estimated Liquidation Price result */}
        <div className="md:col-span-4 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
            {d.liquidationHeader}
          </span>
          <span className={`text-lg font-mono font-extrabold ${
            riskLevel === 'HIGH' ? 'text-rose-400' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            ${liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-sans text-slate-400 font-normal ml-1">USDT</span>
          </span>
        </div>

        {/* Percentage distance movement to liquidation */}
        <div className="md:col-span-4 flex flex-col justify-center border-t md:border-t-0 md:border-x border-slate-850 py-2.5 md:py-0 md:px-4">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
            {d.distanceHeader}
          </span>
          <span className="text-sm font-mono font-extrabold text-slate-200 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              riskLevel === 'HIGH' ? 'bg-rose-500 animate-ping' : riskLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
            {priceDistancePercent.toFixed(2)}%
            <span className="text-[9px] text-slate-500 font-normal">
              ({direction === 'BUY' ? '-' : '+'})
            </span>
          </span>
        </div>

        {/* Leverage risk monitor visual bar */}
        <div className="md:col-span-4 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1.5">
            {d.riskHeader}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  riskLevel === 'HIGH' 
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 w-full' 
                    : riskLevel === 'MEDIUM' 
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400 w-2/3' 
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400 w-1/3'
                }`}
              />
            </div>
            <span className={`text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
              riskLevel === 'HIGH' 
                ? 'bg-rose-950/30 text-rose-400 border-rose-900/30 font-bold' 
                : riskLevel === 'MEDIUM' 
                ? 'bg-amber-950/20 text-amber-400 border-amber-900/30 font-bold' 
                : 'bg-emerald-950/30 text-emerald-400 border-emerald-800/40 font-bold'
            }`}>
              {riskLevel === 'HIGH' ? d.riskHigh : riskLevel === 'MEDIUM' ? d.riskMedium : d.riskLow}
            </span>
          </div>
        </div>
      </div>

      {/* Synchronise back to main trade form controls */}
      {onApplyToForm && (
        <div className="mt-3.5 flex justify-end">
          <button
            type="button"
            onClick={handleApplyValues}
            id="calc-apply-to-form-btn"
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 hover:border-slate-700 transition px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{d.applyBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
}
