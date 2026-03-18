'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Drive {
  id: string;
  company: string;
  role: string;
  type: string;
  lpa: string;
  cgpa: string;
  lastDate: string;
  status: string;
  applicationCount?: number;
}

export default function DrivesPage() {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [filteredDrives, setFilteredDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await fetch('/api/admin/drives');
        if (response.ok) {
          const data = await response.json();
          const drivesList = Array.isArray(data.data) ? data.data : [];
          setDrives(drivesList);
          setFilteredDrives(drivesList);
        }
      } catch (error) {
        console.error('Error fetching drives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, []);

  useEffect(() => {
    const filtered = drives.filter((drive) =>
      drive.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDrives(filtered);
  }, [searchTerm, drives]);

  const handleToggleDrive = async (driveId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
      const response = await fetch(`/api/admin/drives/${driveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setDrives((prev) =>
          prev.map((d) =>
            d.id === driveId ? { ...d, status: newStatus } : d
          )
        );
      }
    } catch (error) {
      console.error('Error updating drive:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recruitment Drives</h1>
          <p className="text-muted-foreground mt-2">Manage and monitor all recruitment drives</p>
        </div>
        <Link href="/admin/drives/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Drive
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDrives.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Package (LPA)</TableHead>
                  <TableHead>Min CGPA</TableHead>
                  <TableHead>Last Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrives.map((drive) => (
                  <TableRow key={drive.id}>
                    <TableCell className="font-medium">{drive.company}</TableCell>
                    <TableCell>{drive.role}</TableCell>
                    <TableCell>
                      <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {drive.type}
                      </span>
                    </TableCell>
                    <TableCell>{drive.lpa}</TableCell>
                    <TableCell>{drive.cgpa}</TableCell>
                    <TableCell>{new Date(drive.lastDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          drive.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {drive.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/drives/${drive.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleDrive(drive.id, drive.status)}
                        >
                          {drive.status === 'OPEN' ? 'Close' : 'Open'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No drives found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
