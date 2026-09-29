// Service to derive Environmental Hotspots from real multi-source signals (FIRMS detections, clusters)
// NEVER creates fake coordinates or decorative circles.
import type { FireDetectionMarker, DerivedHotspotMarker } from '../types/environmental';

/**
 * Calculates spatial distance between two points in km (Haversine formula)
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Derives environmental hotspots strictly from real spatial clustering of active signals.
 * Minimum cluster size = 2 real detections within 3.5 km.
 */
export function deriveEnvironmentalHotspots(
  fires: FireDetectionMarker[]
): DerivedHotspotMarker[] {
  if (!fires || fires.length === 0) {
    return [];
  }

  // Simple spatial clustering: cluster detections within 3.5 km radius
  const CLUSTER_THRESHOLD_KM = 3.5;
  const visited = new Set<number>();
  const hotspots: DerivedHotspotMarker[] = [];

  for (let i = 0; i < fires.length; i++) {
    if (visited.has(i)) continue;

    const cluster: FireDetectionMarker[] = [fires[i]];
    visited.add(i);

    for (let j = i + 1; j < fires.length; j++) {
      if (visited.has(j)) continue;

      const dist = haversineDistanceKm(
        fires[i].latitude,
        fires[i].longitude,
        fires[j].latitude,
        fires[j].longitude
      );

      if (dist <= CLUSTER_THRESHOLD_KM) {
        cluster.push(fires[j]);
        visited.add(j);
      }
    }

    // Only classify as a hotspot if there is a concentration of 2 or more real detections
    if (cluster.length >= 2) {
      const avgLat = cluster.reduce((sum, f) => sum + f.latitude, 0) / cluster.length;
      const avgLon = cluster.reduce((sum, f) => sum + f.longitude, 0) / cluster.length;
      const totalFrp = cluster.reduce((sum, f) => sum + (f.frp || 0), 0);

      hotspots.push({
        id: `derived-hotspot-${hotspots.length + 1}`,
        title: `Thermal Hotspot Concentration #${hotspots.length + 1}`,
        latitude: avgLat,
        longitude: avgLon,
        radiusMeters: 3500,
        severity: cluster.length >= 4 || totalFrp > 50 ? 'high' : 'moderate',
        explanation: `Derived from: ${cluster.length} satellite fire detection(s) concentrated within ${CLUSTER_THRESHOLD_KM} km (Combined FRP: ${totalFrp.toFixed(1)} MW).`,
        detectionCount: cluster.length,
        sources: ['NASA FIRMS VIIRS'],
        lastUpdated: cluster[0].detectionTime,
      });
    }
  }

  return hotspots;
}
