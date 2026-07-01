import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DollarSign } from 'lucide-react';

interface ProfitAnalyticsProps {
  lang: 'ar' | 'en';
}

const generateMockData = () => {
  return [
    { period: '24h', gain: 120, loss: 40 },
    { period: '7d', gain: 850, loss: 300 },
    { period: '30d', gain: 2400, loss: 1100 },
  ];
};

export default function ProfitAnalytics({ lang }: ProfitAnalyticsProps) {
  const data = useMemo(() => generateMockData(), []);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-black text-slate-100">
          {lang === 'ar' ? 'تحليل الأرباح والخسائر' : 'Profit Analytics'}
        </h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="period" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Bar dataKey="gain" name={lang === 'ar'?'الأرباح':'Gains'} fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="loss" name={lang === 'ar'?'الخسائر':'Losses'} fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
