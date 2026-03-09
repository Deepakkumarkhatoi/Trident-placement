'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { getJobDescription } from '@/data/drives';
import { drivesList } from '@/data/drives';
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
  AlertTriangle,
  ExternalLink,
  Share2,
  Bookmark,
  ChevronRight,
} from 'lucide-react';



function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 md:p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-xs md:text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
          {icon} {title}
        </h3>
      </div>
      <div className="p-4 pt-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground text-sm shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right text-sm">{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DriveDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';

  // Get JD data
  const jd = id ? getJobDescription(id) : undefined;

  const driveItem = drivesList.find((d) => d.id === id);

  if (!jd) notFound();


  const drive = {
    id: jd.id,
    company: jd.company,
    role: jd.roleTitle,
    type: driveItem?.type ?? 'On-Campus',
    lpa: driveItem?.lpa ?? jd.ctc,
    cgpa: driveItem?.cgpa ?? 'N/A',
    lastDate: driveItem?.lastDate ?? jd.lastDateApplication,
    initial: driveItem?.initial ?? jd.company[0],
    color: driveItem?.color ?? 'hsl(210, 80%, 50%)',
    // Detail fields
    headquarters: jd.headquarters,
    regionalOffices: jd.offices?.map((o) => `${o.label}: ${o.address}`),
    website: jd.website,
    aboutCompany: jd.about,
    whyJoin: jd.whyJoin,
    employmentType: jd.employmentType,
    payroll: jd.payroll,
    roleOverview: jd.roleOverview,
    requiredSkills: jd.requiredSkills,
    keyResponsibilities: jd.keyResponsibilities,
    vacancies: jd.numberOfVacancies,
    jobLocation: jd.jobLocation,
    ctc: jd.ctc,
    educationalQualification: jd.educationalQualification,
    batch: jd.batchYear,
    cutOff: jd.cutOffCriteria,
    backlogsAllowed: jd.cutOffCriteria?.toLowerCase().includes('not allowed') ? false : false,
    serviceAgreement: jd.serviceAgreement,
    joining: jd.joining,
    selectionProcess: jd.selectionProcess.map((s) => ({
      step: `Step ${s.step}`,
      description: s.title + (s.description ? ` — ${s.description}` : ''),
      eliminationRound: s.description?.toLowerCase().includes('elimination') ?? false,
    })),
    registrationLink: jd.registrationLink,
    lastDateApplication: jd.lastDateApplication
  };

  return (
    <DashboardLayout>
      {/* Back nav */}
      <Link
        href="/drives"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Drives
      </Link>

      {/* ── Header Card ── */}
      <div className="mb-6 overflow-hidden bg-card border border-border rounded-xl">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Company initial avatar */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg"
              style={{ backgroundColor: drive.color }}
            >
              {drive.initial}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{drive.company}</h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    drive.type === 'On-Campus'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  }`}
                >
                  {drive.type}
                </span>
              </div>
              <p className="text-base md:text-lg text-foreground/80 font-medium">{drive.role}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                {drive.jobLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {drive.jobLocation}
                  </span>
                )}
                {drive.employmentType && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" /> {drive.employmentType}
                  </span>
                )}
                {/* {drive.ctc && (
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" /> {drive.ctc}
                  </span>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border divide-x divide-border">
          <QuickStat
            icon={<IndianRupee className="w-4 h-4" />}
            label="Package"
            value={drive.ctc || drive.lpa}
          />
          <QuickStat
            icon={<GraduationCap className="w-4 h-4" />}
            label="Min CGPA"
            value={drive.cgpa === 'N/A' || drive.cgpa === 'None' ? 'No Cutoff' : drive.cgpa}
          />
          <QuickStat
            icon={<Calendar className="w-4 h-4" />}
            label="Last Date"
            value={drive.lastDateApplication || drive.lastDate}
          />
          <QuickStat
            icon={<Users className="w-4 h-4" />}
            label="Vacancies"
            value={drive.vacancies || 'Not Specified'}
          />
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* About Company */}
          {drive.aboutCompany && (
            <Section title="About the Company" icon={<Building2 className="w-4 h-4" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">{drive.aboutCompany}</p>
              {drive.headquarters && (
                <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-foreground/80">HQ: </span>
                    {drive.headquarters}
                  </span>
                </p>
              )}
              {drive.regionalOffices && drive.regionalOffices.length > 0 && (
                <div className="mt-1.5 space-y-0.5 pl-5">
                  {drive.regionalOffices.map((o, i) => (
                    <p key={i} className="text-xs text-muted-foreground">{o}</p>
                  ))}
                </div>
              )}
              {drive.website && (
                <a
                  href={drive.website.startsWith('http') ? drive.website : `https://${drive.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  <Globe className="w-3.5 h-3.5" /> Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </Section>
          )}

          {/* Role Overview */}
          {drive.roleOverview && (
            <Section title="Role Overview" icon={<Briefcase className="w-4 h-4" />}>
              <p className="text-sm text-muted-foreground leading-relaxed">{drive.roleOverview}</p>
            </Section>
          )}

          {/* Required Skills */}
          {drive.requiredSkills && drive.requiredSkills.length > 0 && (
            <Section title="Required Skills" icon={<CheckCircle2 className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {drive.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-1.5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Key Responsibilities */}
          {drive.keyResponsibilities && drive.keyResponsibilities.length > 0 && (
            <Section title="Key Responsibilities" icon={<ChevronRight className="w-4 h-4" />}>
              <ul className="space-y-2">
                {drive.keyResponsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Why Join */}
          {drive.whyJoin && drive.whyJoin.length > 0 && (
            <Section
              title={`Why Join ${drive.company.split(' ')[0]}?`}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              <ul className="space-y-2">
                {drive.whyJoin.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Selection Process */}
          {drive.selectionProcess && drive.selectionProcess.length > 0 && (
            <Section title="Selection Process" icon={<Clock className="w-4 h-4" />}>
              <div className="relative">
                {drive.selectionProcess.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          step.eliminationRound
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < drive.selectionProcess.length - 1 && (
                        <div className="w-0.5 h-8 bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-foreground">{step.description}</p>
                      {step.eliminationRound && (
                        <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                          Elimination Round
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}  
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">

          {/* Apply Card */}
          <div className="bg-card border border-primary/20 rounded-xl p-4 md:p-5 space-y-4 sticky top-24">
            {/* CTC */}
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{drive.ctc || drive.lpa}</p>
              <p className="text-xs text-muted-foreground">Cost to Company</p>
            </div>

            <hr className="border-border" />

            {/* Info rows */}
            <div className="space-y-3">
              <InfoRow label="Employment" value={drive.employmentType || 'Full Time'} />
              {drive.payroll && <InfoRow label="Payroll" value={drive.payroll} />}
              <InfoRow label="Location" value={drive.jobLocation || 'Not Specified'} />
              {drive.serviceAgreement && <InfoRow label="Bond" value={drive.serviceAgreement} />}
              {drive.joining && <InfoRow label="Joining" value={drive.joining} />}
            </div>

            <hr className="border-border" />

            {/* Apply button */}
            {drive.registrationLink ? (
              <a
                href={drive.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-lg py-3 transition-colors"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button className="flex w-full items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-lg py-3 transition-colors">
                Apply Now
              </button>
            )}

            {drive.lastDateApplication && (
              <p className="text-[11px] text-center text-amber-400 font-medium">
                ⏰ Deadline: {drive.lastDateApplication}
              </p>
            )}
          </div>

          {/* Eligibility Card */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Eligibility Criteria</h3>

            {drive.educationalQualification && drive.educationalQualification.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                  Qualification
                </p>
                <div className="space-y-1">
                  {drive.educationalQualification.map((q, i) => (
                    <p key={i} className="text-xs text-foreground flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" /> {q}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {drive.batch && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Batch</p>
                <p className="text-xs text-foreground">{drive.batch}</p>
              </div>
            )}

            {drive.cutOff && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                  CGPA Cutoff
                </p>
                <p className="text-xs text-foreground">{drive.cutOff}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                Active Backlogs
              </p>
              <p className="text-xs flex items-center gap-1">
                {drive.backlogsAllowed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Allowed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-destructive">Not Allowed</span>
                  </>
                )}
              </p>
            </div>

            {/* Important dates */}
            {jd.importantDates && jd.importantDates.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                  Important Dates
                </p>
                <div className="space-y-1">
                  {jd.importantDates.map((d, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.label}</span>
                      <span className="text-foreground font-medium">{d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}