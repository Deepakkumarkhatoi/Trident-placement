import { apiFetch } from './client';

export interface StudentCgpaInfo {
  regdno: string;
  name: string;
  cgpa: number;
  lastUpdated: string; 
}

export interface CgpaRefreshResponse {
  message: string;
  timestamp: string;
}

export const adminCgpaApi = {
  // Refresh CGPA for all students
  refreshAllCgpa: () =>
    apiFetch<CgpaRefreshResponse>('/api/admin/cgpa/refresh-all', {
      method: 'POST',
    }),

  // Refresh CGPA for a single student
  refreshStudentCgpa: (regdno: string) =>
    apiFetch<CgpaRefreshResponse>(`/api/admin/cgpa/refresh/${regdno}`, {
      method: 'POST',
    }),

  // Get stored CGPA for a student
  getStudentCgpa: (regdno: string) =>
    apiFetch<StudentCgpaInfo>(`/api/admin/cgpa/${regdno}`, {
      method: 'GET',
    }),
};
