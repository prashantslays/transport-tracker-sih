import { Location } from '../types';

const AVERAGE_SPEED_KMH = 25;
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine formula — calculates the great-circle distance between two points
 * on a sphere given their latitude and longitude in degrees.
 */
function haversineDistance(a: Location, b: Location): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * centralAngle;
}

/**
 * Calculates ETA in minutes based on distance and a constant average speed.
 * Returns null when locations are identical (already at stop).
 */
export function calculateEtaMinutes(busLocation: Location, stopLocation: Location): number | null {
  const distanceKm = haversineDistance(busLocation, stopLocation);

  if (distanceKm === 0) return null;

  const timeHours = distanceKm / AVERAGE_SPEED_KMH;
  const timeMinutes = Math.round(timeHours * 60);

  return timeMinutes;
}

/**
 * Returns the distance in kilometres between two locations.
 */
export function getDistance(busLocation: Location, stopLocation: Location): number {
  return haversineDistance(busLocation, stopLocation);
}

export { AVERAGE_SPEED_KMH };
