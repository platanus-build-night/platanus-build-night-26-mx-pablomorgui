'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { DailyPricePoint } from '@/lib/db/price-history';

type PriceChartProps = {
  data: DailyPricePoint[];
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    'Cat 1': d.cat1,
    'Cat 2': d.cat2,
    'Cat 3': d.cat3,
  }));

  return (
    <div className="h-[220px] sm:h-[300px] w-full -ml-2 sm:ml-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontWeight: 500 }}
            stroke="#666"
            tickMargin={8}
          />
          <YAxis
            tick={{ fontSize: 10, fontWeight: 500 }}
            stroke="#666"
            tickFormatter={(v) => `$${Math.round(v)}`}
            domain={['dataMin - 50', 'dataMax + 50']}
            width={45}
          />
          <Tooltip
            contentStyle={{
              border: '2px solid #000',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: 12,
            }}
            formatter={(value) => [`$${Math.round(Number(value))}`, '']}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconSize={10}
          />
          <Line
            type="monotone"
            dataKey="Cat 1"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ fill: '#2563EB', r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Cat 2"
            stroke="#FFDB58"
            strokeWidth={2}
            dot={{ fill: '#FFDB58', r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Cat 3"
            stroke="#22C55E"
            strokeWidth={2}
            dot={{ fill: '#22C55E', r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
