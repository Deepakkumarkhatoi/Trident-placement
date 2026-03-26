'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Search, Download, Shuffle } from 'lucide-react';

import { adminDrivesApi, type AdminDriveResponse } from '@/src/lib/api/admin.drives';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

type StatusTab = 'ALL' | 'ACTIVE' | 'COMPLETED';

export default function DrivesPage() {
  const [drives, setDrives] = useState<AdminDriveResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');

  useEffect(() => {
    setLoading(true);
    adminDrivesApi
      .getAll()
      .then((d) => setDrives(d))
      .catch(() => setDrives([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drives.filter((d) => {
      const matchText = !q || d.companyName.toLowerCase().includes(q) || d.role.toLowerCase().includes(q);
      const isActive = d.status === 'OPEN';
      const matchStatus =
        statusTab === 'ALL' ? true : statusTab === 'ACTIVE' ? isActive : statusTab === 'COMPLETED' ? !isActive : true;
      return matchText && matchStatus;
    });
  }, [drives, query, statusTab]);

  const handleToggle = async (id: number) => {
    try {
      const updated = await adminDrivesApi.toggleStatus(id);
      setDrives((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch {
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Drive Management</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            View, edit and delete drives: <span className="font-semibold text-foreground">{drives.length || ''}</span> total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Link href="/admin/drives/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create Drive
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Company, role..."
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Select value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select disabled>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Branches</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button
              variant={statusTab === 'ACTIVE' ? 'default' : 'outline'}
              className="rounded-xl"
              onClick={() => setStatusTab('ACTIVE')}
            >
              Active
            </Button>
            <Button
              variant={statusTab === 'COMPLETED' ? 'default' : 'outline'}
              className="rounded-xl"
              onClick={() => setStatusTab('COMPLETED')}
            >
              Completed
            </Button>
            <Button variant={statusTab === 'ALL' ? 'default' : 'outline'} className="rounded-xl" onClick={() => setStatusTab('ALL')}>
              All
            </Button>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="text-muted-foreground text-sm py-10 text-center">Loading...</div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company / Role</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Min CGPA</TableHead>
                    <TableHead>Branches</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Apply</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>By</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((drive) => {
                    const isActive = drive.status === 'OPEN';
                    const statusLabel = isActive ? 'ACTIVE' : 'COMPLETED';
                    return (
                      <TableRow key={drive.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                              {String(drive.companyName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate text-foreground">{drive.companyName}</div>
                              <div className="text-sm text-muted-foreground truncate">{drive.role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{drive.lpaPackage ? `₹${drive.lpaPackage} LPA` : ''}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{drive.minimumCgpa ? `${drive.minimumCgpa}+` : ''}</TableCell>
                        <TableCell className="text-sm text-muted-foreground"></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{drive.lastDate || ''}</TableCell>
                        <TableCell className="text-sm text-foreground">{drive.totalApplicants ?? ''}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground"></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/drives/${drive.id}`}>
                              <Button variant="ghost" size="sm" className="p-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="p-2" onClick={() => handleToggle(drive.id)}>
                              <Shuffle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">No drives found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
