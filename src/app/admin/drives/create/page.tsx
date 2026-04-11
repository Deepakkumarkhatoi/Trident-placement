'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle2, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { adminDrivesApi } from '@/src/lib/api/admin.drives';

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN: Create Drive Form - Job Description Creation
// No sample data. Form only. Backend handles everything.
// ════════════════════════════════════════════════════════════════════════════════

interface DriveJD {
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

const BRANCHES = ['CSE', 'ETC', 'EEE', 'CIVIL', 'MECH', 'VLSI', 'IT', 'MBA', 'MCA'];
const COURSES = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'B.Sc'];

const DEFAULT_JD: DriveJD = {
  companyName: '', role: '', driveType: 'ON_CAMPUS', lpa: '',
  lastDateApplication: '', jobLocation: '', employmentType: 'Full Time',
  workMode: 'On-Site', vacancies: '', serviceAgreement: '', joining: '',
  cgpaCutoff: '', backlogsAllowed: false, allowedBranches: [],
  allowedCourses: [], batch: '', aboutCompany: '', website: '',
  headquarters: '', roleOverview: '', requiredSkills: [''],
  keyResponsibilities: [''], whyJoin: [''],
  selectionProcess: [{ description: '', eliminationRound: true }],
};

export default function CreateDrivePage() {
  const router = useRouter();
  const [jd, setJd] = useState<DriveJD>(DEFAULT_JD);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DriveJD, string>>>({});

  const set = <K extends keyof DriveJD>(key: K, value: DriveJD[K]) =>
    setJd(prev => ({ ...prev, [key]: value }));

  const addItem = (key: 'requiredSkills' | 'keyResponsibilities' | 'whyJoin') =>
    set(key, [...(jd[key] as string[]), '']);

  const updateItem = (key: 'requiredSkills' | 'keyResponsibilities' | 'whyJoin', i: number, val: string) => {
    const arr = [...(jd[key] as string[])];
    arr[i] = val;
    set(key, arr);
  };

  const removeItem = (key: 'requiredSkills' | 'keyResponsibilities' | 'whyJoin', i: number) => {
    const arr = (jd[key] as string[]).filter((_, idx) => idx !== i);
    set(key, arr.length ? arr : ['']);
  };

  const addStep = () =>
    set('selectionProcess', [...jd.selectionProcess, { description: '', eliminationRound: false }]);

  const updateStep = (i: number, field: 'description' | 'eliminationRound', val: string | boolean) => {
    const steps = jd.selectionProcess.map((s, idx) => idx === i ? { ...s, [field]: val } : s);
    set('selectionProcess', steps);
  };

  const removeStep = (i: number) => {
    const steps = jd.selectionProcess.filter((_, idx) => idx !== i);
    set('selectionProcess', steps.length ? steps : [{ description: '', eliminationRound: true }]);
  };

  const toggleBranch = (b: string) => {
    const curr = jd.allowedBranches;
    set('allowedBranches', curr.includes(b) ? curr.filter(x => x !== b) : [...curr, b]);
  };

  const toggleCourse = (c: string) => {
    const curr = jd.allowedCourses;
    set('allowedCourses', curr.includes(c) ? curr.filter(x => x !== c) : [...curr, c]);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!jd.companyName) e.companyName = 'Required';
    if (!jd.role) e.role = 'Required';
    if (!jd.lpa) e.lpa = 'Required';
    if (!jd.lastDateApplication) e.lastDateApplication = 'Required';
    if (!jd.aboutCompany) e.aboutCompany = 'Required';
    if (!jd.roleOverview) e.roleOverview = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    setError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      // Step 1: Create the Drive
      const driveResponse = await adminDrivesApi.create({
        companyName: jd.companyName,
        role: jd.role,
        driveType: jd.driveType,
        lpaPackage: parseFloat(jd.lpa),
        minimumCgpa: parseFloat(jd.cgpaCutoff),
        lastDate: jd.lastDateApplication,
        description: jd.aboutCompany,
      });

      // Step 2: Create the JD for the drive
      await adminDrivesApi.upsertJD(driveResponse.id, jd);

      setSuccess(true);
      setTimeout(() => router.push('/admin/drives'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create drive');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, key: keyof DriveJD, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">
        {label} {['companyName','role','lpa','lastDateApplication','aboutCompany','roleOverview'].includes(key) && (
          <span className="text-red-500">*</span>
        )}
      </label>
      <input
        type={type}
        value={jd[key] as string}
        onChange={e => set(key, e.target.value as any)}
        placeholder={placeholder}
        disabled={saving}
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-background text-foreground
          outline-none ${errors[key] ? 'border-red-500' : 'border-border'}`}
      />
      {errors[key] && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" />{errors[key]}</p>}
    </div>
  );

  const select = (label: string, key: keyof DriveJD, options: string[]) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">{label}</label>
      <select value={jd[key] as string} onChange={e => set(key, e.target.value as any)} disabled={saving}
        className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground outline-none">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const textarea = (label: string, key: keyof DriveJD, rows = 3, placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">
        {label} {['aboutCompany','roleOverview'].includes(key) && <span className="text-red-500">*</span>}
      </label>
      <textarea rows={rows} value={jd[key] as string} onChange={e => set(key, e.target.value as any)} 
        placeholder={placeholder} disabled={saving}
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-background text-foreground
          outline-none resize-none ${errors[key] ? 'border-red-500' : 'border-border'}`} />
      {errors[key] && <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" />{errors[key]}</p>}
    </div>
  );

  const arrayField = (label: string, key: 'requiredSkills' | 'keyResponsibilities' | 'whyJoin', placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase">{label}</label>
      <div className="space-y-2">
        {(jd[key] as string[]).map((val, i) => (
          <div key={i} className="flex gap-2">
            <input type="text" value={val} onChange={e => updateItem(key, i, e.target.value)} 
              placeholder={placeholder} disabled={saving}
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm bg-background text-foreground outline-none" />
            <button onClick={() => removeItem(key, i)} disabled={saving}
              className="p-2 rounded-lg border border-border hover:border-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => addItem(key)} disabled={saving}
          className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Drive</h1>
            <p className="text-sm text-muted-foreground mt-1">Post a job opening for students</p>
          </div>
          <Link href="/admin/drives">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">Drive created successfully!</p>
          </div>
        )}

        <div className="space-y-6 bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Company Name', 'companyName', 'text', 'e.g. Infosys')}
              {field('Role', 'role', 'text', 'e.g. Software Engineer')}
              {field('Package (LPA)', 'lpa', 'text', 'e.g. 12.5')}
              {field('Last Date', 'lastDateApplication', 'date')}
              {select('Drive Type', 'driveType', ['ON_CAMPUS', 'OFF_CAMPUS', 'POOL'])}
              {field('Website', 'website', 'url', 'https://company.com')}
              {field('Headquarters', 'headquarters', 'text', 'e.g. Bengaluru')}
              {field('Job Location', 'jobLocation', 'text', 'e.g. Bangalore')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {select('Employment', 'employmentType', ['Full Time', 'Internship', 'Part Time', 'Contract'])}
              {select('Work Mode', 'workMode', ['On-Site', 'Remote', 'Hybrid'])}
              {field('Vacancies', 'vacancies', 'text', 'e.g. 50')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('Bond', 'serviceAgreement', 'text', 'e.g. 2 Years')}
              {field('Joining', 'joining', 'text', 'e.g. After final semester')}
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-foreground">Eligibility</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('CGPA Cutoff', 'cgpaCutoff', 'text', 'e.g. 6.0')}
              {field('Batch', 'batch', 'text', 'e.g. 2026')}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase">Backlogs</label>
              <div className="flex gap-4">
                {[true, false].map(val => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="backlogs" checked={jd.backlogsAllowed === val}
                      onChange={() => set('backlogsAllowed', val)} disabled={saving} />
                    <span className="text-sm">{val ? 'Yes' : 'No'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase">Branches</label>
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map(b => (
                  <button key={b} onClick={() => toggleBranch(b)} disabled={saving}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                      ${jd.allowedBranches.includes(b) ? 'bg-blue-500/15 text-blue-600 border-blue-300'
                        : 'bg-background text-muted-foreground border-border'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase">Courses</label>
              <div className="flex flex-wrap gap-2">
                {COURSES.map(c => (
                  <button key={c} onClick={() => toggleCourse(c)} disabled={saving}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                      ${jd.allowedCourses.includes(c) ? 'bg-blue-500/15 text-blue-600 border-blue-300'
                        : 'bg-background text-muted-foreground border-border'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-foreground">Description</h2>
            {textarea('About Company', 'aboutCompany', 4, 'Company background...')}
            {textarea('Role Overview', 'roleOverview', 4, 'What students will do...')}
            {arrayField('Required Skills', 'requiredSkills', 'e.g. Java, SQL')}
            {arrayField('Responsibilities', 'keyResponsibilities', 'e.g. Develop APIs')}
            {arrayField('Why Join', 'whyJoin', 'e.g. Great career growth')}
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-foreground">Selection Process</h2>
            <div className="space-y-3">
              {jd.selectionProcess.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-2">
                    {i + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input type="text" value={step.description}
                      onChange={e => updateStep(i, 'description', e.target.value)}
                      placeholder="e.g. Online Aptitude Test" disabled={saving}
                      className="px-3 py-2 rounded-lg border border-border text-sm bg-background outline-none" />
                    <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-border">
                      <input type="checkbox" checked={step.eliminationRound}
                        onChange={e => updateStep(i, 'eliminationRound', e.target.checked)} disabled={saving} />
                      <span className="text-sm">Elimination</span>
                    </label>
                  </div>
                  <button onClick={() => removeStep(i)} disabled={saving} className="p-2 rounded-lg border border-border hover:border-red-500 mt-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button onClick={addStep} disabled={saving} className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/admin/drives">
            <button className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted">
              Cancel
            </button>
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium
              hover:bg-blue-700 disabled:opacity-60 transition-colors">
            <Save className="w-4 h-4" />
            {saving ? 'Creating...' : 'Create & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
