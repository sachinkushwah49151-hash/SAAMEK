// Real Client-side Reverse Geocoding Service

export interface ReverseGeocodeResult {
  locality: string;
  city: string;
  state: string;
  country: string;
  formattedAddress: string;
}

/**
 * Reverse geocode latitude and longitude to locality/city/state using BigDataCloud's free client API with fallback to Nominatim
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  try {
    // Primary: BigDataCloud client API (fast, reliable, free for client-side use)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      const locality =
        data.locality ||
        data.principalSubdivision ||
        data.city ||
        'Local Area';
      const city = data.city || data.principalSubdivision || 'City';
      const state = data.principalSubdivision || '';
      const country = data.countryName || 'India';

      const parts = [locality, city !== locality ? city : null, state, country].filter(
        Boolean
      );

      return {
        locality,
        city,
        state,
        country,
        formattedAddress: parts.join(', '),
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode failed, falling back to OSM Nominatim', err);
  }

  try {
    // Fallback: OpenStreetMap Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.locality ||
        addr.village ||
        addr.town ||
        'Local Area';
      const city = addr.city || addr.town || addr.state_district || 'City';
      const state = addr.state || '';
      const country = addr.country || 'India';

      const parts = [locality, city !== locality ? city : null, state, country].filter(
        Boolean
      );

      return {
        locality,
        city,
        state,
        country,
        formattedAddress: parts.join(', ') || data.display_name || `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed', err);
  }

  // Graceful fallback to formatted coordinate representation
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lonDir = longitude >= 0 ? 'E' : 'W';
  const coordString = `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lonDir}`;

  return {
    locality: `Coordinates ${coordString}`,
    city: 'Regional Grid',
    state: '',
    country: 'India',
    formattedAddress: coordString,
  };
}
