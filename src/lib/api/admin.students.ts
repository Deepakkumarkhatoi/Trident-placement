import { apiFetch } from './client';
import type { AdminApplicationResponse } from './admin.applications';

export interface AdminStatsDTO {
  totalStudents: number;
  totalDrives: number;
  openDrives: number;
  totalApplications: number;
  placedStudents: number;
  shortlistedStudents: number;
}

export interface StudentSummaryDTO {
  regdno: string;
  name: string;
  email: string;
  branch: string;
  course: string;
  admissionYear: number;
  degreeYop: number;
  status: string;
  totalApplications: number;
  placedCount: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
}

export interface StudentDTO {
  regdno: string;
  name: string;
  gender: string;
  dob: string;
  course: string;
  branchCode: string;
  admissionYear: number;
  degreeYop: number;
  phno: string;
  email: string;
  status: string;
  collegeName?: string;
}

export const adminStudentsApi = {
  getStats: () =>
    apiFetch<AdminStatsDTO>('/api/admin/stats'),

  getAll: () =>
    apiFetch<StudentSummaryDTO[]>('/api/admin/students'),

  search: (q: string) =>
    apiFetch<StudentSummaryDTO[]>(`/api/admin/students/search?q=${encodeURIComponent(q)}`),

  list: (params: { page?: number; size?: number; q?: string; admissionYear?: number } = {}) => {
    const { page = 0, size = 20, q, admissionYear } = params;
    const parts = [`/api/admin/students?page=${page}&size=${size}`];
    if (q) parts.push(`q=${encodeURIComponent(q)}`);
    if (admissionYear) parts.push(`admissionYear=${admissionYear}`);
    const path = parts.join('&').replace('/api/admin/students&', '/api/admin/students?');
    return apiFetch<PaginatedResponse<StudentSummaryDTO>>(path);
  },

  getProfile: (regdno: string) =>
    apiFetch<StudentDTO>(`/api/admin/students/${regdno}`),

  getApplicationHistory: (regdno: string) =>
    apiFetch<AdminApplicationResponse[]>(`/api/admin/students/${regdno}/applications`),
};