/**
 * Represents a US state entry with its 2-letter code, full name, and center coordinates.
 */
export interface USStateOption {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Complete directory of all 50 US states used in filter/post dropdowns
 * and as fallback geographic coordinates when exact ZIP coordinates aren't mapped.
 */
export const US_STATES: USStateOption[] = [
  { code: 'AL', name: 'Alabama', lat: 32.806671, lng: -86.79113 },
  { code: 'AK', name: 'Alaska', lat: 61.370716, lng: -152.404419 },
  { code: 'AZ', name: 'Arizona', lat: 33.729759, lng: -111.431221 },
  { code: 'AR', name: 'Arkansas', lat: 34.969704, lng: -92.373123 },
  { code: 'CA', name: 'California', lat: 36.116203, lng: -119.681564 },
  { code: 'CO', name: 'Colorado', lat: 39.059811, lng: -105.311104 },
  { code: 'CT', name: 'Connecticut', lat: 41.597782, lng: -72.755371 },
  { code: 'DE', name: 'Delaware', lat: 39.318523, lng: -75.507141 },
  { code: 'FL', name: 'Florida', lat: 27.766279, lng: -81.686783 },
  { code: 'GA', name: 'Georgia', lat: 33.040619, lng: -83.643074 },
  { code: 'HI', name: 'Hawaii', lat: 21.094318, lng: -157.498337 },
  { code: 'ID', name: 'Idaho', lat: 44.240459, lng: -114.478828 },
  { code: 'IL', name: 'Illinois', lat: 40.349457, lng: -88.986137 },
  { code: 'IN', name: 'Indiana', lat: 39.849426, lng: -86.258278 },
  { code: 'IA', name: 'Iowa', lat: 42.011539, lng: -93.210526 },
  { code: 'KS', name: 'Kansas', lat: 38.5266, lng: -96.726486 },
  { code: 'KY', name: 'Kentucky', lat: 37.66814, lng: -84.670067 },
  { code: 'LA', name: 'Louisiana', lat: 31.169546, lng: -91.867805 },
  { code: 'ME', name: 'Maine', lat: 44.693947, lng: -69.381927 },
  { code: 'MD', name: 'Maryland', lat: 39.063946, lng: -76.802101 },
  { code: 'MA', name: 'Massachusetts', lat: 42.230171, lng: -71.530106 },
  { code: 'MI', name: 'Michigan', lat: 43.326618, lng: -84.536095 },
  { code: 'MN', name: 'Minnesota', lat: 45.694454, lng: -93.900192 },
  { code: 'MS', name: 'Mississippi', lat: 32.741646, lng: -89.678696 },
  { code: 'MO', name: 'Missouri', lat: 38.456085, lng: -92.288368 },
  { code: 'MT', name: 'Montana', lat: 46.921925, lng: -110.454353 },
  { code: 'NE', name: 'Nebraska', lat: 41.12537, lng: -98.268082 },
  { code: 'NV', name: 'Nevada', lat: 38.313515, lng: -117.055374 },
  { code: 'NH', name: 'New Hampshire', lat: 43.452492, lng: -71.563896 },
  { code: 'NJ', name: 'New Jersey', lat: 40.298904, lng: -74.521011 },
  { code: 'NM', name: 'New Mexico', lat: 34.840515, lng: -106.248482 },
  { code: 'NY', name: 'New York', lat: 42.165726, lng: -74.948051 },
  { code: 'NC', name: 'North Carolina', lat: 35.630066, lng: -79.806419 },
  { code: 'ND', name: 'North Dakota', lat: 47.528912, lng: -99.784012 },
  { code: 'OH', name: 'Ohio', lat: 40.388783, lng: -82.764915 },
  { code: 'OK', name: 'Oklahoma', lat: 35.565342, lng: -96.928917 },
  { code: 'OR', name: 'Oregon', lat: 44.572021, lng: -122.070938 },
  { code: 'PA', name: 'Pennsylvania', lat: 40.590752, lng: -77.209755 },
  { code: 'RI', name: 'Rhode Island', lat: 41.680893, lng: -71.51178 },
  { code: 'SC', name: 'South Carolina', lat: 33.856892, lng: -80.945007 },
  { code: 'SD', name: 'South Dakota', lat: 44.299782, lng: -99.438828 },
  { code: 'TN', name: 'Tennessee', lat: 35.747845, lng: -86.692345 },
  { code: 'TX', name: 'Texas', lat: 31.054487, lng: -97.563461 },
  { code: 'UT', name: 'Utah', lat: 40.150032, lng: -111.862434 },
  { code: 'VT', name: 'Vermont', lat: 44.045876, lng: -72.710686 },
  { code: 'VA', name: 'Virginia', lat: 37.769337, lng: -78.169968 },
  { code: 'WA', name: 'Washington', lat: 47.400902, lng: -121.490494 },
  { code: 'WV', name: 'West Virginia', lat: 38.491226, lng: -80.954453 },
  { code: 'WI', name: 'Wisconsin', lat: 44.268543, lng: -89.616508 },
  { code: 'WY', name: 'Wyoming', lat: 42.755966, lng: -107.30249 },
];

/**
 * Converts a 2-letter state code (e.g., "OR") into its full display name ("Oregon").
 */
export function getStateName(code: string): string {
  return US_STATES.find((s) => s.code === code)?.name ?? code;
}

/**
 * Lookup table of approximate coordinates for the sample listing ZIP codes
 * to support instant client-side radius filtering without an external geocoding API.
 */
const KNOWN_ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  '97205': { lat: 45.5231, lng: -122.6765 },
  '78704': { lat: 30.2455, lng: -97.7688 },
  '28801': { lat: 35.5951, lng: -82.5515 },
  '43214': { lat: 40.0468, lng: -83.0199 },
  '80302': { lat: 40.015, lng: -105.2705 },
  '33701': { lat: 27.7676, lng: -82.6403 },
  '95472': { lat: 38.4021, lng: -122.8239 },
  '02144': { lat: 42.3959, lng: -71.1225 },
  '98103': { lat: 47.6694, lng: -122.3417 },
  '55408': { lat: 44.9481, lng: -93.2882 },
  '30030': { lat: 33.7748, lng: -84.2963 },
  '85719': { lat: 32.2389, lng: -110.9574 },
};

/**
 * Assigns coordinates to newly posted yard sales based on their ZIP code,
 * falling back to the selected state's geographic center if the ZIP isn't in KNOWN_ZIP_COORDS.
 */
export function estimateCoordsForLocation(
  zip: string,
  stateCode: string
): { lat: number; lng: number } | undefined {
  const cleanZip = zip.trim().slice(0, 5);
  if (KNOWN_ZIP_COORDS[cleanZip]) {
    return KNOWN_ZIP_COORDS[cleanZip];
  }
  const state = US_STATES.find((s) => s.code === stateCode);
  if (state) {
    return { lat: state.lat, lng: state.lng };
  }
  return undefined;
}

/**
 * Calculates the straight-line distance in miles between two latitude/longitude points
 * using the Haversine formula.
 */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Mean Earth radius in statute miles
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves a 5-digit ZIP input to coordinates using exact match first,
 * then 3-digit postal prefix match, returning null if unrecognized.
 */
export function lookupZipCoords(
  zipInput: string
): { lat: number; lng: number } | null {
  const clean = zipInput.trim();
  if (!/^\d{5}$/.test(clean)) return null;
  if (KNOWN_ZIP_COORDS[clean]) return KNOWN_ZIP_COORDS[clean];
  // Match by 3-digit SCF prefix from known sample coords when nearby
  const prefix = clean.slice(0, 3);
  for (const [k, coords] of Object.entries(KNOWN_ZIP_COORDS)) {
    if (k.startsWith(prefix)) {
      return coords;
    }
  }
  return null;
}
