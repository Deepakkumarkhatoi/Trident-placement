'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Mail,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  Search,
} from 'lucide-react';

import { adminDrivesApi } from '@/src/lib/api/admin.drives';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';

interface EligibleStudent {
  regdno: string;
  name: string;
  branchCode: string;
  course: string;
  degreeYop: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  diplomaPercentage?: number;
  graduationPercentage?: number;
}

interface DriveInfo {
  id: number;
  companyName: string;
  role: string;
  lpaPackage: number;
}

export default function SelectStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.id as string;

  const [drive, setDrive] = useState<DriveInfo | null>(null);
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [driveData, studentsData] = await Promise.all([
          adminDrivesApi.getById(driveId),
          adminDrivesApi.getEligibleStudents(driveId),
        ]);
        setDrive(driveData as unknown as DriveInfo);
        setStudents(studentsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [driveId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.regdno.toLowerCase().includes(q) ||
        s.branchCode.toLowerCase().includes(q)
    );
  }, [students, query]);

  const toggleStudent = (regdno: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(regdno)) {
      newSelected.delete(regdno);
    } else {
      newSelected.add(regdno);
    }
    setSelectedStudents(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudents.size === filtered.length && filtered.length > 0) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filtered.map((s) => s.regdno)));
    }
  };

  const downloadCSV = () => {
    const selected = filtered.filter((s) => selectedStudents.has(s.regdno));
    if (selected.length === 0) {
      alert('Please select at least one student');
      return;
    }

    const headers = ['Registration No', 'Name', 'Branch', 'Course', '10th %', '12th %', 'Diploma %', 'Graduation %', 'Degree YOP'];
    const rows = selected.map((s) => [
      s.regdno,
      s.name,
      s.branchCode,
      s.course,
      s.tenthPercentage || '-',
      s.twelfthPercentage || '-',
      s.diplomaPercentage || '-',
      s.graduationPercentage || '-',
      s.degreeYop || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${drive?.companyName || 'students'}-selected-students.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student');
      return;
    }

    if (!confirm(`Are you sure you want to publish this drive and send to ${selectedStudents.size} selected students?`)) {
      return;
    }

    try {
      setPublishing(true);
      // Publish the drive and send notifications to selected students
      await adminDrivesApi.publishDrive(driveId, Array.from(selectedStudents));

      setPublished(true);
      setTimeout(() => {
        router.push(`/admin/drives/${driveId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish drive');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading eligible students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/admin/drives/${driveId}`}>
              <button className="p-2 rounded-lg border border-border hover:bg-muted">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Select Students for {drive?.companyName}</h1>
              <p className="text-sm text-muted-foreground mt-1">Review eligible students below and select who should receive this drive opportunity. Only selected students will see this drive in their dashboard.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {published && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">Drive published and notifications sent successfully!</p>
          </div>
        )}

        {/* Stats Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Total Eligible</p>
                <p className="text-2xl font-bold text-foreground mt-1">{students.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Filtered</p>
                <p className="text-2xl font-bold text-foreground mt-1">{filtered.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Selected</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{selectedStudents.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, roll no, or branch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between items-center flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedStudents.size}</span> student{selectedStudents.size !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex gap-3">
            {selectedStudents.size > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            )}
            <button
              onClick={handlePublish}
              disabled={publishing || selectedStudents.size === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {publishing ? 'Publishing...' : selectedStudents.size === 0 ? 'Select Students to Publish' : 'Publish & Send'}
            </button>
          </div>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Eligible Students ({filtered.length})</CardTitle>
              <button
                onClick={toggleAll}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                  disabled={filtered.length === 0}
                />
                <span>Select All</span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.size === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                        disabled={filtered.length === 0}
                      />
                    </TableHead>
                    <TableHead>Registration No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>10th %</TableHead>
                    <TableHead>12th %</TableHead>
                    <TableHead>Diploma %</TableHead>
                    <TableHead>Graduation %</TableHead>
                    <TableHead>Degree YOP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((student) => (
                      <TableRow key={student.regdno} className={`${selectedStudents.has(student.regdno) ? 'bg-blue-50' : ''} hover:bg-muted/50 cursor-pointer`}>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.regdno)}
                            onChange={() => toggleStudent(student.regdno)}
                            className="w-4 h-4 rounded border-border cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.regdno}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.branchCode}</Badge>
                        </TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell className="text-center">{student.tenthPercentage || '-'}</TableCell>
                        <TableCell className="text-center">{student.twelfthPercentage || '-'}</TableCell>
                        <TableCell className="text-center">{student.diplomaPercentage || '-'}</TableCell>
                        <TableCell className="text-center">{student.graduationPercentage || '-'}</TableCell>
                        <TableCell className="text-center">{student.degreeYop || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
