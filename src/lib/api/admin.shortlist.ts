import { apiFetch } from './client';

export interface RoundStatusRecord {
  applicationId: number;
  driveId: number;
  round: string; // Dynamic round name
  status: 'PENDING' | 'PASSED' | 'FAILED';
  updatedAt: string;
}

export interface StudentRoundStatusDTO {
  applicationId: number;
  regdno: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  appliedDate: string;
  roundStatus: Record<string, 'PENDING' | 'PASSED' | 'FAILED' | null>; // Dynamic rounds, null = not yet evaluated
}

export interface ShortlistStatusResponse {
  data: StudentRoundStatusDTO[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  availableRounds: string[];
}

export const adminShortlistApi = {
  // Get round status for all applications in a drive
  getRoundStatus: (driveId: number | string) =>
    apiFetch<ShortlistStatusResponse>(`/api/admin/drives/${driveId}/shortlist/status`),

  // Update single round status for an application (with dynamic round name)
  updateRoundStatus: (
    driveId: number | string,
    applicationId: number | string,
    roundName: string, // Dynamic round name from drive config
    status: 'PENDING' | 'PASSED' | 'FAILED'
  ) =>
    apiFetch<RoundStatusRecord>(`/api/admin/drives/${driveId}/shortlist/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ roundName, status }),
    }),

  // Bulk update round status for multiple applications
  bulkUpdateRoundStatus: (
    driveId: number | string,
    roundName: string,
    status: 'PENDING' | 'PASSED' | 'FAILED',
    applicationIds: number[]
  ) =>
    apiFetch<{ updated: number }>(`/api/admin/drives/${driveId}/shortlist/bulk`, {
      method: 'PATCH',
      body: JSON.stringify({ roundName, status, applicationIds }),
    }),

  // Send notifications to students for a round
  sendNotifications: (
    driveId: number | string,
    roundName: string,
    applicationIds?: number[]
  ) =>
    apiFetch<{ sent: number }>(`/api/admin/drives/${driveId}/shortlist/notify`, {
      method: 'POST',
      body: JSON.stringify({ roundName, applicationIds }),
    }),

  // Get shortlist summary for a drive
  getSummary: (driveId: number | string) =>
    apiFetch<{
      driveId: number;
      totalApplications: number;
      byRound: Record<string, { passed: number; failed: number; pending: number }>;
    }>(`/api/admin/drives/${driveId}/shortlist/summary`),

  // Export shortlist as CSV
  exportCsv: async (driveId: number | string, round?: string): Promise<Blob> => {
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    const token = (session?.user as any)?.accessToken;
    const qs = round ? `?round=${encodeURIComponent(round)}` : '';

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/drives/${driveId}/shortlist/export${qs}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },
};
