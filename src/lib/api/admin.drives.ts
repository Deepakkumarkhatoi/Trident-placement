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
  allowedBranches: string[];
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

export interface DriveJDRequest {
  companyName: string;
  role: string;
  driveType: 'ON_CAMPUS' | 'OFF_CAMPUS' | 'POOL';
  lpa: string;
  lastDateApplication: string;
  jobLocation: string;
  employmentType: 'Full Time' | 'Internship' | 'Part Time' | 'Contract';
  workMode: 'On-Site' | 'Remote' | 'Hybrid';
  vacancies: string;
  serviceAgreement: string;
  joining: string;
  cgpaCutoff: string;
  backlogsAllowed: boolean;
  allowedBranches: string[];
  allowedCourses: string[];
  batch: string;
  aboutCompany: string;
  website: string;
  headquarters: string;
  roleOverview: string;
  requiredSkills: string[];
  keyResponsibilities: string[];
  whyJoin: string[];
  selectionProcess: { description: string; eliminationRound: boolean }[];
}

export interface DriveJDResponse extends DriveJDRequest {
  id: number;
  driveId: number;
  createdAt: string;
  updatedAt: string;
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

  // Job Description (JD) Management
  upsertJD: (driveId: number | string, body: DriveJDRequest) =>
    apiFetch<DriveJDResponse>(`/api/admin/drives/${driveId}/jd`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  getJD: (driveId: number | string) =>
    apiFetch<DriveJDResponse>(`/api/admin/drives/${driveId}/jd`),

  // Student endpoint with eligibility enforcement
  getJDForStudent: (driveId: number | string, regdno: string) =>
    apiFetch<DriveJDResponse>(`/api/drives/${driveId}/jd?regdno=${encodeURIComponent(regdno)}`),
};