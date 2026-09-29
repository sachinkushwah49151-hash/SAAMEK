export type UserRole = 'government' | 'citizen';

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'ta';

export type CitizenTab = 'home' | 'report' | 'my-reports' | 'map';

export type GovTab =
  | 'command-center'
  | 'incidents'
  | 'reports'
  | 'environmental-map'
  | 'analytics'
  | 'data-sources';

export type IssueCategory =
  | 'pollution'
  | 'smoke'
  | 'fire'
  | 'dust'
  | 'flood'
  | 'haze'
  | 'weather';

export type ReportStatus =
  | 'Submitted'
  | 'Under Verification'
  | 'Verified'
  | 'Investigating'
  | 'Response Initiated'
  | 'Resolved';

export interface CitizenReport {
  id: string;
  category: IssueCategory;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description: string;
  photoUrl?: string;
  submittedDate: string;
  status: ReportStatus;
  statusHistory: {
    status: ReportStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface EnvironmentalAlert {
  id: string;
  title: string;
  category: 'pollution' | 'fire' | 'incident' | 'warning';
  severity: 'Critical' | 'Warning' | 'Advisory';
  area: string;
  date: string;
  description: string;
  guidelines?: string;
}

export interface MapMarkerItem {
  id: string;
  type: 'station' | 'incident' | 'hotspot' | 'fire' | 'report';
  name: string;
  location: string;
  coordinates: { x: number; y: number; lat?: number; lng?: number };
  aqi?: number;
  status?: string;
  details: string;
  timestamp: string;
}

export interface LoginFormState {
  identifier: string;
  password: string;
}

export type SignalSourceType =
  | 'citizen'
  | 'weather'
  | 'air_quality'
  | 'satellite'
  | 'thermal_fire'
  | 'hotspot';

export interface FusionSignalNode {
  id: string;
  sourceType: SignalSourceType;
  sourceName: string;
  title: string;
  rawValue: string;
  confidence: number;
  timestamp: string;
  status: 'active' | 'corroborated' | 'anomalous';
  details: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface FusionCase {
  id: string;
  caseCode: string;
  title: string;
  location: string;
  district: string;
  category: IssueCategory;
  synthesisTime: string;
  overallConfidencePct: number;
  incidentRefId?: string;
  signals: FusionSignalNode[];
  fusedAssessment: {
    summary: string;
    probableCause: string;
    dispersionDynamics: string;
    affectedRadiusKm: number;
    riskTier: 'P1 - Critical Alert' | 'P2 - High Precaution' | 'P3 - Moderate Advisory';
    recommendedActions: string[];
    uncertainties: string[];
  };
}

export type GovIncidentStatus =
  | 'Detected'
  | 'Verified'
  | 'Investigating'
  | 'Response Initiated'
  | 'Resolved';

export type GovSeverity = 'Critical' | 'High' | 'Moderate' | 'Low';
export type GovPriority = 'P1 - Immediate' | 'P2 - Urgent' | 'P3 - Standard';

export interface GovIncident {
  id: string;
  title: string;
  category: IssueCategory;
  location: string;
  district: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  severity: GovSeverity;
  priority: GovPriority;
  status: GovIncidentStatus;
  detectionSource: string;
  assignedAuthority: string;
  reportedTime: string;
  description: string;
  photoUrl?: string;
  metrics?: { label: string; value: string; status: 'normal' | 'elevated' | 'critical' }[];
  timeline: {
    step: string;
    status: GovIncidentStatus;
    timestamp: string;
    actor: string;
    notes: string;
  }[];
}

export interface DataSourceFeed {
  id: string;
  name: string;
  category: 'weather' | 'air_quality' | 'satellite' | 'citizen';
  status: 'Operational' | 'Delayed' | 'Unavailable';
  provider: string;
  lastSync: string;
  latencyMs: number;
  recordsToday: number;
  dataIntegrityPct: number;
  endpoint: string;
  uptime30d: number;
  notes: string;
}

export * from './environmental';
export * from './incident';
