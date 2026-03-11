// Backend API configuration and client functions

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

// Helper function to map backend drive data to frontend format
function mapDriveData(backendDrive: any): DriveData {
  const companyName = backendDrive.companyName || backendDrive.company || '';
  return {
    id: backendDrive.id || '',
    company: companyName,
    role: backendDrive.role || '',
    type: backendDrive.type || '',
    lpa: backendDrive.lpaPackage?.toString() || backendDrive.lpa || '',
    cgpa: backendDrive.minimumCgpa?.toString() || backendDrive.cgpa || '',
    lastDate: backendDrive.lastDate || '',
    description: backendDrive.description || '',
    initial: companyName.charAt(0).toUpperCase(),
    color: getColorForCompany(companyName),
  };
}

// Helper function to generate consistent colors for companies
function getColorForCompany(company: string): string {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = ((hash << 5) - hash) + company.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
}

// Helper function to map application status from backend to frontend format
function mapApplicationStatus(status: string): 'Applied' | 'In Review' | 'Shortlisted' | 'Selected' | 'Rejected' {
  const statusMap: Record<string, 'Applied' | 'In Review' | 'Shortlisted' | 'Selected' | 'Rejected'> = {
    'APPLIED': 'Applied',
    'IN_REVIEW': 'In Review',
    'SHORTLISTED': 'Shortlisted',
    'SELECTED': 'Selected',
    'REJECTED': 'Rejected',
  };
  return statusMap[status.toUpperCase()] || 'Applied';
}

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
  driveId: string | number;
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

// Fetch student profile
export async function fetchProfile(regdno: string = '0601289127'): Promise<StudentProfile | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    const studentData = data.data || data || null;
    return studentData ? mapStudentToProfile(studentData) : null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

// Helper function to map backend student data to frontend profile format
function mapStudentToProfile(student: any): StudentProfile {
  return {
    name: student.name || '',
    email: student.email || '',
    phone: student.phno || '',
    location: student.collegeName || 'Not Provided',
    profileInitial: (student.name || '').charAt(0).toUpperCase(),
    degree: student.course || '',
    cgpa: student.cgpa || 'N/A',
    batch: student.admissionYear || student.batchId || '',
    rollNumber: student.regdno || '',
    department: student.branchCode || '',
    score10th: student.score10th || 'N/A',
    score12th: student.score12th || 'N/A',
    skills: student.skills || [],
  };
}

// Fetch student dashboard data (stats, profile, etc.)
export async function fetchDashboard() {
  try {
    console.warn('fetchDashboard is deprecated and no longer supported');
    return null;
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
    const drives = data.data || data || [];
    return Array.isArray(drives) ? drives.map(mapDriveData) : [];
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
    const drive = data.data || data || null;
    return drive ? mapDriveData(drive) : null;
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
    const drives = data.data || data || [];
    return Array.isArray(drives) ? drives.map(mapDriveData) : [];
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
    const drives = data.data || data || [];
    return Array.isArray(drives) ? drives.map(mapDriveData) : [];
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
    const drives = data.data || data || [];
    return Array.isArray(drives) ? drives.map(mapDriveData) : [];
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
    const applications = data.data || data || [];
    
    // Fetch all drives to map LPA values
    const drives = await fetchOpenDrives();
    const driveMap = new Map(drives.map(d => [d.id.toString(), d.lpa]));
    
    return Array.isArray(applications) ? applications.map((app: any) => {
      // Extract LPA from various possible sources
      let lpa = '';
      if (app.lpa && app.lpa !== '') {
        lpa = app.lpa;
      } else if (app.drive?.lpaPackage) {
        lpa = app.drive.lpaPackage.toString();
      } else if (app.drivePackage) {
        lpa = app.drivePackage.toString();
      } else {
        // Try to get LPA from the drives map using driveId
        const driveId = app.driveId || app.drive?.id;
        if (driveId) {
          lpa = driveMap.get(driveId.toString()) || 'N/A';
        } else {
          lpa = 'N/A';
        }
      }
      
      return {
        id: app.id || '',
        driveId: app.driveId || app.drive?.id || '',
        company: app.companyName || app.company || '',
        role: app.role || '',
        appliedOn: app.appliedDate || app.appliedOn || '',
        status: mapApplicationStatus(app.status || 'APPLIED'),
        round: app.round || '',
        lpa: lpa,
      };
    }) : [];
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
    const applications = data.data || data || [];
    
    // Fetch all drives to map LPA values
    const drives = await fetchOpenDrives();
    const driveMap = new Map(drives.map(d => [d.id.toString(), d.lpa]));
    
    return Array.isArray(applications) ? applications.map((app: any) => {
      // Extract LPA from various possible sources
      let lpa = '';
      if (app.lpa && app.lpa !== '') {
        lpa = app.lpa;
      } else if (app.drive?.lpaPackage) {
        lpa = app.drive.lpaPackage.toString();
      } else if (app.drivePackage) {
        lpa = app.drivePackage.toString();
      } else {
        // Try to get LPA from the drives map using driveId
        const driveId = app.driveId || app.drive?.id;
        if (driveId) {
          lpa = driveMap.get(driveId.toString()) || 'N/A';
        } else {
          lpa = 'N/A';
        }
      }
      
      return {
        id: app.id || '',
        driveId: app.driveId || app.drive?.id || '',
        company: app.companyName || app.company || '',
        role: app.role || '',
        appliedOn: app.appliedDate || app.appliedOn || '',
        status: mapApplicationStatus(app.status || status),
        round: app.round || '',
        lpa: lpa,
      };
    }) : [];
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
