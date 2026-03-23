'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Search } from 'lucide-react';
import { adminApplicationsApi, type AdminApplicationResponse } from '@/src/lib/api/admin.applications';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplicationResponse[]>([]);
  const [filtered, setFiltered] = useState<AdminApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    adminApplicationsApi.getAll()
      .then(a => { setApplications(a); setFiltered(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = applications;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.studentName.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q) ||
        a.studentEmail.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(a => a.status === statusFilter);
    }
    setFiltered(result);
  }, [searchTerm, statusFilter, applications]);

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    try {
      const updated = await adminApplicationsApi.updateStatus(applicationId, newStatus);
      setApplications(prev => prev.map(a => a.applicationId === applicationId ? updated : a));
    } catch (e) { console.error(e); }
  };

  const statuses = ['APPLIED', 'SHORTLISTED', 'APPROVED', 'REJECTED'] as const;

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
              <Input placeholder="Search by student name, email, or company..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(app => (
                  <TableRow key={app.applicationId}>
                    <TableCell className="font-medium">{app.studentName}</TableCell>
                    <TableCell className="text-sm">{app.studentEmail}</TableCell>
                    <TableCell>{app.branch}</TableCell>
                    <TableCell>{app.companyName}</TableCell>
                    <TableCell>{app.driveRole}</TableCell>
                    <TableCell>{app.appliedDate}</TableCell>
                    <TableCell>
                      <Select value={app.status}
                        onValueChange={v => handleStatusChange(app.applicationId, v)}>
                        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8"><p className="text-muted-foreground">No applications found</p></div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map(status => (
          <Card key={status}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground capitalize">{status.toLowerCase()}</p>
              <p className="text-2xl font-bold text-foreground mt-2">
                {applications.filter(a => a.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}