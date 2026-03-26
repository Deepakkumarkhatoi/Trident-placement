'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';

import { adminApplicationsApi, type AdminApplicationResponse } from '@/src/lib/api/admin.applications';
import { adminDrivesApi, type AdminDriveResponse } from '@/src/lib/api/admin.drives';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

function statusPill(status: string) {
  const map: Record<string, string> = {
    APPLIED: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    SHORTLISTED: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-700 border-red-500/20',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
}

function formatShortDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplicationResponse[]>([]);
  const [drives, setDrives] = useState<AdminDriveResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [driveFilter, setDriveFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApplicationsApi.getAll(), adminDrivesApi.getAll()])
      .then(([apps, d]) => {
        setApplications(apps);
        setDrives(d);
      })
      .catch(() => {
        setApplications([]);
        setDrives([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const lpaByDriveId = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of drives) map.set(d.id, d.lpaPackage);
    return map;
  }, [drives]);

  const driveOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of applications) set.add(`${a.companyName} | ${a.driveRole}`);
    return Array.from(set).sort();
  }, [applications]);

  const branchOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of applications) set.add(a.branch || '—');
    return Array.from(set).sort();
  }, [applications]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return applications.filter((a) => {
      const matchText =
        !query ||
        a.studentName.toLowerCase().includes(query) ||
        a.studentEmail.toLowerCase().includes(query) ||
        a.companyName.toLowerCase().includes(query);

      const driveKey = `${a.companyName} | ${a.driveRole}`;
      const matchDrive = driveFilter === 'ALL' ? true : driveKey === driveFilter;
      const matchBranch = branchFilter === 'ALL' ? true : (a.branch || '—') === branchFilter;
      const matchStatus = statusFilter === 'ALL' ? true : a.status === statusFilter;
      return matchText && matchDrive && matchBranch && matchStatus;
    });
  }, [applications, branchFilter, driveFilter, q, statusFilter]);

  const statuses = ['APPLIED', 'SHORTLISTED', 'APPROVED', 'REJECTED'];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Application Management</h1>
          <p className="text-muted-foreground mt-2 text-sm">All applications: {applications.length.toLocaleString()} total</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled>
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search student, company..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <Select value={driveFilter} onValueChange={setDriveFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Drives" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Drives</SelectItem>
                {driveOptions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Branches</SelectItem>
                {branchOptions.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading...</div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Drive / Company</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Round</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => {
                    const lpa = lpaByDriveId.get(app.driveId);
                    return (
                      <TableRow key={app.applicationId}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                              {String(app.studentName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{app.studentName}</div>
                              <div className="text-sm text-muted-foreground truncate">{app.studentEmail}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{app.companyName}</div>
                            <div className="text-sm text-muted-foreground truncate">{app.driveRole}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatShortDate(app.appliedDate)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground"></TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusPill(app.status)}`}>
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground"></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{typeof lpa === 'number' ? `₹${lpa} LPA` : '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <Link href={`/admin/students/${app.regdno}`}>
                              <Button variant="ghost" size="sm" className="p-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">No applications found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
