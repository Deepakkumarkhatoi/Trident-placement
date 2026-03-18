'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Applied', value: 240 },
  { name: 'Shortlisted', value: 180 },
  { name: 'Selected', value: 120 },
  { name: 'Rejected', value: 150 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

export default function ApplicationStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
