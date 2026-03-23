 'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Skeleton } from '@/src/components/ui/skeleton';
import { Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { adminStudentsApi, type StudentSummaryDTO } from '@/src/lib/api/admin.students';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [admissionYear, setAdmissionYear] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 20;
  const searchDebounce = useRef<number | null>(null);

  // clear pending debounce on unmount
  useEffect(() => {
    return () => {
      if (searchDebounce.current) window.clearTimeout(searchDebounce.current);
    };
  }, []);

  useEffect(() => {
    // fetch data when page, searchTerm or admissionYear changes
    setLoading(true);
    adminStudentsApi
      .list({ page, size, q: searchTerm || undefined, admissionYear })
      .then(res => {
        setStudents(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, searchTerm, admissionYear]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground mt-2">Manage and view student records</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 w-full">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, reg no, or email..."
              value={searchInput}
              onChange={e => {
                const v = e.target.value;
                setSearchInput(v);
                // debounce updating searchTerm to avoid rapid requests
                if (searchDebounce.current) window.clearTimeout(searchDebounce.current);
                searchDebounce.current = window.setTimeout(() => {
                  setPage(0);
                  setSearchTerm(v);
                }, 300);
              }}
              className="flex-1"
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={admissionYear ?? ''}
              onChange={e => { setPage(0); setAdmissionYear(e.target.value ? Number(e.target.value) : undefined); }}
            >
              <option value="">All years</option>
              {Array.from({ length: 2030 - 1990 + 1 }, (_, i) => 1990 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : students.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reg No.</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.regdno}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.regdno}</TableCell>
                      <TableCell>{student.branch}</TableCell>
                      <TableCell>{student.course}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {student.totalApplications}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm ${student.placedCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {student.placedCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/students/${student.regdno}`}>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">Showing {(page * size) + 1} - {Math.min((page + 1) * size, totalElements)} of {totalElements}</div>
                <div className="flex items-center gap-1">
                  <Button size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page <= 0} variant="outline">Previous</Button>
                  
                  {/* Pagination Numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {/* First page */}
                    {totalPages > 0 && (
                      <button
                        onClick={() => setPage(0)}
                        className={`px-3 py-1 rounded text-sm ${page === 0 ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border hover:bg-accent'}`}
                      >
                        1
                      </button>
                    )}
                    
                    {/* Ellipsis if gap before current range */}
                    {page > 2 && <span className="px-2 text-muted-foreground">...</span>}
                    
                    {/* Page range around current */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2, totalPages - 5)) + i;
                      if (pageNum === 0 || pageNum === totalPages - 1) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-1 rounded text-sm ${pageNum === page ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border hover:bg-accent'}`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    }).filter(Boolean)}
                    
                    {/* Ellipsis if gap after current range */}
                    {page < totalPages - 3 && <span className="px-2 text-muted-foreground">...</span>}
                    
                    {/* Last page */}
                    {totalPages > 1 && (
                      <button
                        onClick={() => setPage(totalPages - 1)}
                        className={`px-3 py-1 rounded text-sm ${page === totalPages - 1 ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border hover:bg-accent'}`}
                      >
                        {totalPages}
                      </button>
                    )}
                  </div>
                  
                  <Button size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} variant="outline">Next</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8"><p className="text-muted-foreground">No students found</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}