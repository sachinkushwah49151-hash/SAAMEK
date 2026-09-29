import type { GovIncident, DataSourceFeed, FusionCase, SignalSourceType } from '../types';

export const INITIAL_GOV_INCIDENTS: GovIncident[] = [
  {
    id: 'INC-2026-0841',
    title: 'Severe Industrial Stack Opacity & Particulate Surge',
    category: 'smoke',
    location: 'Narela Industrial Phase 2, Sector 4',
    district: 'North-West Industrial Zone',
    coordinates: { latitude: 28.8412, longitude: 77.0945 },
    severity: 'Critical',
    priority: 'P1 - Immediate',
    status: 'Investigating',
    detectionSource: 'Continuous Emission Monitoring (CEMS) + Citizen Observation',
    assignedAuthority: 'DPCC Flying Squad #02 & Industrial Enforcement Unit',
    reportedTime: '28 Sep 2026, 08:30 AM',
    description: 'Continuous heavy dark particulate plume emanating from boiler unit exceeding CEMS particulate standard by 340%. Ground enforcement officer dispatched.',
    photoUrl: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80',
    metrics: [
      { label: 'PM2.5 Sensor Spike', value: '382 µg/m³', status: 'critical' },
      { label: 'CEMS Opacity', value: '78% (Std: 20%)', status: 'critical' },
      { label: 'SO₂ Concentration', value: '142 µg/m³', status: 'elevated' },
    ],
    timeline: [
      {
        step: 'Detected',
        status: 'Detected',
        timestamp: '28 Sep 2026, 08:30 AM',
        actor: 'Automated CEMS Sensor Grid',
        notes: 'Telemetry anomaly flag triggered at Sector 4 boiler unit #B-12.',
      },
      {
        step: 'Verified',
        status: 'Verified',
        timestamp: '28 Sep 2026, 09:15 AM',
        actor: 'Zonal Telemetry Officer (HQ)',
        notes: 'Correlated with high-resolution satellite plume vector and citizen report REP-2026-0841.',
      },
      {
        step: 'Investigating',
        status: 'Investigating',
        timestamp: '28 Sep 2026, 10:45 AM',
        actor: 'Inspector V. Sharma (DPCC Flying Squad #02)',
        notes: 'Field team on-site conducting stack emission audit and notice issuance.',
      },
    ],
  },
  {
    id: 'INC-2026-0792',
    title: 'Agricultural Residue Open Burning Thermal Cluster',
    category: 'fire',
    location: 'North-West Farmland Perimeter, Sector 12',
    district: 'Outer Western Rural Corridor',
    coordinates: { latitude: 28.7834, longitude: 76.9821 },
    severity: 'High',
    priority: 'P2 - Urgent',
    status: 'Response Initiated',
    detectionSource: 'NASA FIRMS VIIRS S-NPP Satellite Hotspot Feed',
    assignedAuthority: 'District Agriculture Taskforce & Fire Quick Response Unit',
    reportedTime: '28 Sep 2026, 06:15 AM',
    description: 'Multiple active open-air crop residue burning fires detected via satellite thermal sensor (FRP: 42 MW). Rapid extinguishing squad mobilized to coordinates.',
    photoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    metrics: [
      { label: 'Thermal Radiative Power', value: '42.4 MW', status: 'critical' },
      { label: 'Downwind PM2.5 Spike', value: '240 µg/m³', status: 'elevated' },
      { label: 'Confidence Score', value: '94% (High)', status: 'normal' },
    ],
    timeline: [
      {
        step: 'Detected',
        status: 'Detected',
        timestamp: '28 Sep 2026, 06:15 AM',
        actor: 'NASA FIRMS Satellite Feeds',
        notes: 'Thermal pixel alert identified at lat 28.7834, lon 76.9821.',
      },
      {
        step: 'Verified',
        status: 'Verified',
        timestamp: '28 Sep 2026, 07:00 AM',
        actor: 'Remote Sensing Analyst',
        notes: 'Satellite spectral signature confirmed active open biomass combustion.',
      },
      {
        step: 'Investigating',
        status: 'Investigating',
        timestamp: '28 Sep 2026, 08:30 AM',
        actor: 'District Flying Squad #07',
        notes: 'Tehsildar and enforcement team arrived at farmland cluster.',
      },
      {
        step: 'Response Initiated',
        status: 'Response Initiated',
        timestamp: '28 Sep 2026, 09:45 AM',
        actor: 'Fire Extinguishment Unit',
        notes: 'Tractor-mounted water misting deployed. Chalan issued under Air Act 1981.',
      },
    ],
  },
  {
    id: 'INC-2026-0610',
    title: 'Solid Waste Landfill Perimeter Smouldering & Methane Flare',
    category: 'smoke',
    location: 'Municipal Waste Processing Buffer, Ghazipur Perimeter',
    district: 'East Municipal Corridor',
    coordinates: { latitude: 28.6289, longitude: 77.3298 },
    severity: 'Critical',
    priority: 'P1 - Immediate',
    status: 'Response Initiated',
    detectionSource: 'Citizen Geo-Report + Ambient Station AQ-04 Trigger',
    assignedAuthority: 'Municipal Solid Waste Action Cell & Fire Services Tender',
    reportedTime: '27 Sep 2026, 04:30 PM',
    description: 'Sub-surface smouldering and illegal open waste dumping along landfill perimeter producing thick acrid smoke impacting ring road visibility.',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    metrics: [
      { label: 'Methane (CH4) Sensor', value: '48 ppm', status: 'critical' },
      { label: 'PM10 Local Ambient', value: '412 µg/m³', status: 'critical' },
      { label: 'Visibility Range', value: '450 meters', status: 'elevated' },
    ],
    timeline: [
      {
        step: 'Detected',
        status: 'Detected',
        timestamp: '27 Sep 2026, 04:30 PM',
        actor: 'Citizen Grievance Portal',
        notes: 'Geo-tagged report submitted with photo evidence.',
      },
      {
        step: 'Verified',
        status: 'Verified',
        timestamp: '27 Sep 2026, 05:15 PM',
        actor: 'Command Center Duty Officer',
        notes: 'Cross-verified with Anand Vihar Station #04 particulate spike telemetry.',
      },
      {
        step: 'Investigating',
        status: 'Investigating',
        timestamp: '27 Sep 2026, 06:00 PM',
        actor: 'Zonal Sanitation Inspector',
        notes: 'Smouldering identified in Sector 3 compost buffer area.',
      },
      {
        step: 'Response Initiated',
        status: 'Response Initiated',
        timestamp: '28 Sep 2026, 07:00 AM',
        actor: 'Fire & Waste Management Tender',
        notes: 'Inert soil slope capping and heavy sprinkler misting in progress.',
      },
    ],
  },
  {
    id: 'INC-2026-0524',
    title: 'Severe Dust Suspension from Uncovered Commercial Construction',
    category: 'pollution',
    location: 'Outer Ring Road Expressway Junction, Sector 18',
    district: 'South-West Expressway Corridor',
    coordinates: { latitude: 28.5355, longitude: 77.1215 },
    severity: 'Moderate',
    priority: 'P3 - Standard',
    status: 'Verified',
    detectionSource: 'Zonal Patrol Team + Citizen Observation',
    assignedAuthority: 'Pollution Control Committee Inspection Cell',
    reportedTime: '28 Sep 2026, 11:00 AM',
    description: 'Non-compliance with C&D waste guidelines. Heavy dust suspension without green barriers or continuous anti-smog gun operation.',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=600&q=80',
    metrics: [
      { label: 'PM10 Local Reading', value: '298 µg/m³', status: 'elevated' },
      { label: 'Wind Velocity', value: '18 km/h NW', status: 'normal' },
    ],
    timeline: [
      {
        step: 'Detected',
        status: 'Detected',
        timestamp: '28 Sep 2026, 11:00 AM',
        actor: 'Citizen Mobile Ground Observation',
        notes: 'Report logged with geo-coordinates and photo of active cement mixing.',
      },
      {
        step: 'Verified',
        status: 'Verified',
        timestamp: '28 Sep 2026, 12:30 PM',
        actor: 'Zonal Environmental Engineer',
        notes: 'Construction permit violations confirmed via GIS layer database.',
      },
    ],
  },
  {
    id: 'INC-2026-0318',
    title: 'Biomass Burning at Transport Hub Perimeter Extinguished',
    category: 'fire',
    location: 'Interstate Bus Terminal Perimeter, Anand Vihar',
    district: 'East Administrative District',
    coordinates: { latitude: 28.6476, longitude: 77.3158 },
    severity: 'Moderate',
    priority: 'P2 - Urgent',
    status: 'Resolved',
    detectionSource: 'Anand Vihar CAAQMS Sensor Alert',
    assignedAuthority: 'Zonal Municipal Fire Brigade & Terminal Security',
    reportedTime: '26 Sep 2026, 09:00 PM',
    description: 'Open waste packaging burning near terminal boundary. Extinguished with automated misting and area sanitized.',
    photoUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=600&q=80',
    metrics: [
      { label: 'Current AQI Local', value: '118 (Moderate)', status: 'normal' },
      { label: 'Resolution Duration', value: '3.5 hours', status: 'normal' },
    ],
    timeline: [
      {
        step: 'Detected',
        status: 'Detected',
        timestamp: '26 Sep 2026, 09:00 PM',
        actor: 'Continuous Air Station #04',
        notes: 'CO and PM2.5 spike recorded.',
      },
      {
        step: 'Verified',
        status: 'Verified',
        timestamp: '26 Sep 2026, 09:30 PM',
        actor: 'Terminal Security Officer',
        notes: 'Visual confirmation of open packaging fire.',
      },
      {
        step: 'Investigating',
        status: 'Investigating',
        timestamp: '26 Sep 2026, 10:00 PM',
        actor: 'Field Operations Unit',
        notes: 'Perpetrators identified and penal notice issued.',
      },
      {
        step: 'Response Initiated',
        status: 'Response Initiated',
        timestamp: '26 Sep 2026, 10:30 PM',
        actor: 'Terminal Fire Tender',
        notes: 'Water mist suppression deployed.',
      },
      {
        step: 'Resolved',
        status: 'Resolved',
        timestamp: '27 Sep 2026, 12:30 AM',
        actor: 'Duty Officer (Command Center)',
        notes: 'Site inspection verified cold. Air metrics normalized to baseline.',
      },
    ],
  },
];

export const GOV_DATA_SOURCES: DataSourceFeed[] = [
  {
    id: 'src-1',
    name: 'Meteorological & Atmospheric Telemetry',
    category: 'weather',
    status: 'Operational',
    provider: 'Open-Meteo High-Resolution Model & IMD Radar Feed',
    lastSync: '1 minute ago (Live Stream)',
    latencyMs: 142,
    recordsToday: 18450,
    dataIntegrityPct: 99.8,
    endpoint: 'https://api.open-meteo.com/v1/forecast',
    uptime30d: 99.94,
    notes: 'Continuous 15-min surface temperature, relative humidity, boundary layer pressure, wind vector, and inversion metrics.',
  },
  {
    id: 'src-2',
    name: 'National Ambient Air Quality Station Grid',
    category: 'air_quality',
    status: 'Operational',
    provider: 'CPCB CAAQMS & OpenAQ Public Ambient Grid',
    lastSync: '2 minutes ago',
    latencyMs: 310,
    recordsToday: 42100,
    dataIntegrityPct: 98.6,
    endpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    uptime30d: 99.71,
    notes: 'Continuous automated particulate (PM2.5, PM10), gaseous pollutants (NO2, SO2, CO, O3), and calculated NAQI score feeds.',
  },
  {
    id: 'src-3',
    name: 'Satellite Thermal Anomaly & Fire Hotspots',
    category: 'satellite',
    status: 'Operational',
    provider: 'NASA FIRMS (VIIRS S-NPP / NOAA-20 & MODIS Near-Real-Time)',
    lastSync: '12 minutes ago',
    latencyMs: 540,
    recordsToday: 3280,
    dataIntegrityPct: 99.2,
    endpoint: 'https://firms.modaps.eosdis.nasa.gov/api/area',
    uptime30d: 99.50,
    notes: '375m high-resolution thermal anomaly pixels with Fire Radiative Power (MW) and multi-pass orbital confidence scores.',
  },
  {
    id: 'src-4',
    name: 'Citizen Ground Observation & Evidence Feed',
    category: 'citizen',
    status: 'Operational',
    provider: 'SAAMEK Citizen Redressal & Spatial Geotag Grid',
    lastSync: 'Just now (Continuous Stream)',
    latencyMs: 45,
    recordsToday: 842,
    dataIntegrityPct: 97.4,
    endpoint: 'internal://saamek.gov.in/ground-observations',
    uptime30d: 99.98,
    notes: 'Citizen mobile reports with GPS coordinates, photographic evidence, and category ground-truth verification metadata.',
  },
];

export const GOV_ANALYTICS_TRENDS = {
  dailyAqiHistory: [
    { day: '22 Sep', aqi: 142, pm25: 68, pm10: 122, incidents: 8 },
    { day: '23 Sep', aqi: 156, pm25: 74, pm10: 135, incidents: 11 },
    { day: '24 Sep', aqi: 188, pm25: 92, pm10: 164, incidents: 16 },
    { day: '25 Sep', aqi: 172, pm25: 84, pm10: 150, incidents: 12 },
    { day: '26 Sep', aqi: 195, pm25: 104, pm10: 182, incidents: 19 },
    { day: '27 Sep', aqi: 168, pm25: 82, pm10: 146, incidents: 14 },
    { day: '28 Sep (Today)', aqi: 162, pm25: 78, pm10: 138, incidents: 9 },
  ],
  categoryBreakdown: [
    { category: 'Air Pollution / Particulates', count: 42, percentage: 38, color: 'bg-sky-600' },
    { category: 'Smoke / Industrial Stacks', count: 28, percentage: 25, color: 'bg-slate-700' },
    { category: 'Fire / Open Biomass Burning', count: 21, percentage: 19, color: 'bg-red-600' },
    { category: 'Waste Dumping & Landfill', count: 14, percentage: 13, color: 'bg-amber-600' },
    { category: 'Other Environmental Grievances', count: 6, percentage: 5, color: 'bg-emerald-600' },
  ],
  districtHotspots: [
    { district: 'North-West Industrial Corridor', aqi: 214, openIncidents: 6, riskLevel: 'High' },
    { district: 'East Municipal Waste Corridor', aqi: 198, openIncidents: 4, riskLevel: 'High' },
    { district: 'Outer Western Rural Farmland', aqi: 174, openIncidents: 3, riskLevel: 'Moderate' },
    { district: 'South-West Expressway Corridor', aqi: 152, openIncidents: 2, riskLevel: 'Moderate' },
    { district: 'Central Administrative Area', aqi: 108, openIncidents: 1, riskLevel: 'Low' },
  ],
  responseMetrics: {
    avgVerificationTimeMinutes: 24,
    avgResponseDispatchMinutes: 48,
    resolutionRatePct: 88.4,
    activeFieldTeamsDeployed: 18,
    totalIncidentsHandled30d: 412,
  },
};

const LOCAL_STORAGE_GOV_INCIDENTS_KEY = 'saamek_gov_incidents';

export const getStoredGovIncidents = (): GovIncident[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_GOV_INCIDENTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return INITIAL_GOV_INCIDENTS;
};

export const updateGovIncidentStatus = (
  incidentId: string,
  newStatus: GovIncident['status'],
  note: string,
  actor = 'Duty Enforcement Officer (Command Center)'
): GovIncident[] => {
  const current = getStoredGovIncidents();
  const now = new Date();
  const timestampStr = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  const updated = current.map((inc) => {
    if (inc.id === incidentId) {
      return {
        ...inc,
        status: newStatus,
        timeline: [
          ...inc.timeline,
          {
            step: newStatus,
            status: newStatus,
            timestamp: timestampStr,
            actor,
            notes: note,
          },
        ],
      };
    }
    return inc;
  });

  try {
    localStorage.setItem(LOCAL_STORAGE_GOV_INCIDENTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
};

export interface FusionSourceChannel {
  type: SignalSourceType;
  name: string;
  subTitle: string;
  status: 'Live Ingesting' | 'Active Grid' | 'Orbital Track' | 'Synchronized';
  signalCountToday: number;
  dataLatency: string;
  description: string;
}

export const FUSION_SOURCE_CHANNELS: FusionSourceChannel[] = [
  {
    type: 'citizen',
    name: 'Citizen Reports & Evidence',
    subTitle: 'Mobile Ground Observations',
    status: 'Live Ingesting',
    signalCountToday: 842,
    dataLatency: '< 45 ms',
    description: 'Geolocated citizen field observations, photos, and descriptive smell/plume reports.',
  },
  {
    type: 'weather',
    name: 'Meteorological Telemetry',
    subTitle: 'Open-Meteo & IMD Radar Feed',
    status: 'Synchronized',
    signalCountToday: 18450,
    dataLatency: '142 ms',
    description: 'Boundary layer inversion height, wind speed/direction vectors, temperature, and atmospheric pressure.',
  },
  {
    type: 'air_quality',
    name: 'Ambient Air Quality Grid',
    subTitle: 'CPCB CAAQMS & OpenAQ Network',
    status: 'Active Grid',
    signalCountToday: 42100,
    dataLatency: '310 ms',
    description: 'Continuous continuous multi-pollutant telemetry (PM2.5, PM10, SO2, NO2, CO, Ozone, NAQI).',
  },
  {
    type: 'satellite',
    name: 'Satellite Orbital Imagery',
    subTitle: 'Sentinel-5P TROPOMI & MODIS Optical',
    status: 'Orbital Track',
    signalCountToday: 3280,
    dataLatency: '12 mins',
    description: 'Multi-spectral aerosol optical depth (AOD), columnar NO2/SO2 densities, and optical plume tracking.',
  },
  {
    type: 'thermal_fire',
    name: 'NASA FIRMS Thermal Sensors',
    subTitle: 'VIIRS S-NPP / NOAA-20 375m Radiometer',
    status: 'Active Grid',
    signalCountToday: 142,
    dataLatency: '15 mins',
    description: 'Sub-kilometer thermal radiance anomalies, Fire Radiative Power (MW), and pixel detection confidence.',
  },
  {
    type: 'hotspot',
    name: 'Historical Zonal Hotspots',
    subTitle: 'Spatial Vulnerability Baseline',
    status: 'Synchronized',
    signalCountToday: 5,
    dataLatency: 'Realtime',
    description: 'Industrial cluster zoning, continuous emission compliance profiles, and past violation density maps.',
  },
];

export const MOCK_FUSION_CASES: FusionCase[] = [
  {
    id: 'FUS-2026-001',
    caseCode: 'SYNTH-NR-0841',
    title: 'Industrial Stack Flare & Thermal Inversion Trapping',
    location: 'Narela Industrial Phase 2, Sector 4',
    district: 'North-West Industrial Zone',
    category: 'smoke',
    synthesisTime: '28 Sep 2026, 11:20 AM (5 mins ago)',
    overallConfidencePct: 94,
    incidentRefId: 'INC-2026-0841',
    signals: [
      {
        id: 'sig-1',
        sourceType: 'citizen',
        sourceName: 'Citizen Ground Observation',
        title: 'Thick Black Plume & Sulfuric Smell',
        rawValue: '4 Verified Reports (Photos geotagged)',
        confidence: 96,
        timestamp: '10:45 AM',
        status: 'corroborated',
        details: 'Geotagged photos show dense particulate stack plume from Boiler Unit #B-12 drifting south-east.',
      },
      {
        id: 'sig-2',
        sourceType: 'weather',
        sourceName: 'Atmospheric Telemetry',
        title: 'Low Boundary Inversion Layer',
        rawValue: 'Wind: 5.2 km/h (Calm) | Inversion: 640m',
        confidence: 99,
        timestamp: '11:00 AM',
        status: 'corroborated',
        details: 'Low ventilation coefficient and inversion cap prevent vertical dissipation of industrial gases.',
      },
      {
        id: 'sig-3',
        sourceType: 'air_quality',
        sourceName: 'CAAQMS Continuous Station #02',
        title: 'PM2.5 & SO₂ Extreme Spike',
        rawValue: 'PM2.5: 382 µg/m³ | SO₂: 142 µg/m³',
        confidence: 98,
        timestamp: '11:15 AM',
        status: 'corroborated',
        details: 'Particulate concentrations spiked 340% over standard within a 1.2 km radius downwind.',
      },
      {
        id: 'sig-4',
        sourceType: 'satellite',
        sourceName: 'Sentinel-5P TROPOMI Pass',
        title: 'Localized Columnar NO₂/SO₂ Peak',
        rawValue: 'Column Density: 18.4 × 10¹⁵ molec/cm²',
        confidence: 88,
        timestamp: '10:30 AM',
        status: 'corroborated',
        details: 'Orbital spectrograph confirmed localized sulfurous gas concentration directly over Sector 4.',
      },
      {
        id: 'sig-5',
        sourceType: 'hotspot',
        sourceName: 'Zonal Compliance Registry',
        title: 'High Historical Stack Violation Zone',
        rawValue: '8 CEMS opacity exceedances in Q3',
        confidence: 92,
        timestamp: 'Realtime',
        status: 'corroborated',
        details: 'Boiler unit has recurring history of wet scrubber bypass during peak morning operations.',
      },
    ],
    fusedAssessment: {
      summary:
        'Multiple independent telemetry streams corroborate a severe industrial stack emission event trapped under a calm atmospheric inversion layer, generating hazardous localized ground-level particulate concentrations.',
      probableCause:
        'Suspected operational bypass of stack desulfurization / wet scrubber unit during boiler operation in Sector 4 manufacturing facility.',
      dispersionDynamics:
        'Sub-6 km/h calm winds and low mixing depth (640m) create a concentrated chemical plume bubble impacting adjacent residential sectors within a 2.4 km radius.',
      affectedRadiusKm: 2.4,
      riskTier: 'P1 - Critical Alert',
      recommendedActions: [
        'Dispatch Flying Squad #02 with portable stack opacity sensor & FLIR thermal camera for immediate physical audit.',
        'Issue provisional stop-work notice to unit #B-12 under Section 31A of the Air (Prevention and Control of Pollution) Act.',
        'Trigger automated air quality health advisory for residential clusters within downwind 2.5 km zone.',
      ],
      uncertainties: [
        'Precise stack discharge rate requires physical flanged measurement on-site.',
        'No direct night-vision imagery prior to 06:00 AM pass.',
      ],
    },
  },
  {
    id: 'FUS-2026-002',
    caseCode: 'SYNTH-AG-0792',
    title: 'Agricultural Residue Open Burning & Downwind Atmospheric Transport',
    location: 'North-West Farmland Perimeter, Sector 12',
    district: 'Outer Western Rural Corridor',
    category: 'fire',
    synthesisTime: '28 Sep 2026, 09:40 AM (1.5 hrs ago)',
    overallConfidencePct: 91,
    incidentRefId: 'INC-2026-0792',
    signals: [
      {
        id: 'sig-201',
        sourceType: 'thermal_fire',
        sourceName: 'NASA FIRMS VIIRS S-NPP',
        title: 'Thermal Anomaly Pixel Cluster',
        rawValue: 'FRP: 42.4 MW | Sat Confidence: 94%',
        confidence: 94,
        timestamp: '06:15 AM',
        status: 'corroborated',
        details: 'Satellite infrared sensor detected high-intensity combustion pixel (42.4 MW thermal power).',
      },
      {
        id: 'sig-202',
        sourceType: 'citizen',
        sourceName: 'Citizen Ground Observation',
        title: 'Visible Field Fire Horizon',
        rawValue: '2 Citizen Reports (Photo submitted)',
        confidence: 89,
        timestamp: '07:30 AM',
        status: 'corroborated',
        details: 'Residents reported active stubble fires along farmland boundary with visible smoke columns.',
      },
      {
        id: 'sig-203',
        sourceType: 'weather',
        sourceName: 'Regional Wind Vector',
        title: 'North-Westerly Transport Vector',
        rawValue: 'Wind: 12.4 km/h NW | Temp: 28.5°C',
        confidence: 98,
        timestamp: '08:00 AM',
        status: 'corroborated',
        details: 'Consistent north-westerly wind is transporting combustion particulates toward Delhi western bypass.',
      },
      {
        id: 'sig-204',
        sourceType: 'air_quality',
        sourceName: 'Downwind Continuous Station #07',
        title: 'Downwind PM10 & PM2.5 Surge',
        rawValue: 'PM10: 280 µg/m³ | PM2.5: 194 µg/m³',
        confidence: 92,
        timestamp: '09:00 AM',
        status: 'corroborated',
        details: 'Downwind monitoring station registered a 180% surge in coarse and fine carbonaceous particulates.',
      },
      {
        id: 'sig-205',
        sourceType: 'satellite',
        sourceName: 'MODIS Near-Real-Time Optical',
        title: 'Aerosol Plume Optical Thickness',
        rawValue: 'AOD: 0.82 (Elevated Smoke)',
        confidence: 86,
        timestamp: '08:45 AM',
        status: 'corroborated',
        details: 'Optical depth signature matches characteristic organic carbon & biomass burning spectrum.',
      },
    ],
    fusedAssessment: {
      summary:
        'Satellite thermal radiometry combined with downwind air sensor surges and citizen field sightings confirms extensive open-air crop residue burning with active downwind smoke transport.',
      probableCause:
        'Paddy residue combustion across contiguous farm holdings following combine harvesting operations.',
      dispersionDynamics:
        'North-westerly winds (12.4 km/h) are carrying the particulate plume along the western arterial corridor, impacting air quality up to 6.8 km downwind.',
      affectedRadiusKm: 6.8,
      riskTier: 'P2 - High Precaution',
      recommendedActions: [
        'Mobilize District Agriculture Taskforce and mobile misting tractors to GPS coordinates.',
        'Issue spot challans under Section 19(5) of the Air Act 1981.',
        'Coordinate with rural Tehsildar for custom hiring center baler deployment.',
      ],
      uncertainties: [
        'Exact acreage burned pending high-resolution drone ortho-mosaic survey.',
      ],
    },
  },
  {
    id: 'FUS-2026-003',
    caseCode: 'SYNTH-LF-0524',
    title: 'Solid Waste Smoldering & Gaseous VOC Accumulation',
    location: 'Ghazipur East Municipal Landfill, Zone 3',
    district: 'East Municipal Waste Corridor',
    category: 'smoke',
    synthesisTime: '28 Sep 2026, 08:15 AM (3 hrs ago)',
    overallConfidencePct: 87,
    incidentRefId: 'INC-2026-0524',
    signals: [
      {
        id: 'sig-301',
        sourceType: 'citizen',
        sourceName: 'Citizen Grievance Feed',
        title: 'Pungent Waste Odor & Smoldering Haze',
        rawValue: '9 Citizen Complaints within 45 mins',
        confidence: 93,
        timestamp: '06:45 AM',
        status: 'corroborated',
        details: 'Multiple adjoining housing societies reported intense burning plastic smell and morning haze.',
      },
      {
        id: 'sig-302',
        sourceType: 'air_quality',
        sourceName: 'Boundary Gas Monitor #03',
        title: 'CO & Methane (CH₄) Elevation',
        rawValue: 'CO: 4.8 mg/m³ | CH₄: 32 ppm',
        confidence: 91,
        timestamp: '07:15 AM',
        status: 'corroborated',
        details: 'Sub-surface gas sensors indicate active pyrolysis without open flaming.',
      },
      {
        id: 'sig-303',
        sourceType: 'weather',
        sourceName: 'Nocturnal Stagnation Metric',
        title: 'High Humidity & Wind Stagnation',
        rawValue: 'Wind: 3.8 km/h | Humidity: 88%',
        confidence: 97,
        timestamp: '07:30 AM',
        status: 'corroborated',
        details: 'Stagnant high-humidity conditions prevent vertical dispersion, causing ground-level smog trapping.',
      },
      {
        id: 'sig-304',
        sourceType: 'hotspot',
        sourceName: 'Legacy Waste Thermal Profile',
        title: 'High Risk Pyrolysis Terrace',
        rawValue: 'Terrace #3 Slope Vulnerability',
        confidence: 88,
        timestamp: 'Realtime',
        status: 'corroborated',
        details: 'Decomposing organic waste generating sub-surface heat exceeding 65°C.',
      },
    ],
    fusedAssessment: {
      summary:
        'Gaseous sensor elevations and concentrated citizen odor reports indicate sub-surface anaerobic landfill methane smoldering trapped under high-humidity stagnation.',
      probableCause:
        'Spontaneous combustion of sub-surface methane pockets igniting buried combustible plastics along Terrace #3.',
      dispersionDynamics:
        'Ground-level inversion traps volatile organic compounds (VOCs) and CO within a 1.8 km residential radius.',
      affectedRadiusKm: 1.8,
      riskTier: 'P2 - High Precaution',
      recommendedActions: [
        'Deploy municipal fire tenders for inert soil blanketing and water-spray cooling on Terrace #3 slope.',
        'Activate landfill gas extraction flaring wells to depressurize methane pockets.',
        'Conduct ambient VOC monitoring along residential boundary wall.',
      ],
      uncertainties: [
        'Depth of sub-surface smoldering pocket requires thermal probe insertion.',
      ],
    },
  },
];

