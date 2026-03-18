'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DriveDetail {
  id: string;
  company: string;
  role: string;
  type: string;
  lpa: string;
  cgpa: string;
  lastDate: string;
  description?: string;
  status: string;
  applicationCount?: number;
}

export default function DriveDetailPage() {
  const params = useParams();
  const driveId = params.id as string;

  const [drive, setDrive] = useState<DriveDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrive = async () => {
      try {
        const response = await fetch(`/api/admin/drives/${driveId}`);
        if (response.ok) {
          const data = await response.json();
          setDrive(data.data || data);
        }
      } catch (error) {
        console.error('Error fetching drive:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrive();
  }, [driveId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/drives">
        <Button variant="outline" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Drives
        </Button>
      </Link>

      {drive && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{drive.company}</CardTitle>
                  <p className="text-muted-foreground mt-2">{drive.role}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    drive.status === 'OPEN'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {drive.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Drive Type</p>
                  <p className="text-foreground font-medium mt-1">{drive.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Package (LPA)</p>
                  <p className="text-foreground font-medium mt-1">{drive.lpa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Minimum CGPA</p>
                  <p className="text-foreground font-medium mt-1">{drive.cgpa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Application Deadline</p>
                  <p className="text-foreground font-medium mt-1">
                    {new Date(drive.lastDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {drive.description && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-foreground mt-2">{drive.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Drive Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-accent rounded-lg">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">
                    {drive.applicationCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
