import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  Cpu, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  Search, 
  Filter, 
  Info, 
  TrendingUp, 
  CheckCircle2, 
  Calendar,
  Layers,
  Sparkle
} from 'lucide-react';
import { ToastNotification } from '../types';

interface NotificationCenterProps {
  lang: 'ar' | 'en';
  notificationsHistory: ToastNotification[];
  onClearNotifications: () => void;
}

export default function NotificationCenter({
  lang,
  notificationsHistory,
  onClearNotifications,
}: NotificationCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SYSTEM' | 'VOLATILITY' | 'MILESTONE' | 'BOT'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Statistics calculation
  const totalCount = notificationsHistory.length;
  const milestoneCount = notificationsHistory.filter(n => n.isMilestone).length;
  const volatilityCount = notificationsHistory.filter(n => n.isVolatilityWarning).length;
  const botCount = notificationsHistory.filter(n => n.botType && !n.isMilestone && !n.isVolatilityWarning).length;
  const systemCount = totalCount - milestoneCount - volatilityCount - botCount;

  // Search and filter logic
  const filteredNotifications = notificationsHistory.filter((item) => {
    // Label type mapping
    const isVol = item.isVolatilityWarning;
    const isMile = item.isMilestone;
    const isBot = !!item.botType && !isMile && !isVol;
    const isSys = !isVol && !isMile && !isBot;

    if (filterType === 'VOLATILITY' && !isVol) return false;
    if (filterType === 'MILESTONE' && !isMile) return false;
    if (filterType === 'BOT' && !isBot) return false;
    if (filterType === 'SYSTEM' && !isSys) return false;

    if (!searchTerm) return true;

    const query = searchTerm.toLowerCase();
    const symbolMatch = item.symbol?.toLowerCase().includes(query);
    const botTypeMatch = item.botType?.toLowerCase().includes(query);
    const aiArMatch = item.aiExplanationAr?.toLowerCase().includes(query);
    const aiEnMatch = item.aiExplanationEn?.toLowerCase().includes(query);
    
    return symbolMatch || botTypeMatch || aiArMatch || aiEnMatch;
  });

  return (
    <div className="space-y-6" id="notification-center-section" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-1.5 font-sans">
              {lang === 'ar' ? 'مركز التنبيهات المركزي' : 'Global Alerts Center'}
              <span className="text-[10px] uppercase tracking-wider font-mono bg-indigo-950 text-indigo-400 py-0.5 px-2 rounded-full border border-indigo-900/40 font-bold">
                {totalCount} {lang === 'ar' ? 'مسجل' : 'items'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' 
                ? 'شاشة أرشيفية تتبع العمليات الآلية، هبوط الأسعار المفاجئ، وأرباح البوتات المباشرة ثانية بثانية.' 
                : 'Archived tracking of all automated executions, volatility updates, and live bot metrics.'}
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={() => {
              if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع التنبيهات المؤرشفة نهائياً؟' : 'Are you sure you want to permanently clear entire logs?')) {
                onClearNotifications();
              }
            }}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 shadow-lg cursor-pointer shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Trash2 className="w-4 h-4" />
            {lang === 'ar' ? 'تصفير السجل والمحفوظات' : 'Clear Entire Notification History'}
          </button>
        )}
      </div>

      {/* Stats Counter Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setFilterType('ALL')}
          className={`p-4 rounded-xl border text-right sm:text-left transition duration-200 cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-slate-800/80 border-indigo-500 text-white shadow-md'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {lang === 'ar' ? 'الكل' : 'Total'}
            </span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-xl font-extrabold font-mono text-slate-100">{totalCount}</span>
        </button>

        <button
          onClick={() => setFilterType('VOLATILITY')}
          className={`p-4 rounded-xl border text-right sm:text-left transition duration-200 cursor-pointer ${
            filterType === 'VOLATILITY'
              ? 'bg-slate-800/80 border-amber-500 text-white shadow-md'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {lang === 'ar' ? 'التذبذب' : 'Volatility'}
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-extrabold font-mono text-amber-400">{volatilityCount}</span>
        </button>

        <button
          onClick={() => setFilterType('MILESTONE')}
          className={`p-4 rounded-xl border text-right sm:text-left transition duration-200 cursor-pointer ${
            filterType === 'MILESTONE'
              ? 'bg-slate-800/80 border-emerald-500 text-white shadow-md'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {lang === 'ar' ? 'الأهداف' : 'Milestones'}
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-extrabold font-mono text-emerald-400">{milestoneCount}</span>
        </button>

        <button
          onClick={() => setFilterType('BOT')}
          className={`p-4 rounded-xl border text-right sm:text-left transition duration-200 cursor-pointer ${
            filterType === 'BOT'
              ? 'bg-slate-800/80 border-sky-500 text-white shadow-md'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {lang === 'ar' ? 'صفقات البوتات' : 'Bot Trades'}
            </span>
            <Activity className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <span className="text-xl font-extrabold font-mono text-sky-400">{botCount}</span>
        </button>

        <button
          onClick={() => setFilterType('SYSTEM')}
          className={`p-4 rounded-xl border text-right sm:text-left transition duration-200 cursor-pointer ${
            filterType === 'SYSTEM'
              ? 'bg-slate-800/80 border-indigo-400 text-white shadow-md'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
              {lang === 'ar' ? 'النظام' : 'System Action'}
            </span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-xl font-extrabold font-mono text-indigo-400">{systemCount}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full">
          <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'ابحث عن زوج تداول، تحذير أو تحليل ذكاء اصطناعي...' : 'Search pair, warning or AI verdict...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium tracking-wide bg-slate-950 border border-slate-800 rounded-lg pr-10 pl-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Content List Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            {lang === 'ar' ? 'تاريخ التنبيهات والقرارات المحققة' : 'Recorded Alerts History'}
          </span>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800/80">
            {filteredNotifications.length} / {totalCount} {lang === 'ar' ? 'مطابق' : 'matched'}
          </span>
        </div>

        <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto no-scrollbar font-sans">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center text-slate-500">
              <Bell className="w-12 h-12 mb-3 text-slate-600 animate-bounce opacity-40" />
              <h4 className="font-extrabold text-slate-300 text-sm">
                {lang === 'ar' ? 'لم يتم العثور على أي نتائج' : 'No matches found.'}
              </h4>
              <p className="text-[11px] opacity-70 mt-1 max-w-sm mx-auto px-6">
                {lang === 'ar' 
                  ? 'حاول تغيير معايير التصفية أو البحث عن رمز عملة آخر.' 
                  : 'Try selecting a different category filter or modify the search input constraint.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n, index) => {
              const dateStr = new Date(n.timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
              });

              // Styling values depending on type
              let tagLabel = lang === 'ar' ? 'نظام' : 'System';
              let tagColorClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
              let iconElement = <Cpu className="w-4 h-4 text-indigo-400" />;

              if (n.isVolatilityWarning) {
                tagLabel = lang === 'ar' ? 'تذبذب مفاجئ' : 'Volatility';
                tagColorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                iconElement = <AlertCircle className="w-4 h-4 text-amber-400" />;
              } else if (n.isMilestone) {
                tagLabel = lang === 'ar' ? 'هدف ربح' : 'Milestone';
                tagColorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                iconElement = <Sparkles className="w-4 h-4 text-emerald-400" />;
              } else if (n.symbol === 'PORTFOLIO_LIQUIDATION') {
                tagLabel = lang === 'ar' ? 'طوارئ قصوى' : 'Emergency';
                tagColorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
                iconElement = <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />;
              } else if (n.botType) {
                tagLabel = `${n.botType} trading`;
                tagColorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                iconElement = <Activity className="w-4 h-4 text-emerald-400" />;
              }

              // Dynamic localized descriptions 
              let detailedDesc = '';
              if (n.isVolatilityWarning) {
                const percent = n.volatilityChange || 0;
                detailedDesc = lang === 'ar' 
                  ? `وقع تحرك سعري حاد لزوج التداول ${n.symbol} بمعدل تغير بلغت قيمته ${percent >= 0 ? '+' : ''}${percent.toFixed(2)}% خلال أقل من 60 ثانية، مما تطلب معالجة فورية لحماية البوتات.`
                  : `A rapid volatility anomaly occurred on ${n.symbol} with a price movement of ${percent >= 0 ? '+' : ''}${percent.toFixed(2)}% in under 60 seconds, triggering real-time watch protocols.`;
              } else if (n.symbol === 'PORTFOLIO_LIQUIDATION') {
                detailedDesc = lang === 'ar'
                  ? `أمر إغلاق الطوارئ النشط تم تفعليه! تم تجميد كافة العمليات وإلغاء طلبات التبادل المفتوحة تفادياً للمخاطر.`
                  : `Active security recovery protocol initiated! Canceled all open orders and paused bot updates to manage capital drawdown.`;
              } else if (n.isMilestone) {
                detailedDesc = lang === 'ar'
                  ? `نجح زوج التداول ${n.symbol} في الوصول إلى أهداف الربح المحددة بنسبة ${n.milestonePercentage}% محققاً صافي عوائد إيجابية بمقدار +${n.profit?.toFixed(2)} USDT.`
                  : `Trading bot successfully reached profit milestone target of ${n.milestonePercentage}% in trading ${n.symbol} securing net return of +$${n.profit?.toFixed(2)} USDT.`;
              } else {
                detailedDesc = lang === 'ar'
                  ? `قام النظام بالتنفيذ التلقائي لمركز مستهدف جديد لزوج ${n.symbol} محققاً عوائد مضافة قيمتها +${n.profit?.toFixed(2)} USDT في رصيدك التراكمي.`
                  : `Automated trading system triggered order resolution for ${n.symbol} capturing incremental balance surplus of +$${n.profit?.toFixed(2)} USDT.`;
              }

              const hasAI = n.aiExplanationAr || n.aiExplanationEn;
              const isExpanded = expandedId === n.id;

              return (
                <div 
                  key={`${n.id || index}-${index}`}
                  className="p-5 hover:bg-slate-950/20 transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {iconElement}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-200 text-xs flex items-center gap-2">
                          {n.symbol === 'PORTFOLIO_LIQUIDATION' || n.symbol === 'OFFLINE_PROFIT' ? '' : n.symbol}
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${tagColorClass}`}>
                            {tagLabel}
                          </span>
                        </h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <Calendar className="w-3 h-3 block opacity-60" />
                          <span className="font-mono">{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    {n.profit !== undefined && n.profit !== null && n.profit !== 0 && (
                      <div className="self-start sm:self-auto px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black text-xs">
                        +{n.profit.toFixed(2)} USDT
                      </div>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    {detailedDesc}
                  </p>

                  {/* AI Copilot Advisor Section (if attached) */}
                  {hasAI && (
                    <div className="mt-3 bg-slate-950/80 border border-indigo-950 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-indigo-400">
                          <Sparkle className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                          <span className="text-[10px] font-black uppercase tracking-wide">
                            {lang === 'ar' ? 'التحليل الفني من مساعد الذكاء الاصطناعي الخاص بالعملية' : 'AI Analysis Verdict & Technical Explanation'}
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : n.id)}
                          className="text-[9px] hover:underline text-slate-400 hover:text-white cursor-pointer transition font-bold"
                        >
                          {isExpanded ? (lang === 'ar' ? 'إخفاء التفاصيل' : 'Hide details') : (lang === 'ar' ? 'عرض التحليل الكامل' : 'Reveal details')}
                        </button>
                      </div>

                      {isExpanded ? (
                        <div className="text-[11px] text-slate-400 leading-relaxed max-h-40 overflow-y-auto no-scrollbar pt-1 border-t border-slate-900/60 transition-all">
                          <p className="whitespace-pre-line">
                            {lang === 'ar' ? n.aiExplanationAr : n.aiExplanationEn}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 truncate cursor-pointer" onClick={() => setExpandedId(n.id)}>
                          {lang === 'ar' ? n.aiExplanationAr : n.aiExplanationEn}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
