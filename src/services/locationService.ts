import { GeofenceConfig, LocationCoordinates } from '../types/restaurant';

// Shankar Restaurant Coordinates (Central Heritage Hub, Connaught Place, New Delhi)
export const SHANKAR_RESTAURANT_LOCATION: GeofenceConfig = {
  restaurantName: 'Shankar Restaurant',
  restaurantAddress: 'Heritage Block C-14, Inner Circle, Connaught Place, New Delhi 110001',
  center: {
    lat: 28.6328,
    lng: 77.2197,
    addressLabel: 'Shankar Restaurant, C-Block, Connaught Place'
  },
  maxDeliveryRadiusKm: 6.0, // Strict 6 km delivery radius to preserve kitchen freshness & prevent fraudulent orders
  maxDineInRadiusMeters: 350 // Max 350m radius for live dine-in table ordering
};

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two GPS coordinates using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  return Number(distance.toFixed(3)); // 3 decimal places (approx. 1 meter accuracy)
}

export interface PresetLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  expectedStatus: 'inside_dine_in' | 'inside_delivery' | 'outside_radius';
}

export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'table_inside',
    name: 'Table 4, Shankar Dining Hall',
    lat: 28.6329,
    lng: 77.2198,
    description: 'On-premise dining hall (~15 meters)',
    expectedStatus: 'inside_dine_in'
  },
  {
    id: 'cp_market',
    name: 'Barakhamba Road, Connaught Place',
    lat: 28.6295,
    lng: 77.2241,
    description: 'Central Delhi delivery zone (0.6 km)',
    expectedStatus: 'inside_delivery'
  },
  {
    id: 'karol_bagh',
    name: 'Pusa Road, Karol Bagh',
    lat: 28.6448,
    lng: 77.1895,
    description: 'Within delivery radius (3.4 km)',
    expectedStatus: 'inside_delivery'
  },
  {
    id: 'noida_far',
    name: 'Sector 62, Noida (Beyond Boundary)',
    lat: 28.628,
    lng: 77.3688,
    description: 'Outside delivery zone (14.6 km) - Abuse blocked',
    expectedStatus: 'outside_radius'
  },
  {
    id: 'gurugram_far',
    name: 'Cyber City, Gurugram (Beyond Boundary)',
    lat: 28.4952,
    lng: 77.0895,
    description: 'Outside delivery zone (19.8 km) - Abuse blocked',
    expectedStatus: 'outside_radius'
  }
];

/**
 * Request user's live device location via browser Geolocation API
 */
export async function getLiveDeviceLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          addressLabel: `Current Device GPS (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location access permission was denied. Shankar Restaurant requires verified location to prevent fraudulent orders.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is temporarily unavailable. Please retry or pick a preset.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please retry.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000
      }
    );
  });
}
