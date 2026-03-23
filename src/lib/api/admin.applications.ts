import { apiFetch } from './client';

export interface AdminApplicationResponse {
  applicationId: number;
  regdno: string;
  studentName: string;
  studentEmail: string;
  branch: string;
  course: string;
  driveId: number;
  companyName: string;
  driveRole: string;
  driveType: string;
  status: string;
  appliedDate: string;
  updatedAt: string;
}

export const adminApplicationsApi = {
  getAll: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<AdminApplicationResponse[]>(`/api/admin/applications${qs}`);
  },

  getByDrive: (driveId: number | string, status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<AdminApplicationResponse[]>(
      `/api/admin/applications/drive/${driveId}${qs}`
    );
  },

  updateStatus: (applicationId: number | string, status: string) =>
    apiFetch<AdminApplicationResponse>(
      `/api/admin/applications/${applicationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  exportCsv: async (driveId?: number | string): Promise<Blob> => {
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    const token = (session?.user as any)?.accessToken;
    const qs = driveId ? `?driveId=${driveId}` : '';
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/applications/export${qs}`,
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