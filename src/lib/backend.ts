
import { getSession } from "next-auth/react";

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    if (!session?.user) return null;
    return (session.user as any).accessToken as string;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Config ────────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND!;

// ── Type definitions ──────────────────────────────────────────────────────────

export interface DriveData {
  id: string;
  company: string;
  role: string;
  type: string;
  lpa: string;
  cgpa: string;
  lastDate: string;
  description: string;
  initial: string;
  color: string;
  branches?: string[]; // Array of branch codes this drive is open for (e.g., ['CSE', 'ETC'])
  status?: 'Active' | 'Closed'; // Drive status based on lastDate
}
export interface StatsData {
  label: string;
  value: number;
  color: 'primary' | 'info' | 'warning' | 'success';
}

export interface ApplicationData {
  id: string | number;
  driveId: string | number;
  company: string;
  role: string;
  appliedOn: string;
  status: 'Applied' | 'Shortlisted' | 'Approved' | 'Rejected';
  round: string;
  lpa: string;
}

export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  profileInitial: string;
  degree: string;
  cgpa: string;
  batch: string;
  rollNumber: string;
  department: string;
  score10th: string;
  score12th: string;
  skills: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getColorForCompany(company: string): string {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = ((hash << 5) - hash) + company.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
}

function mapDriveData(backendDrive: any): DriveData {
  const companyName = backendDrive.companyName || backendDrive.company || '';
  const lastDate = backendDrive.lastDate || '';
  
  // Determine if drive is active or closed based on lastDate
  let status: 'Active' | 'Closed' = 'Active';
  if (lastDate) {
    const driveDeadline = new Date(lastDate);
    const today = new Date();
    status = driveDeadline < today ? 'Closed' : 'Active';
  }
  
  return {
    id:          backendDrive.id || '',
    company:     companyName,
    role:        backendDrive.role || '',
    type:        backendDrive.driveType || backendDrive.type || '',
    lpa:         backendDrive.lpaPackage?.toString() || backendDrive.lpa || '',
    cgpa:        backendDrive.minimumCgpa?.toString() || backendDrive.cgpa || '',
    lastDate:    lastDate,
    description: backendDrive.description || '',
    initial:     companyName.charAt(0).toUpperCase(),
    color:       getColorForCompany(companyName),
    branches:    backendDrive.allowedBranches || backendDrive.branches || backendDrive.eligibleBranches || [],
    status:      status,
  };
}

function mapApplicationStatus(status: string): ApplicationData['status'] {
  const statusMap: Record<string, ApplicationData['status']> = {
    'APPLIED':     'Applied',
    'SHORTLISTED': 'Shortlisted',
    'APPROVED':    'Approved',
    'REJECTED':    'Rejected',
  };
  return statusMap[status.toUpperCase()] ?? 'Applied';
}

function mapStudentToProfile(student: any): StudentProfile {
  return {
    name:           student.name || '',
    email:          student.email || '',
    phone:          student.phno || '',
    location:       student.collegeName || 'Not Provided',
    profileInitial: (student.name || '').charAt(0).toUpperCase(),
    degree:         student.course || '',
    cgpa:           student.cgpa || 'N/A',
    batch:          student.admissionYear?.toString() || student.batchId || '',
    rollNumber:     student.regdno || '',
    department:     student.branchCode || '',
    score10th:      student.tenthPercentage ? student.tenthPercentage.toString() : 'N/A',
    score12th:      student.twelvthPercentage ? student.twelvthPercentage.toString() : 'N/A',
    skills:         student.skills || [],
  };
}

async function studentFetch<T>(path: string): Promise<T | null> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    return (data.data ?? data) as T;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

// ── Student-facing API functions ──────────────────────────────────────────────


export async function fetchProfile(): Promise<StudentProfile | null> {
  const data = await studentFetch<any>(`/api/profile`);
  return data ? mapStudentToProfile(data) : null;
}

export async function fetchDrives(): Promise<DriveData[]> {
  const data = await studentFetch<any[]>('/api/drives');
  return Array.isArray(data) ? data.map(mapDriveData) : [];
}

export async function fetchDriveById(driveId: string): Promise<DriveData | null> {
  const data = await studentFetch<any>(`/api/drives/${driveId}`);
  return data ? mapDriveData(data) : null;
}

export async function fetchOpenDrives(): Promise<DriveData[]> {
  const data = await studentFetch<any[]>('/api/drives/open');
  return Array.isArray(data) ? data.map(mapDriveData) : [];
}

export async function fetchEligibleDrives(studentId: string): Promise<DriveData[]> {
  const data = await studentFetch<any[]>(`/api/drives/eligible/${studentId}`);
  return Array.isArray(data) ? data.map(mapDriveData) : [];
}

export async function fetchDrivesByType(type: string): Promise<DriveData[]> {
  const data = await studentFetch<any[]>(`/api/drives/type/${type}`);
  return Array.isArray(data) ? data.map(mapDriveData) : [];
}

export async function fetchApplications(studentId: string): Promise<ApplicationData[]> {
  const data = await studentFetch<any[]>(`/api/applications/${studentId}`);
  if (!Array.isArray(data)) return [];


  const drives = await fetchOpenDrives();
  const driveMap = new Map(drives.map(d => [d.id.toString(), d.lpa]));

  return data.map((app: any) => {
    const driveId = app.driveId || app.drive?.id;
    const lpa =
      app.drive?.lpaPackage?.toString() ||
      (driveId ? driveMap.get(driveId.toString()) : undefined) ||
      'N/A';

    return {
      id:        app.id || '',
      driveId:   driveId || '',
      company:   app.companyName || app.company || '',
      role:      app.driveRole || app.role || '',
      appliedOn: app.appliedDate || app.appliedOn || '',
      status:    mapApplicationStatus(app.status || 'APPLIED'),
      round:     app.round || '',
      lpa,
    };
  });
}

export async function fetchApplicationsByStatus(
  studentId: string,
  status: string
): Promise<ApplicationData[]> {
  const data = await studentFetch<any[]>(`/api/applications/${studentId}/status/${status}`);
  if (!Array.isArray(data)) return [];

  const drives = await fetchOpenDrives();
  const driveMap = new Map(drives.map(d => [d.id.toString(), d.lpa]));

  return data.map((app: any) => {
    const driveId = app.driveId || app.drive?.id;
    const lpa =
      app.drive?.lpaPackage?.toString() ||
      (driveId ? driveMap.get(driveId.toString()) : undefined) ||
      'N/A';

    return {
      id:        app.id || '',
      driveId:   driveId || '',
      company:   app.companyName || app.company || '',
      role:      app.driveRole || app.role || '',
      appliedOn: app.appliedDate || app.appliedOn || '',
      status:    mapApplicationStatus(app.status || status),
      round:     app.round || '',
      lpa,
    };
  });
}

export async function applyToDrive(studentId: string, driveId: string) {
  try {
    const headers = await getAuthHeaders();
    const url = `${BACKEND_URL}/api/applications/${studentId}/apply/${driveId}`;
    console.log('📤 Applying to drive:', { studentId, driveId, url });
    
    const response = await fetch(url, { method: 'POST', headers });
    
    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      console.error('❌ Apply failed:', { status: response.status, error: errorData });
      throw new Error(`${response.status} ${response.statusText} - ${errorData}`);
    }
    
    const data = await response.json();
    console.log('✅ Application submitted successfully');
    return data;
  } catch (error) {
    console.error('❌ Error applying to drive:', error);
    throw error;
  }
}

/** @deprecated */
export async function fetchDashboard() {
  console.warn('fetchDashboard is deprecated');
  return null;
}