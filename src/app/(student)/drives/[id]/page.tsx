'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Award,
  Zap,
  BookOpen,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { adminDrivesApi } from '@/src/lib/api/admin.drives';
import { applyToDrive, fetchApplications, fetchProfile } from '@/src/lib/backend';

// ═══════════════════════════════════════════════════════════════════════════════
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━ SHARED TYPES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ═══════════════════════════════════════════════════════════════════════════════

export interface DriveJD {
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

// Parse dates in multiple formats
function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  // Try direct parsing first
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  
  // Try DD-MM-YY format (e.g., "21-04-26")
  const dmy = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dmy) {
    const [_, day, month, year] = dmy;
    const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try DD/MM/YYYY format (e.g., "21/04/2026")
  const dmySlash = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (dmySlash) {
    const [_, day, month, year] = dmySlash;
    const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
    date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try YYYY-MM-DD format (ISO)
  const iso = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    date = new Date(iso[0]);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
}

function formatDate(date: Date | null): string {
  if (!date) return '—';
  try {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return '—';
  }
}

// Transform backend response to match frontend interface
function normalizeJDResponse(data: any): DriveJD {
  console.debug('Raw backend response:', data);
  
  const normalized: DriveJD = {
    companyName: data.companyName || '',
    role: data.role || '',
    driveType: data.driveType || 'ON_CAMPUS',
    lpa: data.lpa || data.lpaPackage?.toString() || '',
    lastDateApplication: data.lastDateApplication || data.lastDate || '',
    jobLocation: data.jobLocation || '',
    employmentType: data.employmentType || 'Full Time',
    workMode: data.workMode || 'On-Site',
    vacancies: data.vacancies?.toString() || '',
    serviceAgreement: data.serviceAgreement || '',
    joining: data.joining || '',
    cgpaCutoff: data.cgpaCutoff?.toString() || '',
    backlogsAllowed: data.backlogsAllowed ?? false,
    allowedBranches: Array.isArray(data.allowedBranches) ? data.allowedBranches : [],
    allowedCourses: Array.isArray(data.allowedCourses) ? data.allowedCourses : [],
    batch: data.batch?.toString() || '',
    aboutCompany: data.aboutCompany || '',
    website: data.website || '',
    headquarters: data.headquarters || '',
    roleOverview: data.roleOverview || '',
    requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills : [],
    keyResponsibilities: Array.isArray(data.keyResponsibilities) ? data.keyResponsibilities : [],
    whyJoin: Array.isArray(data.whyJoin) ? data.whyJoin : [],
    selectionProcess: Array.isArray(data.selectionProcess) ? data.selectionProcess : [],
  };
  
  console.debug('Normalized JD:', normalized);
  return normalized;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ━━━━━━━━━━━━━━━━━━━━━ SHARED SUB-COMPONENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ═══════════════════════════════════════════════════════════════════════════════

function SectionCard({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function QuickStat({ icon, label, value }: {
  icon: React.ReactNode; label: string; value: string
}) {
  return (
    <div className="p-3 md:p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-xs md:text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right text-sm">{value || '—'}</span>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════════════════
// ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ STUDENT SECTION START ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT: Display component for viewing job descriptions
// Features: Beautiful card layouts, eligibility display, apply functionality

function StudentJDView({ jd, onBack, driveId, alreadyApplied = false, onApplySuccess }: { jd: DriveJD; onBack?: () => void; driveId?: string | number; alreadyApplied?: boolean; onApplySuccess?: () => void }) {
  const { data: session } = useSession();
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(alreadyApplied);
  const [hasApplied, setHasApplied] = useState(alreadyApplied);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [eligibilityErrorReason, setEligibilityErrorReason] = useState<string | null>(null);

  const handleApply = async () => {
    if (!session?.user) {
      setApplyError('Please sign in to apply');
      return;
    }

    if (!driveId) {
      setApplyError('Drive ID not found');
      return;
    }

    let studentId = (session.user as any).regdno;
    
    // Fallback: try to extract from email
    if (!studentId && session.user.email) {
      studentId = session.user.email.split('@')[0];
    }
    
    if (!studentId) {
      setApplyError('Student ID could not be determined. Please contact support.');
      return;
    }

    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(false);

    try {
      const result = await applyToDrive(studentId, driveId.toString());
      if (result) {
        setApplySuccess(true);
        setHasApplied(true);
        if (onApplySuccess) {
          onApplySuccess();
        }
        setTimeout(() => setApplySuccess(false), 3000);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred while submitting your application';
      setApplyError(errorMsg);
      
      // Check if it's an eligibility error and extract reason
      const isEligibilityError = errorMsg.toLowerCase().includes('not eligible') || 
                                 errorMsg.toLowerCase().includes('eligibility') ||
                                 errorMsg.toLowerCase().includes('required') ||
                                 errorMsg.toLowerCase().includes('qualification') ||
                                 errorMsg.toLowerCase().includes('branch') ||
                                 errorMsg.toLowerCase().includes('cgpa') ||
                                 errorMsg.toLowerCase().includes('batch') ||
                                 errorMsg.toLowerCase().includes('backlog');
      
      if (isEligibilityError) {
        setEligibilityErrorReason(errorMsg);
        setShowErrorModal(true);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const extractBriefReason = (errorMsg: string): string => {
    if (errorMsg.toLowerCase().includes('branch')) {
      return 'Your branch does not match the eligible branches for this drive';
    } else if (errorMsg.toLowerCase().includes('cgpa')) {
      return 'Your CGPA does not meet the minimum requirement';
    } else if (errorMsg.toLowerCase().includes('batch') || errorMsg.toLowerCase().includes('year')) {
      return 'Your batch/year is not eligible for this drive';
    } else if (errorMsg.toLowerCase().includes('backlog')) {
      return 'You have active backlogs and this drive does not allow them';
    } else if (errorMsg.toLowerCase().includes('course')) {
      return 'Your course is not eligible for this drive';
    }
    return 'You do not meet the eligibility criteria for this drive';
  };

  const driveTypeColor = {
    ON_CAMPUS: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    OFF_CAMPUS: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
    POOL: 'bg-violet-500/15 text-violet-500 border-violet-500/30',
  }[jd.driveType];

  const initial = jd.companyName?.[0]?.toUpperCase() || '?';
  const colors = ['#0e7490','#0f766e','#7c3aed','#b45309','#be185d','#1d4ed8'];
  const color = colors[jd.companyName.charCodeAt(0) % colors.length];

  return (
    <div className="space-y-6">
      {/* Eligibility Error Modal */}
      {showErrorModal && eligibilityErrorReason && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-card to-card/95 border border-border/60 rounded-2xl shadow-2xl max-w-md w-full p-0 space-y-0 animate-in fade-in duration-300 overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 border-b border-border/40 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100/80 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Not Eligible</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">You don't meet the requirements</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Reason box with icon */}
              <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-200/40 dark:border-red-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 010 10a6 6 0 0113.476-1.11A6.002 6.002 0 1120 10a6 6 0 01-6.523 6.89M5 10a1 1 0 11-2 0 1 1 0 012 0zm9 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    {extractBriefReason(eligibilityErrorReason)}
                  </p>
                </div>
              </div>

              {/* Details section */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What you can do</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Check other drives that match your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Contact your TPO for details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">•</span>
                    <span>Check your profile to improve eligibility</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer with button */}
            <div className="bg-muted/30 border-t border-border/40 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setEligibilityErrorReason(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                  text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg 
                  hover:scale-105 active:scale-95"
              >
                OK, Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT: Back button (preview mode) */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground
            hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Form
        </button>
      )}

      {/* STUDENT: Header with company logo and drive info */}
      <div className="overflow-hidden bg-card border border-border rounded-xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center
                text-xl font-bold text-white shrink-0 shadow-lg"
              style={{ backgroundColor: color }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  {jd.companyName || 'Company Name'}
                </h1>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${driveTypeColor}`}>
                  {jd.driveType.replace('_', '-')}
                </span>
                {jd.workMode && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border
                    bg-muted/50 text-muted-foreground border-border">
                    {jd.workMode}
                  </span>
                )}
              </div>
              <p className="text-base md:text-lg text-foreground/80 font-medium">
                {jd.role || 'Role'}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                {jd.jobLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {jd.jobLocation}
                  </span>
                )}
                {jd.employmentType && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> {jd.employmentType}
                  </span>
                )}
                {jd.headquarters && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {jd.headquarters}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT: Quick statistics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border divide-x divide-border">
          <QuickStat 
            icon={<IndianRupee className="w-4 h-4" />} 
            label="Package" 
            value={jd.lpa ? `₹${jd.lpa} LPA` : '—'} 
          />
          <QuickStat
            icon={<GraduationCap className="w-4 h-4" />}
            label="Min CGPA"
            value={!jd.cgpaCutoff || jd.cgpaCutoff === '0' ? 'No Cutoff' : `${jd.cgpaCutoff}+`}
          />
          <QuickStat
            icon={<Calendar className="w-4 h-4" />}
            label="Last Date"
            value={formatDate(parseDate(jd.lastDateApplication))}
          />
          <QuickStat icon={<Users className="w-4 h-4" />} label="Vacancies" value={jd.vacancies || '—'} />
        </div>
      </div>

      {/* STUDENT: Main content grid (left column + right sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* STUDENT: Left column - detailed job information */}
        <div className="lg:col-span-2 space-y-5">

          {/* STUDENT: About Company */}
          {jd.aboutCompany && (
            <SectionCard title="About the Company" icon={<Building2 className="w-4 h-4" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">{jd.aboutCompany}</p>
              {jd.website && (
                <a
                  href={jd.website.startsWith('http') ? jd.website : `https://${jd.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                >
                  <Globe className="w-3.5 h-3.5" /> Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </SectionCard>
          )}

          {/* STUDENT: Role Overview */}
          {jd.roleOverview && (
            <SectionCard title="Role Overview" icon={<Briefcase className="w-4 h-4" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">{jd.roleOverview}</p>
            </SectionCard>
          )}

          {/* STUDENT: Required Skills */}
          {jd.requiredSkills?.filter(Boolean).length > 0 && (
            <SectionCard title="Required Skills" icon={<Zap className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {jd.requiredSkills.filter(Boolean).map((skill, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary
                    border border-primary/20 rounded-lg px-3 py-1.5 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* STUDENT: Key Responsibilities */}
          {jd.keyResponsibilities?.filter(Boolean).length > 0 && (
            <SectionCard title="Key Responsibilities" icon={<ChevronRight className="w-4 h-4" />}>
              <ul className="space-y-2">
                {jd.keyResponsibilities.filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* STUDENT: Why Join Us */}
          {jd.whyJoin?.filter(Boolean).length > 0 && (
            <SectionCard
              title={`Why Join ${jd.companyName?.split(' ')[0] || 'Us'}?`}
              icon={<Award className="w-4 h-4" />}
            >
              <ul className="space-y-2">
                {jd.whyJoin.filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {/* STUDENT: Selection Process */}
          {jd.selectionProcess?.filter(s => s.description).length > 0 && (
            <SectionCard title="Selection Process" icon={<Clock className="w-4 h-4" />}>
              <div className="relative">
                {jd.selectionProcess.filter(s => s.description).map((step, i, arr) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center
                        text-xs font-bold shrink-0
                        ${step.eliminationRound
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'}`}>
                        {i + 1}
                      </div>
                      {i < arr.length - 1 && <div className="w-0.5 h-8 bg-border" />}
                    </div>
                    <div className="pb-4 pt-1">
                      <p className="text-sm font-medium text-foreground">{step.description}</p>
                      {step.eliminationRound && (
                        <span className="text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
                          Elimination Round
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* STUDENT: Right sidebar - apply card and eligibility */}
        <div className="space-y-4">

          {/* STUDENT: Apply Card */}
          <div className="bg-card border border-primary/20 rounded-xl p-5 space-y-4 sticky top-24">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{jd.lpa || '—'} lpa</p>
              <p className="text-xs text-muted-foreground">Cost to Company</p>
            </div>
            <hr className="border-border" />
            <div className="space-y-2">
              <InfoRow label="Employment" value={jd.employmentType || 'Full Time'} />
              <InfoRow label="Work Mode"  value={jd.workMode || '—'} />
              <InfoRow label="Location"   value={jd.jobLocation || 'Not Specified'} />
              {jd.serviceAgreement && <InfoRow label="Bond" value={jd.serviceAgreement} />}
              {jd.joining && <InfoRow label="Joining" value={jd.joining} />}
            </div>
            <hr className="border-border" />
            <button
              onClick={handleApply}
              disabled={isApplying || applySuccess || hasApplied}
              className={`flex w-full items-center justify-center gap-2
                font-semibold rounded-lg py-3 transition-colors text-sm
                ${hasApplied
                  ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                  : applySuccess 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : showErrorModal
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-black disabled:bg-cyan-300 disabled:opacity-70'
                  : applyError && !showErrorModal
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-black disabled:bg-cyan-300 disabled:opacity-70'}`}
            >
              {hasApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Already Applied
                </>
              ) : isApplying ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : applySuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Applied Successfully!
                </>
              ) : applyError ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Error
                </>
              ) : (
                <>
                  Apply Now <ExternalLink className="w-4 h-4" />
                </>
              )}
            </button>
            {jd.lastDateApplication && (
              <p className="text-[11px] text-center text-amber-500 font-medium">
                ⏰ Deadline: {formatDate(parseDate(jd.lastDateApplication))}
              </p>
            )}
            {applyError && !showErrorModal && (
              <p className="text-[11px] text-center text-destructive font-medium bg-destructive/10 p-2 rounded">
                {applyError}
              </p>
            )}
          </div>

          {/* STUDENT: Eligibility Criteria Card */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Eligibility Criteria
            </h3>

            {jd.allowedCourses?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                  Qualification
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jd.allowedCourses.map((c, i) => (
                    <span key={i} className="text-xs bg-muted/50 text-foreground/80
                      border border-border rounded px-2 py-0.5 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />{c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jd.allowedBranches?.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                  Eligible Branches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jd.allowedBranches.map((b, i) => (
                    <span key={i} className="text-xs bg-primary/10 text-primary
                      border border-primary/20 rounded px-2 py-0.5">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {jd.batch && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Batch</p>
                <p className="text-xs text-foreground">{jd.batch}</p>
              </div>
            )}

            {jd.cgpaCutoff && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">CGPA Cutoff</p>
                <p className="text-xs text-foreground font-semibold">{jd.cgpaCutoff}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                Active Backlogs
              </p>
              <p className="text-xs flex items-center gap-1">
                {jd.backlogsAllowed ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Allowed</span></>
                ) : (
                  <><XCircle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-destructive">Not Allowed</span></>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ PAGE COMPONENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT: Default page component for viewing job descriptions
// Usage: /drives/[id] - Students view job details and apply here
// Data comes from backend (created by admins via /admin/drives/create)

interface DriveDetailPageProps {
  params: { id: string };
}

export default function DriveDetailPage({ params }: DriveDetailPageProps) {
  const { data: session } = useSession();
  const [jd, setJd] = useState<DriveJD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [appliedDrives, setAppliedDrives] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJD = async () => {
      try {
        // Get student regdno from session
        let regdno = (session?.user as any)?.regdno;
        
        // Fallback: extract from email
        if (!regdno && session?.user?.email) {
          regdno = session.user.email.split('@')[0];
        }

        if (!regdno) {
          throw new Error('Student ID not found. Please log in again.');
        }

        // Fetch student profile and applications in parallel
        const [profile, applications] = await Promise.all([
          fetchProfile(),
          fetchApplications(regdno),
        ]);

        // Track which drives the student has applied to
        const appliedIds = new Set(applications.map(app => app.driveId?.toString() || ''));
        setAppliedDrives(appliedIds);

        // Check if already applied to this drive
        const isApplied = appliedIds.has(params.id);
        setAlreadyApplied(isApplied);

        // Try to get eligibility-checked JD from student endpoint
        let response: any = await adminDrivesApi.getJDForStudent(params.id, regdno);
        
        // If no response or incomplete data, fallback to full admin JD endpoint (without eligibility check)
        if (!response || (!response.lpa && !response.lpaPackage && !response.lastDateApplication && !response.lastDate)) {
          console.warn('Student endpoint returned incomplete data, fetching admin JD...');
          response = await adminDrivesApi.getJD(params.id);
        }
        
        if (!response) {
          throw new Error('Failed to load job description');
        }
        
        // Normalize the response to handle different field names from backend
        const normalizedJD = normalizeJDResponse(response);
        setJd(normalizedJD);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load job description';
        console.error('Error fetching JD:', errorMsg);
        setError(errorMsg);
        
        // Try to extract specific eligibility reason from error
        if (errorMsg.toLowerCase().includes('branch') || errorMsg.toLowerCase().includes('not eligible for this branch')) {
          setEligibilityReason('Your branch does not match the eligible branches for this drive');
        } else if (errorMsg.toLowerCase().includes('cgpa')) {
          setEligibilityReason('Your CGPA does not meet the minimum requirement');
        } else if (errorMsg.toLowerCase().includes('batch') || errorMsg.toLowerCase().includes('year')) {
          setEligibilityReason('Your batch/year is not eligible for this drive');
        } else if (errorMsg.toLowerCase().includes('backlog')) {
          setEligibilityReason('You have active backlogs and this drive does not allow them');
        } else if (errorMsg.toLowerCase().includes('eligible') || errorMsg.toLowerCase().includes('not allow')) {
          setEligibilityReason('You do not meet the eligibility criteria for this drive');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if session is ready
    if (session) {
      fetchJD();
    }
  }, [params.id, session]);

  const handleApplySuccess = async () => {
    setAlreadyApplied(true);
    const newApplied = new Set(appliedDrives);
    newApplied.add(params.id);
    setAppliedDrives(newApplied);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-muted-foreground">Loading job description...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !jd) {
    const isIneligible = error?.toLowerCase().includes('not eligible') || 
                         error?.toLowerCase().includes('eligibility') ||
                         error?.toLowerCase().includes('required') ||
                         error?.toLowerCase().includes('qualification') ||
                         error?.toLowerCase().includes('branch') ||
                         error?.toLowerCase().includes('cgpa') ||
                         error?.toLowerCase().includes('batch') ||
                         error?.toLowerCase().includes('backlog');

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-6">
          <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
            <div className="flex justify-center">
              {isIneligible ? (
                <XCircle className="w-12 h-12 text-amber-500" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isIneligible ? 'Not Eligible' : 'Unable to Load'}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {eligibilityReason || error || 'Job description not found'}
              </p>
            </div>
            
            {isIneligible && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-left mt-4">
                <p className="text-sm text-amber-600 font-medium mb-3">Why are you not eligible?</p>
                <ul className="text-xs text-amber-600/80 space-y-2 list-disc list-inside">
                  {eligibilityReason ? (
                    <li>{eligibilityReason}</li>
                  ) : (
                    <>
                      <li>Check if your branch matches the eligible branches</li>
                      <li>Verify your CGPA meets the minimum cutoff</li>
                      <li>Confirm your batch/year is eligible</li>
                      <li>Check if active backlogs are allowed</li>
                    </>
                  )}
                </ul>
                <p className="text-xs text-amber-600/70 mt-3">
                  💡 Tip: Visit the Drives page to see which drives you are eligible for, then check their eligibility criteria.
                </p>
              </div>
            )}
          </div>
          <div className="text-center">
            <a href="/drives" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to All Drives
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <a href="/drives" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to All Drives
          </a>
        </div>
        <StudentJDView jd={jd} driveId={params.id} alreadyApplied={alreadyApplied} onApplySuccess={handleApplySuccess} />
      </div>
    </div>
  );
}

