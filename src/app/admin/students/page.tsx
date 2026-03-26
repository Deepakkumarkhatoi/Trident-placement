'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';

import { adminStudentsApi, type StudentSummaryDTO } from '@/src/lib/api/admin.students';
import { Card, CardContent } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

type StatusFilter = 'ALL' | 'PLACED' | 'APPLYING' | 'NOT_APPLIED';

const pageSize = 20;

function statusPill(s: StudentSummaryDTO) {
  const isPlaced = s.placedCount > 0;
  const isApplying = !isPlaced && s.totalApplications > 0;
  if (isPlaced) {
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">PLACED</span>;
  }
  if (isApplying) {
    return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">ACTIVE</span>;
  }
  return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">NOT APPLIED</span>;
}

export default function StudentsPage() {
  const [allStudents, setAllStudents] = useState<StudentSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0); 

  const [q, setQ] = useState('');
  const [branch, setBranch] = useState('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');

  function normalizeStudents(input: unknown): StudentSummaryDTO[] {
    if (Array.isArray(input)) return input as StudentSummaryDTO[];
    const maybe = input as any;
    if (Array.isArray(maybe?.content)) return maybe.content as StudentSummaryDTO[];
    if (Array.isArray(maybe?.data)) return maybe.data as StudentSummaryDTO[];
    if (Array.isArray(maybe?.students)) return maybe.students as StudentSummaryDTO[];
    return [];
  }

  useEffect(() => {
    setLoading(true);
    adminStudentsApi
      .getAll()
      .then((res: StudentSummaryDTO[]) => {
        setAllStudents(normalizeStudents(res));
      })
      .catch(() => {
        setAllStudents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = allStudents;
    return base.filter((s) => {
      const matchText =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.regdno.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        (s.branch || '').toLowerCase().includes(query);
      const matchBranch = branch === 'ALL' ? true : (s.branch || '—') === branch;
      const isPlaced = s.placedCount > 0;
      const isApplying = !isPlaced && s.totalApplications > 0;
      const isNot = !isPlaced && s.totalApplications === 0;
      const matchStatus =
        status === 'ALL'
          ? true
          : status === 'PLACED'
            ? isPlaced
            : status === 'APPLYING'
              ? isApplying
              : status === 'NOT_APPLIED'
                ? isNot
                : true;
      return matchText && matchBranch && matchStatus;
    });
  }, [allStudents, q, branch, status]);

  const branches = useMemo(() => {
    const set = new Set<string>();
    allStudents.forEach((s) => set.add(s.branch || '—'));
    return Array.from(set).filter(Boolean).sort();
  }, [allStudents]);

  const cardCounts = useMemo(() => {
    const placed = filtered.filter((s) => s.placedCount > 0).length;
    const applying = filtered.filter((s) => s.placedCount === 0 && s.totalApplications > 0).length;
    const notApplied = filtered.filter((s) => s.placedCount === 0 && s.totalApplications === 0).length;
    return { total: filtered.length, placed, applying, notApplied };
  }, [filtered]);

  const totalPages = useMemo(() => Math.ceil(filtered.length / pageSize), [filtered.length]);

  const paginatedStudents = useMemo(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
        <p className="text-muted-foreground mt-2 text-sm">Manage records, CGPA, status — {cardCounts.total} total students</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <div className="text-sm text-muted-foreground dark:text-slate-300 font-medium">TOTAL</div>
          <div className="text-3xl font-bold text-foreground dark:text-white">{cardCounts.total}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <div className="text-sm text-muted-foreground dark:text-slate-300 font-medium">PLACED</div>
          <div className="text-3xl font-bold text-foreground dark:text-white">{cardCounts.placed}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <div className="text-sm text-muted-foreground dark:text-slate-300 font-medium">APPLYING</div>
          <div className="text-3xl font-bold text-foreground dark:text-white">{cardCounts.applying}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <div className="text-sm text-muted-foreground dark:text-slate-300 font-medium">NOT APPLIED</div>
          <div className="text-3xl font-bold text-foreground dark:text-white">{cardCounts.notApplied}</div>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => {
                  setPage(0);
                  setQ(e.target.value);
                }}
                placeholder="Search by name, roll no..."
                className="pl-10 bg-background"
              />
            </div>

            <Select value={branch} onValueChange={(v) => {
              setPage(0);
              setBranch(v);
            }}>
              <SelectTrigger className="w-full lg:w-56">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => {
              setPage(0);
              setStatus(v as StatusFilter);
            }}>
              <SelectTrigger className="w-full lg:w-56">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PLACED">PLACED</SelectItem>
                <SelectItem value="APPLYING">APPLYING</SelectItem>
                <SelectItem value="NOT_APPLIED">NOT APPLIED</SelectItem>
              </SelectContent>
            </Select>

            <Select disabled>
              <SelectTrigger className="w-full lg:w-56">
                <SelectValue placeholder="Any CGPA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Any CGPA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className="text-muted-foreground text-sm py-10 text-center">Loading...</div>
            ) : filtered.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Offers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((s) => (
                    <TableRow key={s.regdno}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                            {String(s.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{s.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{s.email || ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.regdno}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.branch || ''}</TableCell>
                      <TableCell className="text-sm text-muted-foreground"></TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                          {s.totalApplications}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.placedCount}</TableCell>
                      <TableCell>{statusPill(s)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/students/${s.regdno}`}>
                            <Button variant="ghost" size="sm" className="p-2">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">No students found</div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : page * pageSize + 1} – {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Prev
              </Button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 1, totalPages - 3));
                  return start + i;
                }).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={[
                      'px-3 py-1 rounded text-sm border transition-colors',
                      p === page ? 'bg-primary text-primary-foreground font-semibold border-primary' : 'bg-background hover:bg-accent',
                    ].join(' ')}
                  >
                    {p + 1}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="outline" disabled={page >= Math.max(0, totalPages - 1)} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
