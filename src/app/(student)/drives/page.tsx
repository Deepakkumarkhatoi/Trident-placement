'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import DriveCard from '@/src/components/DriveCard';
import { fetchDrives, fetchProfile, fetchEligibleDrives, DriveData } from '@/src/lib/backend';
import { studentApplicationsApi } from '@/src/lib/api/student.applications';
import { Search, Filter } from 'lucide-react';

export default function Drives() {
  const [allDrives, setAllDrives] = useState<DriveData[]>([]);
  const [appliedDriveIds, setAppliedDriveIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'All' | 'On-Campus' | 'Virtual'>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [studentBranch, setStudentBranch] = useState<string>('');

  const loadApplications = async () => {
    try {
      const applications = await studentApplicationsApi.getMyApplications();
      const appliedIds = new Set(applications.map(app => app.driveId.toString()));
      setAppliedDriveIds(appliedIds);
    } catch (error) {
      console.error('Error loading applications:', error);
      // Continue without applications - don't block the page
    }
  };

  useEffect(() => {
    const loadDrives = async () => {
      try {
        setLoading(true);
        const profile = await fetchProfile();
        if (!profile) throw new Error('Failed to load student profile');
        
        const branch = profile.department || '';
        setStudentBranch(branch);
        
        // Try to fetch eligible drives first, fallback to all drives
        let drivesData = await fetchEligibleDrives(profile.rollNumber);
        if (!drivesData || drivesData.length === 0) {
          drivesData = await fetchDrives();
        }
        
        // Filter drives by student's branch
        // If drive has no branches specified, it's open to all
        // If drive has branches, only show if student's branch is in the list
        const filteredDrives = drivesData.filter(drive => {
          if (!drive.branches || drive.branches.length === 0) {
            // No branch restrictions, show to all students
            return true;
          }
          // Show only if student's branch is in the allowed branches
          return drive.branches.some(b => 
            b.toUpperCase() === branch.toUpperCase()
          );
        });
        
        setAllDrives(filteredDrives);

        // Load applications using new API
        await loadApplications();
      } catch (error) {
        console.error('Error loading drives:', error);
        setAllDrives([]);
      } finally {
        setLoading(false);
      }
    };

    loadDrives();
  }, []);

  const handleApplySuccess = (driveId: string) => {
    // Add the drive to applied set
    setAppliedDriveIds(prev => new Set([...prev, driveId]));
    
    // Optionally refresh all applications
    loadApplications();
  };

  const filtered = allDrives.filter((d) => {
    const matchType = filter === 'All' || d.type === filter;
    const matchSearch = d.company.toLowerCase().includes(search.toLowerCase()) || d.role.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold text-foreground">Placement Drives</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        {studentBranch && <span>Showing drives for <span className="font-semibold text-foreground">{studentBranch}</span> • </span>}
        Browse and apply to available placement opportunities.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies or roles..."
            disabled={loading}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'On-Campus', 'Virtual'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1.5" />
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {loading ? 'Loading...' : `${filtered.length} drive${filtered.length !== 1 ? 's' : ''} available for ${studentBranch || 'your branch'}`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-lg h-40 animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d, i) => (
            <DriveCard 
              key={d.id} 
              {...d} 
              delay={i * 100} 
              applied={appliedDriveIds.has(d.id.toString())}
              onApplySuccess={() => handleApplySuccess(d.id.toString())}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No drives found matching your criteria{studentBranch ? ` for ${studentBranch}` : ''}.</p>
      )}
    </DashboardLayout>
  );
}
