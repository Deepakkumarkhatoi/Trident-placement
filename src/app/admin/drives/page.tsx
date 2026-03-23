'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Search, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { adminDrivesApi, type AdminDriveResponse } from '@/src/lib/api/admin.drives';

export default function DrivesPage() {
  const [drives, setDrives] = useState<AdminDriveResponse[]>([]);
  const [filtered, setFiltered] = useState<AdminDriveResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    adminDrivesApi.getAll()
      .then(d => { setDrives(d); setFiltered(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = searchTerm.toLowerCase();
    setFiltered(drives.filter(d =>
      d.companyName.toLowerCase().includes(q) || d.role.toLowerCase().includes(q)
    ));
  }, [searchTerm, drives]);

  const handleToggle = async (id: number) => {
    try {
      const updated = await adminDrivesApi.toggleStatus(id);
      setDrives(prev => prev.map(d => d.id === id ? updated : d));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recruitment Drives</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor all recruitment drives</p>
        </div>
        <Link href="/admin/drives/create">
          <Button className="gap-2"><Plus className="w-4 h-4" />New Drive</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by company or position..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="flex-1" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Package (LPA)</TableHead>
                  <TableHead>Min CGPA</TableHead>
                  <TableHead>Last Date</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(drive => (
                  <TableRow key={drive.id}>
                    <TableCell className="font-medium">{drive.companyName}</TableCell>
                    <TableCell>{drive.role}</TableCell>
                    <TableCell>
                      <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">{drive.driveType}</span>
                    </TableCell>
                    <TableCell>{drive.lpaPackage}</TableCell>
                    <TableCell>{drive.minimumCgpa}</TableCell>
                    <TableCell>{drive.lastDate}</TableCell>
                    <TableCell>{drive.totalApplicants}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${drive.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {drive.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/drives/${drive.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleToggle(drive.id)}>
                          {drive.status === 'OPEN' ? 'Close' : 'Open'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8"><p className="text-muted-foreground">No drives found</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}