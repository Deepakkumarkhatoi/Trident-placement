'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminDrivesApi, type AdminDriveResponse } from '@/src/lib/api/admin.drives';

export default function DriveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [drive, setDrive] = useState<AdminDriveResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDrivesApi.getById(id)
      .then(setDrive)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-96 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/drives">
        <Button variant="outline" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Back to Drives</Button>
      </Link>

      {drive && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{drive.companyName}</CardTitle>
                  <p className="text-muted-foreground mt-2">{drive.role}</p>
                </div>
                <span className={`px-3 py-1 rounded-full font-medium ${drive.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {drive.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['Drive Type',           drive.driveType],
                  ['Package (LPA)',        drive.lpaPackage],
                  ['Minimum CGPA',         drive.minimumCgpa],
                  ['Application Deadline', drive.lastDate],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-foreground font-medium mt-1">{val}</p>
                  </div>
                ))}
              </div>
              {drive.description && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground mt-2">{drive.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Drive Statistics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Applicants', value: drive.totalApplicants },
                  { label: 'Shortlisted',      value: drive.shortlistedCount },
                  { label: 'Selected',         value: drive.selectedCount },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}