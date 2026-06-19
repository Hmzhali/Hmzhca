import React from 'react';

export default function BinanceAIManager({
  lang,
  activePair,
  portfolio,
  apiConnection,
  futuresApiError,
  balanceSyncError,
  isLiveTrading
}: any) {
  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-slate-100">
      <h2 className="text-xl font-bold mb-4">
        {lang === 'ar' ? 'مساعد بينانس الفني' : 'Binance Technical Assistant'}
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <span>{lang === 'ar' ? 'حالة الاتصال:' : 'Connection Status:'}</span>
          <span className={apiConnection ? "text-emerald-400" : "text-rose-400"}>
            {apiConnection ? (lang === 'ar' ? 'متصل' : 'Connected') : (lang === 'ar' ? 'غير متصل' : 'Disconnected')}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <span>{lang === 'ar' ? 'التداول الحي:' : 'Live Trading:'}</span>
          <span>{isLiveTrading ? (lang === 'ar' ? 'مفعل' : 'Enabled') : (lang === 'ar' ? 'معطل' : 'Disabled')}</span>
        </div>

        {(futuresApiError || balanceSyncError) && (
          <div className="p-3 bg-rose-950/30 border border-rose-900 rounded-lg text-rose-200 text-sm">
            <strong>{lang === 'ar' ? 'تنبيه:' : 'Alert:'}</strong>
            <p>{futuresApiError || balanceSyncError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
