/**
 * Frontend API Client: Student Applications
 * Location: src/lib/api/student.applications.ts
 * 
 * Handles all student-facing application operations:
 * - Apply to a drive
 * - Retrieve my applications
 * - Check if already applied
 */

import { apiFetch } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ApplyToDriveRequest {
  // Currently empty, but ready for future fields like:
  // resumeUrl?: string;
  // customFields?: Record<string, string>;
}

export interface ApplyToDriveResponse {
  success: boolean;
  applicationId: number;
  message: string;
  appliedDate: string; // ISO 8601 datetime
}

export interface RoundStatus {
  [roundName: string]: 'PENDING' | 'PASSED' | 'FAILED' | null;
}

export interface MyApplication {
  applicationId: number;
  driveId: number;
  companyName: string;
  appliedDate: string; // ISO 8601 datetime
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  roundStatus: RoundStatus; // e.g., { "APTI": "PASSED", "DSA": "PENDING" }
}

export interface ApplicationStatusCheck {
  driveId: number;
  applied: boolean;
}

// ── API Methods ───────────────────────────────────────────────────────────────

/**
 * Apply to a drive.
 * 
 * POST /api/student/drives/{driveId}/apply
 * 
 * @param driveId - The drive ID to apply to
 * @returns - Application confirmation with ID
 * @throws - 400 if ineligible or already applied
 * @throws - 404 if drive not found
 * @throws - 409 if duplicate application
 * 
 * Example:
 * const result = await studentApplicationsApi.apply(123);
 * console.log(result.applicationId); // 456
 */
export async function apply(driveId: number): Promise<ApplyToDriveResponse> {
  try {
    const response = await apiFetch<ApplyToDriveResponse>(
      `/api/student/drives/${driveId}/apply`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to apply to drive';
    
    // Check if error is due to specific status codes
    if (message.includes('409')) {
      throw new Error('You have already applied to this drive');
    }
    if (message.includes('404')) {
      throw new Error('Drive not found');
    }
    if (message.includes('400')) {
      // Backend should provide specific error message
      throw new Error(message);
    }
    
    throw new Error(message);
  }
}

/**
 * Retrieve all of my applications.
 * 
 * GET /api/student/applications
 * 
 * @returns - Array of applications with their shortlist status per round
 * 
 * Example:
 * const apps = await studentApplicationsApi.getMyApplications();
 * apps.forEach(app => {
 *   console.log(`${app.companyName}: ${app.roundStatus.APTI}`);
 * });
 */
export async function getMyApplications(): Promise<MyApplication[]> {
  try {
    const response = await apiFetch<MyApplication[]>('/api/student/applications', {
      method: 'GET',
    });

    return response || [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch applications';
    throw new Error(message);
  }
}

/**
 * Check if already applied to a drive.
 * 
 * GET /api/student/drives/{driveId}/check
 * 
 * @param driveId - The drive ID to check
 * @returns - true if applied, false otherwise
 * 
 * Example:
 * const hasApplied = await studentApplicationsApi.checkIfApplied(123);
 * if (hasApplied) {
 *   console.log('Already applied!');
 * }
 */
export async function checkIfApplied(driveId: number): Promise<boolean> {
  try {
    const response = await apiFetch<boolean>(
      `/api/student/drives/${driveId}/check`,
      {
        method: 'GET',
      }
    );

    return response || false;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check application status';
    throw new Error(message);
  }
}

// ── Export as namespace ────────────────────────────────────────────────────────

export const studentApplicationsApi = {
  apply,
  getMyApplications,
  checkIfApplied,
};

export default studentApplicationsApi;
