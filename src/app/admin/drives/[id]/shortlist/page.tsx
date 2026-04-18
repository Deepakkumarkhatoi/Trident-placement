'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  RefreshCw,
  AlertCircle,
  User,
  Mail,
  GraduationCap,
  Zap,
} from 'lucide-react';

import { adminDrivesApi } from '@/src/lib/api/admin.drives';
import { adminApplicationsApi } from '@/src/lib/api/admin.applications';
import { adminShortlistApi } from '@/src/lib/api/admin.shortlist';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Badge } from '@/src/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/src/components/ui/alert-dialog';

// ============================================================================
// TYPES
// ============================================================================

type RoundStatus = 'PENDING' | 'PASSED' | 'FAILED';

interface StudentApplication {
  applicationId: number;
  regdno: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  course: string;
  appliedDate: string;
  roundStatus: Record<string, RoundStatus>; // Dynamic - based on drive config
}

interface DriveDetails {
  id: number;
  companyName: string;
  role: string;
  lpaPackage: number;
  lastDate: string;
  eliminationRounds: string[]; // Dynamic rounds from this drive's configuration
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getStatusColor(status?: RoundStatus) {
  switch (status) {
    case 'PASSED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getStatusIcon(status?: RoundStatus) {
  switch (status) {
    case 'PASSED':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'FAILED':
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

// ============================================================================
// ROUND STATUS CELL COMPONENT
// ============================================================================

interface RoundStatusCellProps {
  roundName: string;
  status: RoundStatus | undefined;
  applicationId: number;
  driveId: number;
  onStatusChange: (appId: number, roundName: string, newStatus: RoundStatus) => void;
  disabled?: boolean;
}

function RoundStatusCell({
  roundName,
  status,
  applicationId,
  driveId,
  onStatusChange,
  disabled,
}: RoundStatusCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-1 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-all whitespace-nowrap ${getStatusColor(status)} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
        }`}
      >
        {getStatusIcon(status)}
        <span className="hidden sm:inline font-medium">
          {status ? (status === 'PASSED' ? '✓ Passed' : '✗ Failed') : 'Pending'}
        </span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute z-50 bg-white border rounded-lg shadow-lg mt-1 min-w-max top-full left-0">
          <button
            onClick={() => {
              onStatusChange(applicationId, roundName, 'PASSED');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-600 font-medium flex items-center gap-2 border-b"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Passed
          </button>
          <button
            onClick={() => {
              onStatusChange(applicationId, roundName, 'FAILED');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 border-b"
          >
            <XCircle className="w-4 h-4" />
            Mark as Failed
          </button>
          <button
            onClick={() => {
              onStatusChange(applicationId, roundName, 'PENDING');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-600 font-medium flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Reset to Pending
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ShortlistPage() {
  const params = useParams();
  const driveId = Number(params.id);

  const [drive, setDrive] = useState<DriveDetails | null>(null);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'PENDING'>('ALL');
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    type: 'send-notification' | null;
    roundName: string | null;
    count: number;
  }>({ isOpen: false, type: null, roundName: null, count: 0 });

  // ════════════════════════════════════════════════════════════════════════
  // INITIALIZATION - Load drive with dynamic rounds
  // ════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get drive details
        const driveData = await adminDrivesApi.getById(driveId);

        // Get drive JD to extract elimination rounds
        const jdData = await adminDrivesApi.getJD(driveId);

        // Extract round names from selectionProcess (admin configured during drive creation)
        const rounds = (jdData.selectionProcess || [])
          .filter((process) => process.eliminationRound)
          .map((process) => process.description.toUpperCase().replace(/\s+/g, '_'));

        setDrive({
          id: driveData.id,
          companyName: driveData.companyName,
          role: driveData.role,
          lpaPackage: driveData.lpaPackage,
          lastDate: driveData.lastDate,
          eliminationRounds: rounds,
        });

        // Get applications
        const appsData = await adminApplicationsApi.getByDrive(driveId);

        // Get round status for all applications
        const roundStatusResponse = await adminShortlistApi.getRoundStatus(driveId);
        
        // Extract the data array from the response
        const roundStatusData = roundStatusResponse.data || [];

        // Merge applications with round status
        const mergedApps = appsData.map((app) => {
          const roundInfo = roundStatusData.find((r) => r.applicationId === app.applicationId);
          return {
            ...app,
            roundStatus: roundInfo?.roundStatus || {},
          };
        });

        setApplications(mergedApps);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [driveId]);

  // ════════════════════════════════════════════════════════════════════════
  // FILTERING & SEARCH
  // ════════════════════════════════════════════════════════════════════════

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return applications.filter((app) => {
      const matchSearch =
        !query ||
        app.studentName.toLowerCase().includes(query) ||
        app.studentEmail.toLowerCase().includes(query) ||
        app.regdno.toLowerCase().includes(query) ||
        app.branch.toLowerCase().includes(query);

      let matchFilter = true;
      if (roundFilter !== 'ALL') {
        const roundStatus = app.roundStatus[roundFilter];
        if (statusFilter === 'ALL') {
          matchFilter = true;
        } else {
          matchFilter = roundStatus === statusFilter;
        }
      } else if (statusFilter !== 'ALL') {
        const hasStatus = Object.values(app.roundStatus).some((s) => s === statusFilter);
        matchFilter = hasStatus;
      }

      return matchSearch && matchFilter;
    });
  }, [applications, searchQuery, roundFilter, statusFilter]);

  // ════════════════════════════════════════════════════════════════════════
  // STATUS UPDATE HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleStatusChange = async (appId: number, roundName: string, newStatus: RoundStatus) => {
    setIsSaving(true);
    try {
      await adminShortlistApi.updateRoundStatus(driveId, appId, roundName, newStatus);

      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === appId
            ? {
                ...app,
                roundStatus: {
                  ...app.roundStatus,
                  [roundName]: newStatus,
                },
              }
            : app
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendNotifications = async (roundName: string) => {
    setIsSaving(true);
    try {
      const appIds = filteredApplications.map((a) => a.applicationId);
      await adminShortlistApi.sendNotifications(driveId, roundName, appIds);

      alert('Notifications sent successfully!');
      setAlertState({ isOpen: false, type: null, roundName: null, count: 0 });
    } catch (error) {
      console.error('Failed to send notifications:', error);
      alert('Failed to send notifications. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // STATS CALCULATION
  // ════════════════════════════════════════════════════════════════════════

  const roundStats = useMemo(() => {
    if (!drive) return {};

    const stats: Record<string, { passed: number; failed: number; pending: number }> = {};

    // Initialize stats for each round
    drive.eliminationRounds.forEach((round) => {
      stats[round] = { passed: 0, failed: 0, pending: 0 };
    });

    // Count statuses
    applications.forEach((app) => {
      Object.entries(app.roundStatus).forEach(([roundName, status]) => {
        if (stats[roundName]) {
          if (status === 'PASSED') stats[roundName].passed++;
          else if (status === 'FAILED') stats[roundName].failed++;
          else stats[roundName].pending++;
        }
      });
    });

    return stats;
  }, [applications, drive]);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading shortlisting data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rounds = drive?.eliminationRounds || [];

  return (
    <div className="space-y-6 pb-10">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Student Shortlisting</h1>
        {drive && (
          <div>
            <p className="text-muted-foreground">
              {drive.companyName} • {drive.role} • ₹{drive.lpaPackage} LPA
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Elimination Rounds: {rounds.length > 0 ? rounds.join(' → ') : 'No rounds configured'}
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ROUND STATISTICS CARDS - DYNAMIC */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {rounds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rounds.map((roundName, idx) => {
            const stats = roundStats[roundName] || { passed: 0, failed: 0, pending: 0 };
            const total = stats.passed + stats.failed + stats.pending;
            const passRate = total ? Math.round((stats.passed / total) * 100) : 0;

            return (
              <Card key={roundName} className="border-l-4" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                        {idx + 1}
                      </div>
                      <CardTitle className="text-base">{roundName.replace(/_/g, ' ')}</CardTitle>
                    </div>
                    <Badge variant="outline">{total} students</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pass Rate</span>
                      <span className="font-semibold text-emerald-600">{passRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${passRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-emerald-50 rounded border border-emerald-200">
                      <div className="font-bold text-emerald-700">{stats.passed}</div>
                      <div className="text-emerald-600">Passed</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                      <div className="font-bold text-red-700">{stats.failed}</div>
                      <div className="text-red-600">Failed</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="font-bold text-gray-700">{stats.pending}</div>
                      <div className="text-gray-600">Pending</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setAlertState({ isOpen: true, type: 'send-notification', roundName, count: stats.passed })}
                    disabled={isSaving || stats.passed === 0}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send Notifications
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-amber-700 font-medium">No Elimination Rounds Configured</p>
            <p className="text-sm text-amber-600 mt-1">
              Please configure elimination rounds when creating/editing the drive JD
            </p>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FILTERS & SEARCH */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, Email, Reg No, Branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">Round</label>
              <Select value={roundFilter} onValueChange={setRoundFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Rounds</SelectItem>
                  {rounds.map((roundName) => (
                    <SelectItem key={roundName} value={roundName}>
                      {roundName.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRoundFilter('ALL');
                setStatusFilter('ALL');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {applications.length} students
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* APPLICATIONS TABLE - DYNAMIC ROUNDS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-200">
                  <TableHead className="font-semibold text-foreground">Student</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Branch</TableHead>
                  {rounds.map((roundName) => (
                    <TableHead key={roundName} className="font-semibold text-foreground text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs">{roundName.replace(/_/g, ' ')}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2 + rounds.length} className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.applicationId} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            {app.studentName}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            {app.regdno}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {app.studentEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge variant="outline">{app.branch}</Badge>
                      </TableCell>
                      {rounds.map((roundName) => (
                        <TableCell key={roundName} className="text-center py-4 relative">
                          <RoundStatusCell
                            roundName={roundName}
                            status={app.roundStatus[roundName]}
                            applicationId={app.applicationId}
                            driveId={driveId}
                            onStatusChange={handleStatusChange}
                            disabled={isSaving}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* NOTIFICATION DIALOG */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      <AlertDialog open={alertState.isOpen} onOpenChange={(open) => !open && setAlertState({ isOpen: false, type: null, roundName: null, count: 0 })}>
        <AlertDialogContent>
          {alertState.type === 'send-notification' && alertState.roundName && (
            <>
              <AlertDialogTitle>Send Notifications</AlertDialogTitle>
              <AlertDialogDescription>
                Send {alertState.roundName.replace(/_/g, ' ')} round notifications to {alertState.count} students who passed?
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                  <strong>Note:</strong> Notifications will be sent to all students matching current filters. Only students with "Passed" status will receive notifications.
                </div>
              </AlertDialogDescription>
              <div className="flex gap-3 mt-6">
                <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isSaving}
                  onClick={() => handleSendNotifications(alertState.roundName!)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSaving ? 'Sending...' : 'Send Notifications'}
                </AlertDialogAction>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
