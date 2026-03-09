export type DriveMode = 'On-Campus' | 'Virtual';

export interface DriveListItem {
  id: string;
  company: string;
  role: string;
  type: DriveMode;
  lpa: string;
  cgpa: string;
  lastDate: string;
  description: string;
  initial: string;
  color: string;
}

export interface CompanyAddress {
  label: string;
  address: string;
}

export interface SelectionStep {
  step: number;
  title: string;
  description: string;
  roundType?: 'Elimination' | 'Optional Elimination' | 'Final';
}

export interface JobDescription {
  id: string;
  company: string;
  recruiter?: string;
  mode: string; // e.g. "Online/Offline Mode"
  headquarters?: string;
  offices?: CompanyAddress[];
  website?: string;
  about?: string;
  tagline?: string;
  culture?: string;
  leadership?: string;
  roleTitle: string;
  employmentType: string;
  payroll: string;
  roleOverview: string;
  requiredSkills: string[];
  keyResponsibilities: string[];
  whyJoin: string[];
  numberOfVacancies: string;
  jobLocation: string;
  ctc: string;
  educationalQualification: string[];
  batchYear: string;
  cutOffCriteria: string;
  gender: string;
  serviceAgreement?: string;
  joining?: string;
  advisory?: string;
  selectionProcess: SelectionStep[];
  registrationLink?: string;
  lastDateApplication: string;
  importantDates?: { label: string; date: string }[];
}
