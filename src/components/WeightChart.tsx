import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';

interface WeightChartProps {
  weights: { date: string; weight: number }[];
  birthWeight: number;
}

export function WeightChart({ weights, birthWeight }: WeightChartProps) {
  // Sort weights ascending for the chart
  const data = [...weights]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => ({
      date: format(new Date(w.date), 'MMM d'),
      weight: w.weight,
    }));

  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94A3B8' }}
          />
          <YAxis 
            hide={true} 
            domain={['dataMin - 100', 'dataMax + 100']} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <ReferenceLine 
            y={birthWeight} 
            stroke="#94A3B8" 
            strokeDasharray="3 3" 
            label={{ position: 'right', value: 'Birth', fill: '#94A3B8', fontSize: 10 }} 
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
