'use client';

export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

type Status = 'Applied' | 'In Review' | 'Shortlisted' | 'Selected' | 'Rejected';

const statusStyles: Record<Status, string> = {
  Applied: 'bg-info/15 text-info border-info/30',
  'In Review': 'bg-warning/15 text-warning border-warning/30',
  Shortlisted: 'bg-primary/15 text-primary border-primary/30',
  Selected: 'bg-success/15 text-success border-success/30',
  Rejected: 'bg-destructive/15 text-destructive border-destructive/30',
};

const applications = [
  { id: 1, company: 'TechCorp Solutions', role: 'Software Engineer', appliedOn: '28-02-2026', status: 'Shortlisted' as Status, round: 'Technical Interview', lpa: '8 LPA' },
  { id: 2, company: 'DataFlow Inc', role: 'Data Analyst', appliedOn: '25-02-2026', status: 'In Review' as Status, round: 'Resume Screening', lpa: '6.5 LPA' },
  { id: 3, company: 'CloudNine Systems', role: 'Full Stack Developer', appliedOn: '22-02-2026', status: 'Applied' as Status, round: '—', lpa: '9 LPA' },
  { id: 4, company: 'InnoTech Labs', role: 'ML Engineer', appliedOn: '18-02-2026', status: 'Selected' as Status, round: 'Offer Letter', lpa: '12 LPA' },
  { id: 5, company: 'ByteWave Corp', role: 'Backend Developer', appliedOn: '15-02-2026', status: 'Rejected' as Status, round: 'HR Interview', lpa: '7 LPA' },
];

export default function Applications() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-display font-bold text-foreground">My Applications</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">Track all your placement applications in one place.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Applied', value: applications.length, color: 'text-primary' },
          { label: 'Active', value: applications.filter(a => !['Selected', 'Rejected'].includes(a.status)).length, color: 'text-warning' },
          { label: 'Offers', value: applications.filter(a => a.status === 'Selected').length, color: 'text-success' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs tracking-widest uppercase text-muted-foreground mb-2">{s.label}</p>
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Company', 'Role', 'Package', 'Applied On', 'Current Round', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] tracking-widest uppercase text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors opacity-0 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <td className="px-5 py-4 font-medium text-foreground">{app.company}</td>
                  <td className="px-5 py-4 text-muted-foreground">{app.role}</td>
                  <td className="px-5 py-4 text-foreground font-semibold">{app.lpa}</td>
                  <td className="px-5 py-4 text-muted-foreground">{app.appliedOn}</td>
                  <td className="px-5 py-4 text-muted-foreground">{app.round}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusStyles[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
