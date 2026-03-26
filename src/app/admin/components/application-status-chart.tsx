'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { AdminStatsDTO } from '@/src/lib/api/admin.students';

interface Props {
  stats: AdminStatsDTO | null;
  loading: boolean;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

export default function ApplicationStatusChart({ stats, loading }: Props) {
  const data = [
    { name: 'Applied',     value: (stats?.totalApplications ?? 0) - (stats?.shortlistedStudents ?? 0) - (stats?.placedStudents ?? 0) },
    { name: 'Shortlisted', value: stats?.shortlistedStudents ?? 0 },
    { name: 'Approved',    value: stats?.placedStudents ?? 0 },
    { name: 'Rejected',    value: 0 }, 
  ].filter(d => d.value > 0);

  if (loading) return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100} dataKey="value">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}