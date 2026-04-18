'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Search, Download, Trash2, CheckSquare } from 'lucide-react';

import { adminDrivesApi, type AdminDriveResponse, type DriveJDResponse } from '@/src/lib/api/admin.drives';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { isDriveActive, getDriveStatusLabel } from '@/src/lib/utils';

type StatusTab = 'ALL' | 'ACTIVE' | 'COMPLETED';

interface DriveWithJD extends AdminDriveResponse {
  jd?: DriveJDResponse;
}

export default function DrivesPage() {
  const [drives, setDrives] = useState<DriveWithJD[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    adminDrivesApi
      .getAll()
      .then(async (d) => {
        // Fetch JD for each drive to get branch info
        const drivesWithJD = await Promise.all(
          d.map(async (drive) => {
            try {
              const jd = await adminDrivesApi.getJD(drive.id);
              return { ...drive, jd };
            } catch {
              return drive;
            }
          })
        );
        setDrives(drivesWithJD);
      })
      .catch(() => setDrives([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drives.filter((d) => {
      const matchText = !q || d.companyName.toLowerCase().includes(q) || d.role.toLowerCase().includes(q);
      const isActive = isDriveActive(d.lastDate);
      const matchStatus =
        statusTab === 'ALL' ? true : statusTab === 'ACTIVE' ? isActive : statusTab === 'COMPLETED' ? !isActive : true;
      
      const branchMatch = !d.jd?.allowedBranches || d.jd.allowedBranches.length === 0 
        ? true 
        : branchFilter === 'ALL' || d.jd.allowedBranches.includes(branchFilter);
      
      return matchText && matchStatus && branchMatch;
    });
  }, [drives, query, statusTab, branchFilter]);

  // Get unique branches from all drives
  const allBranches = useMemo(() => {
    const branches = new Set<string>();
    drives.forEach(d => {
      d.jd?.allowedBranches?.forEach(b => branches.add(b));
    });
    return Array.from(branches).sort();
  }, [drives]);

  const handleToggle = async (id: number) => {
    try {
      const updated = await adminDrivesApi.toggleStatus(id);
      setDrives((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch {
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this drive? This action cannot be undone.')) {
      return;
    }
    try {
      await adminDrivesApi.delete(id);
      setDrives((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      alert('Failed to delete drive');
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

              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Branches</SelectItem>
                  {allBranches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
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
                    <TableHead>Action</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((drive) => {
                    const isActive = isDriveActive(drive.lastDate);
                    const statusLabel = getDriveStatusLabel(drive.lastDate);
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
                        <TableCell className="text-sm text-muted-foreground">
                          {drive.jd?.allowedBranches && drive.jd.allowedBranches.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {drive.jd.allowedBranches.map((branch) => (
                                <span
                                  key={branch}
                                  className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 whitespace-nowrap"
                                >
                                  {branch}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">All</span>
                          )}
                        </TableCell>
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
                            <Link href={`/admin/drives/${drive.id}/shortlist`}>
                              <Button variant="outline" size="sm" className="p-2 text-blue-600 hover:bg-blue-100 hover:text-blue-700" title="Shortlist Students">
                                <CheckSquare className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/drives/${drive.id}`}>
                              <Button variant="ghost" size="sm" className="p-2">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 text-red-600 hover:bg-red-100 hover:text-red-700"
                              onClick={() => handleDelete(drive.id)}
                            >
                              <Trash2 className="w-4 h-4" />
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
