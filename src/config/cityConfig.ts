// City-first configuration architecture for SAAMEK environmental monitoring
// Configured primarily for Gwalior, Madhya Pradesh pilot phase

export interface ReferenceStation {
  name: string;
  authority: string;
  aliasKeywords: string[];
}

export interface CityConfig {
  id: string;
  name: string;
  state: string;
  country: string;
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  boundingBox: {
    minLongitude: number;
    minLatitude: number;
    maxLongitude: number;
    maxLatitude: number;
  };
  radiusMeters: number;
  referenceStations: ReferenceStation[];
}

export const GWALIOR_CITY_CONFIG: CityConfig = {
  id: 'gwalior',
  name: 'Gwalior',
  state: 'Madhya Pradesh',
  country: 'India',
  center: {
    latitude: 26.2183,
    longitude: 78.1828,
  },
  zoom: 12,
  // Bounding box: minLon, minLat, maxLon, maxLat covering Gwalior municipal and peri-urban monitoring perimeter
  boundingBox: {
    minLongitude: 78.05,
    minLatitude: 26.10,
    maxLongitude: 78.30,
    maxLatitude: 26.32,
  },
  radiusMeters: 25000,
  referenceStations: [
    {
      name: 'City Center, Gwalior - MPPCB',
      authority: 'Madhya Pradesh Pollution Control Board',
      aliasKeywords: ['city center', 'city centre'],
    },
    {
      name: 'Deen Dayal Nagar (DD Nagar), Gwalior - MPPCB',
      authority: 'Madhya Pradesh Pollution Control Board',
      aliasKeywords: ['deen dayal', 'dd nagar', 'deendayal'],
    },
    {
      name: 'Maharaj Bada, Gwalior - MPPCB',
      authority: 'Madhya Pradesh Pollution Control Board',
      aliasKeywords: ['maharaj bada', 'maharaja bada', 'bada'],
    },
    {
      name: 'Phool Bagh, Gwalior - MPPCB',
      authority: 'Madhya Pradesh Pollution Control Board',
      aliasKeywords: ['phool bagh', 'phoolbagh'],
    },
  ],
};

// Currently active city for Government environmental monitoring
export const ACTIVE_MONITORING_CITY = GWALIOR_CITY_CONFIG;
export const GWALIOR_COORDINATES = GWALIOR_CITY_CONFIG.center;
