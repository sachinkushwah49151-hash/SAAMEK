export type IncidentStatus =
  | 'detected'
  | 'verified'
  | 'investigating'
  | 'response_initiated'
  | 'resolved';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentConfidence = 'low' | 'medium' | 'high';

export interface IncidentEvidenceItem {
  id: number;
  incident_id: number;
  evidence_type: string;
  title: string;
  description: string;
  value_text?: string;
  is_supporting: boolean;
  source: string;
  recorded_at: string;
}

export interface IncidentStatusHistoryItem {
  id: number;
  incident_id: number;
  previous_status?: string | null;
  new_status: IncidentStatus;
  changed_by: string;
  notes?: string;
  changed_at: string;
}

export interface IncidentRecord {
  id: number;
  incident_id: string;
  title: string;
  incident_type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  confidence: IncidentConfidence;
  origin: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  affected_area: string;
  affected_radius_meters: number;
  assigned_officer?: string;
  citizen_report_id?: string;
  is_test_data?: boolean;
  wind_speed?: number;
  wind_direction?: number;
  wind_cardinal?: string;
  potential_impact_area?: string;
  pm25_value?: number;
  pm10_value?: number;
  nearest_station_name?: string;
  detected_at: string;
  created_at: string;
  updated_at: string;
  evidence_items: IncidentEvidenceItem[];
  status_history: IncidentStatusHistoryItem[];
}

export type CitizenReportStatus =
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'converted_to_incident';

export interface CitizenReportRecord {
  id: number;
  report_id: string;
  report_type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string;
  image_url?: string;
  image_data?: string;
  status: CitizenReportStatus;
  citizen_name?: string;
  citizen_contact?: string;
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  converted_incident_id?: string;
  submitted_at: string;
  created_at: string;
}

export interface EnvironmentalAnomalyRecord {
  id: number;
  anomaly_id: string;
  title: string;
  parameter: string;
  baseline_value: number;
  observed_value: number;
  unit: string;
  threshold_ratio: number;
  station_name: string;
  latitude: number;
  longitude: number;
  location_name: string;
  severity: IncidentSeverity;
  status: string;
  is_test_data: boolean;
  explanation: string;
  detected_at: string;
}

export interface DataSourceHealthRecord {
  id: number;
  source_key: string;
  name: string;
  category: string;
  status: 'connected' | 'available' | 'degraded' | 'unavailable';
  endpoint?: string;
  last_ping_at?: string;
  last_success_at?: string;
  records_count: number;
  details?: string;
  updated_at: string;
}

export interface AnalyticsSummaryRecord {
  active_incidents_count: number;
  high_critical_incidents_count: number;
  pending_verification_reports_count: number;
  total_citizen_reports_count: number;
  anomalies_count: number;
  resolved_incidents_count: number;
  data_sources_healthy_count: number;
  total_data_sources_count: number;
  incidents_by_type: Record<string, number>;
  incidents_by_status: Record<string, number>;
  incidents_by_severity: Record<string, number>;
  reports_by_type: Record<string, number>;
  incidents_by_area: Record<string, number>;
}
