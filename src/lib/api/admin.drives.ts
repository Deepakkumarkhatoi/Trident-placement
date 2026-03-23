import { apiFetch } from './client';

export interface AdminDriveResponse {
  id: number;
  companyName: string;
  role: string;
  driveType: string;
  lpaPackage: number;
  minimumCgpa: number;
  lastDate: string;
  description?: string;
  status: string;
  totalApplicants: number;
  shortlistedCount: number;
  selectedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DriveCreateRequest {
  companyName: string;
  role: string;
  driveType: string;
  lpaPackage: number;
  minimumCgpa: number;
  lastDate: string;
  description?: string;
}

export interface DriveUpdateRequest {
  companyName?: string;
  role?: string;
  driveType?: string;
  lpaPackage?: number;
  minimumCgpa?: number;
  lastDate?: string;
  description?: string;
}

export const adminDrivesApi = {
  getAll: () =>
    apiFetch<AdminDriveResponse[]>('/api/admin/drives'),

  getById: (id: number | string) =>
    apiFetch<AdminDriveResponse>(`/api/admin/drives/${id}`),

  create: (body: DriveCreateRequest) =>
    apiFetch<AdminDriveResponse>('/api/admin/drives', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: number | string, body: DriveUpdateRequest) =>
    apiFetch<AdminDriveResponse>(`/api/admin/drives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  toggleStatus: (id: number | string) =>
    apiFetch<AdminDriveResponse>(`/api/admin/drives/${id}/status`, {
      method: 'PATCH',
    }),

  delete: (id: number | string) =>
    apiFetch<void>(`/api/admin/drives/${id}`, { method: 'DELETE' }),
};