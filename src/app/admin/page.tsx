'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Users, FileText, TrendingUp, CheckCircle, Briefcase } from 'lucide-react';
import StatsCard from './components/stats-card';
import RecentActivityChart from './components/recent-activity-chart';
import ApplicationStatusChart from './components/application-status-chart';
import { adminStudentsApi, type AdminStatsDTO } from '@/src/lib/api/admin.students';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminStudentsApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the admin panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Total Students"   value={stats?.totalStudents ?? 0}       icon={<Users className="w-5 h-5" />}       color="bg-blue-100 text-blue-600"   loading={loading} />
        <StatsCard title="Total Drives"     value={stats?.totalDrives ?? 0}         icon={<Briefcase className="w-5 h-5" />}   color="bg-purple-100 text-purple-600" loading={loading} />
        <StatsCard title="Open Drives"      value={stats?.openDrives ?? 0}          icon={<FileText className="w-5 h-5" />}    color="bg-teal-100 text-teal-600"   loading={loading} />
        <StatsCard title="Applications"     value={stats?.totalApplications ?? 0}   icon={<TrendingUp className="w-5 h-5" />}  color="bg-orange-100 text-orange-600" loading={loading} />
        <StatsCard title="Shortlisted"      value={stats?.shortlistedStudents ?? 0} icon={<TrendingUp className="w-5 h-5" />}  color="bg-yellow-100 text-yellow-600" loading={loading} />
        <StatsCard title="Placed Students"  value={stats?.placedStudents ?? 0}      icon={<CheckCircle className="w-5 h-5" />} color="bg-green-100 text-green-600" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent><RecentActivityChart /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Application Status Distribution</CardTitle></CardHeader>
          <CardContent><ApplicationStatusChart stats={stats} loading={loading} /></CardContent> */
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { href: '/admin/students',    title: 'View Students',    desc: 'Manage student records' },
              { href: '/admin/drives',      title: 'Manage Drives',    desc: 'Create and manage recruitment drives' },
              { href: '/admin/applications',title: 'View Applications',desc: 'Review student applications' },
            ].map(item => (
              <a key={item.href} href={item.href} className="p-4 border rounded-lg hover:bg-accent transition-colors text-center">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}