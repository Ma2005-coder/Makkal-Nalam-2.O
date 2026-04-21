
export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string;
  link?: string;
  category: string;
}

export interface Reminder {
  id: string;
  schemeName: string;
  documentsNeeded: string[];
  savedDate: string;
  notes?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD', // Acts as Overview
  DOCUMENTS = 'DOCUMENTS',
  APPLICATIONS = 'APPLICATIONS',
  SAVED = 'SAVED',
  EXPLORER = 'EXPLORER',
  ELISIBILITY_BOT = 'ELIGIBILITY_BOT',
  ELIGIBILITY_CHECKER = 'ELIGIBILITY_CHECKER',
  VOICE_ASSISTANT = 'VOICE_ASSISTANT',
  GRIEVANCE = 'GRIEVANCE',
  LOCATIONS = 'LOCATIONS',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  CIVIC_REPORT = 'CIVIC_REPORT',
  PROFILE = 'PROFILE',
  HEALTH_MODULE = 'HEALTH_MODULE'
}

export interface RoadmapStepItem {
  label: string;
  description?: string;
  authority?: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Application {
  id: string;
  schemeName: string;
  status: 'applied' | 'vao' | 'ri' | 'tahsildar' | 'disbursed' | 'custom';
  dateApplied: string;
  refNumber: string;
  roadmap?: RoadmapStepItem[];
  currentStepIndex?: number;
  dbtStatus?: {
    stage: 'treasury' | 'district' | 'bank';
    amount?: number;
    transactionId?: string;
    date?: string;
  };
}

export interface ProactiveAlert {
  id: string;
  type: 'scheme' | 'document' | 'info';
  title: string;
  description: string;
  schemeId?: string;
  cta?: string;
}

export interface Address {
  doorNo: string;
  village: string;
  taluk: string;
  district: string;
  pincode: string;
}

export interface UserEligibilityData {
  name: string;
  phone: string;
  email?: string;
  dob: string;
  aadhar: string;
  smartCard: string;
  income: number;
  incomePeriod: 'monthly' | 'annual';
  familyAssets: string;
  location: string;
  category: string;
  gender: string;
  age: number;
  occupation: string;
  education: string;
  employmentStatus: string;
  familySize: number;
  isDisabled: boolean;
  povertyStatus?: 'BPL' | 'APL' | 'AAY' | 'Unknown';
  permAddress: Address;
  tempAddress: Address;
  isSameAddress: boolean;
  documents: {
    aadharCard?: string;
    rationCard?: string;
    incomeCert?: string;
    eduCert?: string;
    communityCert?: string;
  };
  activeApplications?: Application[];
  civicIssues?: CivicIssue[];
  grievances?: CivicIssue[];
  reminders?: Reminder[];
}

export interface CivicIssue {
  id: string;
  type: string;
  location: string;
  description: string;
  status: 'logged' | 'assigned' | 'in-progress' | 'resolved';
  dateReported: string;
  refNumber: string;
  roadmap: RoadmapStepItem[];
  photo?: string;
  analysis?: {
    analysis: string;
    severity: string;
    details: string;
    safetyRisk: string;
    identifier?: string;
  };
}

export type Language = 'en' | 'ta';
