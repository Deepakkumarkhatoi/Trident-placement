'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Search } from 'lucide-react';

interface Application {
  id: string;
  studentName: string;
  studentEmail: string;
  company: string;
  role: string;
  appliedOn: string;
  status: string;
  lpa: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/admin/applications');
        if (response.ok) {
          const data = await response.json();
          const appsList = Array.isArray(data.data) ? data.data : [];
          setApplications(appsList);
          setFilteredApplications(appsList);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground mt-2">Review and manage all student applications</p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>LPA</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.studentName}</TableCell>
                    <TableCell className="text-sm">{app.studentEmail}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell>{new Date(app.appliedOn).toLocaleDateString()}</TableCell>
                    <TableCell>{app.lpa}</TableCell>
                    <TableCell>
                      <Select value={app.status} onValueChange={(value) => handleStatusChange(app.id, value)}>
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPLIED">Applied</SelectItem>
                          <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No applications found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['APPLIED', 'SHORTLISTED', 'APPROVED', 'REJECTED'].map((status) => {
          const count = applications.filter((app) => app.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground capitalize">{status.toLowerCase()}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
