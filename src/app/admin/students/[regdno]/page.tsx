'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface StudentDetail {
  name: string;
  email: string;
  regdno: string;
  cgpa: number;
  degree: string;
  batch: string;
  department: string;
  phone?: string;
}

interface Application {
  id: string;
  company: string;
  role: string;
  appliedOn: string;
  status: string;
  lpa: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const regdno = params.regdno as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [studentRes, appRes] = await Promise.all([
          fetch(`/api/admin/students/${regdno}`),
          fetch(`/api/admin/students/${regdno}/applications`),
        ]);

        if (studentRes.ok) {
          const data = await studentRes.json();
          setStudent(data.data || data);
        }

        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [regdno]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/students">
        <Button variant="outline" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Button>
      </Link>

      {student && (
        <>
          {/* Student Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{student.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="text-foreground font-medium">{student.regdno}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="text-foreground font-medium">{student.cgpa}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Degree</p>
                  <p className="text-foreground font-medium">{student.degree}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p className="text-foreground font-medium">{student.batch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="text-foreground font-medium">{student.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Card */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>LPA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.company}</TableCell>
                        <TableCell>{app.role}</TableCell>
                        <TableCell>{new Date(app.appliedOn).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(app.status)}`}>
                            {app.status}
                          </span>
                        </TableCell>
                        <TableCell>{app.lpa}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    APPLIED: 'bg-blue-100 text-blue-700',
    SHORTLISTED: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
