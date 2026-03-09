'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { fetchDashboard, StudentProfile } from '@/lib/backend';
import { Mail, Phone, MapPin, GraduationCap, Award, Edit } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Get regdno from localStorage
        const regdno = localStorage.getItem('regdno') || '12345'; // Default for testing
        
        const dashboardData = await fetchDashboard(regdno);
        if (dashboardData && dashboardData.profile) {
          setProfile(dashboardData.profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">My Profile</h1>
          <Button variant="outline" size="sm" className="text-xs">
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Header */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6 h-32 animate-pulse"></div>
        ) : profile ? (
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 mb-6 opacity-0 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-xl md:text-2xl font-display font-bold text-primary shrink-0">
                {profile.profileInitial}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg md:text-xl font-display font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.degree}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 md:gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {profile.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {profile.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.location}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">Failed to load profile</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Info */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Academic Details
            </h3>
            {loading || !profile ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-6 bg-secondary/20 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Current CGPA', value: profile.cgpa },
                  { label: 'Batch', value: profile.batch },
                  { label: 'Roll Number', value: profile.rollNumber },
                  { label: 'Department', value: profile.department },
                  { label: '10th Score', value: profile.score10th },
                  { label: '12th Score', value: profile.score12th },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 opacity-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h3 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
              <Award className="w-4 h-4" /> Skills
            </h3>
            {loading || !profile ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-7 w-16 bg-secondary/20 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground border border-border">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
