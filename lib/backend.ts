// Backend API configuration and client functions

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

// Type definitions for response data
export interface StatsData {
  label: string;
  value: number;
  color: 'primary' | 'info' | 'warning' | 'success';
}

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
}

export interface ApplicationData {
  id: string | number;
  company: string;
  role: string;
  appliedOn: string;
  status: 'Applied' | 'In Review' | 'Shortlisted' | 'Selected' | 'Rejected';
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

// Fetch student dashboard data (stats, profile, etc.)
export async function fetchDashboard(regdno: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/dashboard/${regdno}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return null;
  }
}

// Fetch all available drives
export async function fetchDrives(): Promise<DriveData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drives`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drives: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching drives:', error);
    return [];
  }
}

// Fetch specific drive details by ID
export async function fetchDriveById(driveId: string): Promise<DriveData | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drives/${driveId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drive: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching drive:', error);
    return null;
  }
}

// Fetch eligible drives for student
export async function fetchEligibleDrives(studentId: string): Promise<DriveData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drives/eligible/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch eligible drives: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching eligible drives:', error);
    return [];
  }
}

// Fetch drives filtered by type
export async function fetchDrivesByType(type: string): Promise<DriveData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drives/type/${type}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch drives by type: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching drives by type:', error);
    return [];
  }
}

// Fetch open drives
export async function fetchOpenDrives(): Promise<DriveData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/drives/open`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch open drives: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching open drives:', error);
    return [];
  }
}

// Fetch student applications
export async function fetchApplications(studentId: string): Promise<ApplicationData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/applications/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

// Fetch applications filtered by status
export async function fetchApplicationsByStatus(studentId: string, status: string): Promise<ApplicationData[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/applications/${studentId}/status/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch applications by status: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching applications by status:', error);
    return [];
  }
}

// Apply to a drive
export async function applyToDrive(studentId: string, driveId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/applications/${studentId}/apply/${driveId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to apply: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error applying to drive:', error);
    return null;
  }
}
