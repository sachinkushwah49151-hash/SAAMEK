import type { CitizenReport, EnvironmentalAlert, MapMarkerItem } from '../types';

export const INITIAL_REPORTS: CitizenReport[] = [
  {
    id: 'REP-2026-0841',
    category: 'smoke',
    location: 'East Industrial Zone, Sector 4',
    description: 'Heavy black smoke continuously emanating from an industrial boiler exceeding visible opacity limits.',
    submittedDate: '27 Sep 2026, 10:15 AM',
    status: 'Investigating',
    statusHistory: [
      { status: 'Submitted', timestamp: '27 Sep 2026, 10:15 AM', note: 'Ground-level observation logged by citizen' },
      { status: 'Under Verification', timestamp: '27 Sep 2026, 11:30 AM', note: 'Geospatial correlation with CEMS sensor feed initiated' },
      { status: 'Verified', timestamp: '27 Sep 2026, 01:00 PM', note: 'Emission anomaly verified by zonal team' },
      { status: 'Investigating', timestamp: '27 Sep 2026, 03:45 PM', note: 'Field inspection officer dispatched to Sector 4 boiler unit' },
    ],
  },
  {
    id: 'REP-2026-0792',
    category: 'flood',
    location: 'Green Park Ring Road, Drain Junction',
    description: 'Severe waterlogging at the drain junction causing stagnant water accumulation on public road and surrounding area.',
    submittedDate: '26 Sep 2026, 03:40 PM',
    status: 'Response Initiated',
    statusHistory: [
      { status: 'Submitted', timestamp: '26 Sep 2026, 03:40 PM', note: 'Ground-level observation logged by citizen' },
      { status: 'Under Verification', timestamp: '26 Sep 2026, 04:15 PM', note: 'Assigned to Stormwater Drain Management Division' },
      { status: 'Verified', timestamp: '26 Sep 2026, 05:00 PM', note: 'Site location verified via coordinates' },
      { status: 'Investigating', timestamp: '27 Sep 2026, 09:30 AM', note: 'Drainage inspection team ground inspection conducted' },
      { status: 'Response Initiated', timestamp: '28 Sep 2026, 08:00 AM', note: 'Drain desilting machinery mobilized' },
    ],
  },
  {
    id: 'REP-2026-0610',
    category: 'fire',
    location: 'North-West Farmland Perimeter, Sector 12',
    description: 'Open biomass and agricultural residue burning observed near agricultural boundary.',
    submittedDate: '24 Sep 2026, 09:20 AM',
    status: 'Resolved',
    statusHistory: [
      { status: 'Submitted', timestamp: '24 Sep 2026, 09:20 AM', note: 'Ground-level observation logged by citizen' },
      { status: 'Under Verification', timestamp: '24 Sep 2026, 10:00 AM', note: 'Correlated with satellite thermal sensor anomaly' },
      { status: 'Verified', timestamp: '24 Sep 2026, 11:30 AM', note: 'Open fire incident confirmed' },
      { status: 'Investigating', timestamp: '24 Sep 2026, 02:00 PM', note: 'Rapid response unit deployed to farmland sector' },
      { status: 'Response Initiated', timestamp: '25 Sep 2026, 10:00 AM', note: 'Fire doused and agricultural notice issued' },
      { status: 'Resolved', timestamp: '26 Sep 2026, 04:00 PM', note: 'Thermal surveillance confirmed extinguishment; site closed' },
    ],
  },
];

export const MOCK_ALERTS: EnvironmentalAlert[] = [
  {
    id: 'ALT-101',
    category: 'pollution',
    severity: 'Warning',
    title: 'Elevated Particulate Level in Regional Airshed',
    area: 'National Capital Region & Adjoining Districts',
    date: '28 Sep 2026, 08:00 AM',
    description: 'PM2.5 concentrations elevated due to low wind speeds and atmospheric inversion. Sensitive groups should limit prolonged outdoor exertion.',
    guidelines: 'Wear protective masks outdoors; keep windows closed during early morning hours.',
  },
  {
    id: 'ALT-102',
    category: 'fire',
    severity: 'Critical',
    title: 'Agricultural Biomass Thermal Anomaly Detected',
    area: 'Northern Agricultural Belt',
    date: '28 Sep 2026, 06:30 AM',
    description: 'Multiple active open-air crop residue burning hotspots identified via satellite thermal sensors. Enforcement flying squads deployed.',
    guidelines: 'Report any open fire sighting immediately through the Report Issue portal.',
  },
  {
    id: 'ALT-103',
    category: 'warning',
    severity: 'Advisory',
    title: 'Dust Suspension & High Ambient Heat Advisory',
    area: 'Western Basin & Urban Corridors',
    date: '27 Sep 2026, 02:00 PM',
    description: 'Dry surface winds gusting up to 25 km/h expected to cause moderate localized dust suspension during afternoon hours.',
    guidelines: 'Ensure adequate hydration and cover eyes while commuting on two-wheelers.',
  },
  {
    id: 'ALT-104',
    category: 'incident',
    severity: 'Warning',
    title: 'Industrial Corridor Air Quality Monitoring Protocol',
    area: 'Central Industrial Estate Zone',
    date: '26 Sep 2026, 11:15 AM',
    description: 'Continuous emission monitoring stations (CEMS) triggered alert for SO2/NOx spike at two manufacturing clusters.',
    guidelines: 'Inspection teams are on-site; automated air mitigation sprinklers activated.',
  },
];

export const MOCK_MAP_MARKERS: MapMarkerItem[] = [
  {
    id: 'MAP-1',
    type: 'station',
    name: 'Anand Vihar AQ Station',
    location: 'East Corridor (Station #04)',
    coordinates: { x: 38, y: 35 },
    aqi: 184,
    status: 'Moderate / Poor',
    details: 'PM2.5: 92 µg/m³, PM10: 168 µg/m³, NO2: 44 µg/m³',
    timestamp: 'Live Reading • 28 Sep 18:30 IST',
  },
  {
    id: 'MAP-2',
    type: 'station',
    name: 'Central Secretariat Station',
    location: 'Central Administrative Zone',
    coordinates: { x: 48, y: 46 },
    aqi: 112,
    status: 'Moderate',
    details: 'PM2.5: 56 µg/m³, PM10: 104 µg/m³, O3: 38 µg/m³',
    timestamp: 'Live Reading • 28 Sep 18:30 IST',
  },
  {
    id: 'MAP-3',
    type: 'station',
    name: 'Lodhi Road Observatory',
    location: 'South District (Station #12)',
    coordinates: { x: 54, y: 56 },
    aqi: 88,
    status: 'Satisfactory',
    details: 'PM2.5: 38 µg/m³, PM10: 74 µg/m³, CO: 0.8 mg/m³',
    timestamp: 'Live Reading • 28 Sep 18:30 IST',
  },
  {
    id: 'MAP-4',
    type: 'hotspot',
    name: 'Industrial Heavy Traffic Junction',
    location: 'Outer Bypass Ring',
    coordinates: { x: 26, y: 62 },
    status: 'Active Hotspot',
    details: 'High localized vehicular density causing elevated VOC and PM2.5 levels.',
    timestamp: 'Surveillance Alert • 28 Sep 17:00 IST',
  },
  {
    id: 'MAP-5',
    type: 'fire',
    name: 'Satellite Thermal Anomaly #F-412',
    location: 'North-West Agricultural Border',
    coordinates: { x: 68, y: 22 },
    status: 'Critical Fire Detection',
    details: 'Estimated thermal radiative power: 32 MW. Dispatched to local district magistrate.',
    timestamp: 'Satellite Sensor Alert • 28 Sep 06:30 IST',
  },
  {
    id: 'MAP-6',
    type: 'incident',
    name: 'Solid Waste Combustion Incident',
    location: 'Municipal Yard Perimeter',
    coordinates: { x: 74, y: 68 },
    status: 'Active Incident',
    details: 'Smoke emission reported from landfill periphery; fire tender en route.',
    timestamp: 'Field Report • 28 Sep 14:15 IST',
  },
  {
    id: 'MAP-7',
    type: 'report',
    name: 'Citizen Report: Industrial Boiler Smoke',
    location: 'East Industrial Zone, Sector 4',
    coordinates: { x: 36, y: 40 },
    status: 'Investigating',
    details: 'Report ID: REP-2026-0841 • Officer inspecting site',
    timestamp: 'Citizen Submitted • 27 Sep 10:15 AM',
  },
];

const LOCAL_STORAGE_REPORTS_KEY = 'saamek_citizen_reports';

export const getStoredReports = (): CitizenReport[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback to initial
  }
  return INITIAL_REPORTS;
};

export const saveNewReport = (report: Omit<CitizenReport, 'id' | 'submittedDate' | 'status' | 'statusHistory'>): CitizenReport => {
  const existing = getStoredReports();
  const idNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const timestampStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  const newReport: CitizenReport = {
    ...report,
    id: `REP-2026-${idNum}`,
    submittedDate: timestampStr,
    status: 'Submitted',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: timestampStr,
        note: 'Ground-level observation logged by citizen on portal',
      },
    ],
  };

  const updated = [newReport, ...existing];
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return newReport;
};
