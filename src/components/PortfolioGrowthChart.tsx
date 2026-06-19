import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PortfolioGrowthChartProps {
  lang: 'ar' | 'en';
}

const generateMockData = () => {
  const data = [];
  let balance = 10000;
  for (let i = 0; i < 30; i++) {
    balance += (Math.random() - 0.4) * 500;
    data.push({
      date: `Day ${i + 1}`,
      balance: Math.max(0, balance),
    });
  }
  return data;
};

export default function PortfolioGrowthChart({ lang }: PortfolioGrowthChartProps) {
  const data = useMemo(() => generateMockData(), []);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        <h3 className="text-sm font-black text-slate-100">
          {lang === 'ar' ? 'نمو المحفظة بمرور الوقت' : 'Portfolio Growth Trend'}
        </h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorBalance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
