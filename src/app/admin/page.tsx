'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Users, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import StatsCard from './components/stats-card';
import RecentActivityChart from './components/recent-activity-chart';
import ApplicationStatusChart from './components/application-status-chart';

interface Stats {
  totalStudents: number;
  totalDrives: number;
  totalApplications: number;
  placedStudents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.data || data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to the admin panel. Here's an overview of your system.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={<Users className="w-5 h-5" />}
          color="bg-blue-100 text-blue-600"
          loading={loading}
        />
        <StatsCard
          title="Active Drives"
          value={stats?.totalDrives || 0}
          icon={<FileText className="w-5 h-5" />}
          color="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <StatsCard
          title="Applications"
          value={stats?.totalApplications || 0}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-orange-100 text-orange-600"
          loading={loading}
        />
        <StatsCard
          title="Placed Students"
          value={stats?.placedStudents || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-green-100 text-green-600"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationStatusChart />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/students"
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <h3 className="font-semibold text-foreground">View Students</h3>
              <p className="text-sm text-muted-foreground">Manage student records</p>
            </a>
            <a
              href="/admin/drives"
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <h3 className="font-semibold text-foreground">Manage Drives</h3>
              <p className="text-sm text-muted-foreground">Create and manage recruitment drives</p>
            </a>
            <a
              href="/admin/applications"
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
            >
              <h3 className="font-semibold text-foreground">View Applications</h3>
              <p className="text-sm text-muted-foreground">Review student applications</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
