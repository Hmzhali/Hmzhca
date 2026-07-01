/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketPair, PriceAlert } from '../types';
import { Bell, BellOff, Trash2, ArrowUpRight, ArrowDownRight, ShieldCheck, AlertCircle, Volume2 } from 'lucide-react';

interface PriceAlertManagerProps {
  lang: 'ar' | 'en';
  activePair: MarketPair;
  priceAlerts: PriceAlert[];
  onAddAlert: (type: 'PRICE' | 'RSI', value: number, condition: 'ABOVE' | 'BELOW') => void;
  onDeleteAlert: (id: string) => void;
}

export default function PriceAlertManager({
  lang,
  activePair,
  priceAlerts,
  onAddAlert,
  onDeleteAlert
}: PriceAlertManagerProps) {
  const [targetPriceInput, setTargetPriceInput] = useState<string>('');
  const [targetRsiInput, setTargetRsiInput] = useState<string>('70');
  const [alertType, setAlertType] = useState<'PRICE' | 'RSI'>('PRICE');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // ... (keep useEffects for notification permission) ...
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Set default price when active pair changes
  useEffect(() => {
    setTargetPriceInput(activePair.currentPrice.toFixed(1));
  }, [activePair.symbol]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const resp = await Notification.requestPermission();
      setPermissionStatus(resp);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const value = alertType === 'PRICE' ? parseFloat(targetPriceInput) : parseFloat(targetRsiInput);
    if (isNaN(value) || value <= 0) return;

    onAddAlert(alertType, value, condition);
    
    // Request permission if not already prompted or granted
    if ('Notification' in window && Notification.permission === 'default') {
      requestPermission();
    }
  };

  const currentPairAlerts = priceAlerts.filter((alert) => alert.symbol === activePair.symbol);

  // Localization Dictionary
  const d = {
    title: lang === 'ar' ? 'منظم التنبيهات' : 'Alerts Manager',
    subtitle: lang === 'ar' ? 'تلقي إشعارات عند اختراق المستهدف' : 'Get notifications on threshold breach',
    setPriceLabel: lang === 'ar' ? 'السعر (USDT)' : 'Price (USDT)',
    setRsiLabel: lang === 'ar' ? 'مؤشر RSI' : 'RSI Level',
    conditionLabel: lang === 'ar' ? 'الشرط' : 'Condition',
    aboveLabel: lang === 'ar' ? 'أعلى من' : 'Above',
    belowLabel: lang === 'ar' ? 'أقل من' : 'Below',
    createBtn: lang === 'ar' ? 'تنشيط التنبيه' : 'Arm Alert',
    activeAlertsTitle: lang === 'ar' ? 'التنبيهات النشطة' : 'Active Alerts',
    emptyAlerts: lang === 'ar' ? 'لا توجد تنبيهات لـ ' : 'No active alerts for ',
    typePrice: lang === 'ar' ? 'سعر' : 'Price',
    typeRsi: lang === 'ar' ? 'RSI' : 'RSI',
    // ... rest of dictionary
  };

  return (
    <div 
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between overflow-hidden" 
      id="price-alerts-control-panel"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div>
        {/* Header Title & Subtitle */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-850 pb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 leading-none">
              {d.title}
            </h3>
            <span className="text-[10px] text-slate-400 block mt-1 tracking-tight">
              {d.subtitle}
            </span>
          </div>
        </div>

        {/* ... (Permission control) ... */}

        {/* Alert Creation Form */}
        <form onSubmit={handleCreateAlert} className="space-y-3.5">
          <div className="flex gap-2 mb-2 p-1 bg-slate-950 rounded-lg">
             <button type="button" onClick={() => setAlertType('PRICE')} className={`flex-1 py-1 text-[10px] font-bold rounded ${alertType === 'PRICE' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                {d.typePrice}
             </button>
             <button type="button" onClick={() => setAlertType('RSI')} className={`flex-1 py-1 text-[10px] font-bold rounded ${alertType === 'RSI' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                {d.typeRsi}
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Condition toggle selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold">
                {d.conditionLabel}
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`py-1 text-[10px] font-bold rounded transition ${
                    condition === 'ABOVE'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.aboveLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`py-1 text-[10px] font-bold rounded transition ${
                    condition === 'BELOW'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.belowLabel}
                </button>
              </div>
            </div>

            {/* Target Value input field */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold">
                {alertType === 'PRICE' ? d.setPriceLabel : d.setRsiLabel}
              </label>
              <input
                  type="number"
                  step="any"
                  value={alertType === 'PRICE' ? targetPriceInput : targetRsiInput}
                  onChange={(e) => alertType === 'PRICE' ? setTargetPriceInput(e.target.value) : setTargetRsiInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500/50 rounded-lg py-1.5 px-3 text-xs font-mono font-bold text-white focus:outline-none transition"
                  placeholder="0.0"
                  required
                />
                  {alertType === 'RSI' && (
                  <div className="flex items-center gap-2 mt-1.5 p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400">RSI:</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">{(activePair as any).rsi || 50}</span>
                  </div>
                )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 rounded-lg text-xs font-bold text-slate-950 shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-slate-950 fill-current" />
            <span>{d.createBtn}</span>
          </button>
        </form>
      </div>
      
      {/* Active Alerts List Container - update mapping */}
      <div className="mt-5 pt-4 border-t border-slate-850">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          {d.activeAlertsTitle} ({activePair.symbol})
        </h4>

        {currentPairAlerts.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic py-1 leading-normal">
            {d.emptyAlerts} <span className="font-mono font-bold text-slate-400">{activePair.symbol}</span>.
          </p>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1" id="active-alerts-scroller">
            {currentPairAlerts.map((alert) => {
              const isAbove = alert.condition === 'ABOVE';
              return (
                <div
                  key={alert.id}
                  className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between gap-2.5 hover:border-slate-750 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded ${
                      isAbove ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {alert.type}
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-extrabold text-white">
                        {alert.value}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      alert.isTriggered
                        ? 'bg-rose-950/20 text-rose-400'
                        : 'bg-emerald-950/30 text-emerald-400 animate-pulse'
                    }`}>
                      {alert.isTriggered ? (lang === 'ar' ? 'تم' : 'Triggered') : (lang === 'ar' ? 'نشط' : 'Active')}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => onDeleteAlert(alert.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                      title={lang === 'ar' ? 'حذف' : 'Remove'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
