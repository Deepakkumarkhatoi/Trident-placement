'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', applications: 400, placements: 240 },
  { month: 'Feb', applications: 450, placements: 320 },
  { month: 'Mar', applications: 380, placements: 280 },
  { month: 'Apr', applications: 520, placements: 420 },
  { month: 'May', applications: 610, placements: 490 },
  { month: 'Jun', applications: 730, placements: 580 },
];

export default function RecentActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="applications" fill="#3b82f6" />
        <Bar dataKey="placements" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
