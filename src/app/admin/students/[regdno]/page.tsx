'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { adminStudentsApi, type StudentDTO } from '@/src/lib/api/admin.students';
import type { AdminApplicationResponse } from '@/src/lib/api/admin.applications';
import CgpaDisplay from '@/src/components/CgpaDisplay';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPLIED:     'bg-blue-100 text-blue-700',
    SHORTLISTED: 'bg-yellow-100 text-yellow-700',
    APPROVED:    'bg-green-100 text-green-700',
    REJECTED:    'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

export default function StudentDetailPage() {
  const { regdno } = useParams<{ regdno: string }>();
  const [student, setStudent] = useState<StudentDTO | null>(null);
  const [applications, setApplications] = useState<AdminApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminStudentsApi.getProfile(regdno),
      adminStudentsApi.getApplicationHistory(regdno),
    ])
      .then(([s, a]) => { setStudent(s); setApplications(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [regdno]);

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <Link href="/admin/students">
        <Button variant="outline" className="gap-2 mb-4"><ArrowLeft className="w-4 h-4" />Back to Students</Button>
      </Link>

      {student && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-2xl">{student.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['Email',           student.email],
                  ['Reg No.',         student.regdno],
                  ['Phone',           student.phno],
                  ['Course',          student.course],
                  ['Branch',          student.branchCode],
                  ['Admission Year',  student.admissionYear],
                  ['Degree YOP',      student.degreeYop],
                  ['College',         student.collegeName],
                ].map(([label, val]) => val && val !== 'N/A' ? (
                  <div key={label as string}>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-foreground font-medium mt-1">{val}</p>
                  </div>
                ) : null)}
              </div>
            </CardContent>
          </Card>

          {student.cgpa && (
            <div>
              <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">CGPA Information</h3>
              <CgpaDisplay 
                regdno={student.regdno}
                initialCgpa={student.cgpa}
              />
            </div>
          )}

          <Card>
            <CardHeader><CardTitle>Applications ({applications.length})</CardTitle></CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map(app => (
                      <TableRow key={app.applicationId}>
                        <TableCell className="font-medium">{app.companyName}</TableCell>
                        <TableCell>{app.driveRole}</TableCell>
                        <TableCell>{app.driveType}</TableCell>
                        <TableCell>{app.appliedDate}</TableCell>
                        <TableCell><StatusBadge status={app.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8"><p className="text-muted-foreground">No applications yet</p></div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}