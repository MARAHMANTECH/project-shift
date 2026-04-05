// Privacy helpers - GPS coordinate processing
// Per .rules/03-multi-tenancy-security.md:
// - GPS coordinates MUST be rounded to 3 decimal places (~111m precision)
// - NEVER implement live GPS tracking

/**
 * Round GPS coordinates to 3 decimal places for privacy.
 * 3 decimals = ~111 meter precision, which is sufficient for
 * meeting point proximity without revealing exact locations.
 *
 * @param latitude - Raw latitude value
 * @param longitude - Raw longitude value
 * @returns Rounded coordinates
 */
export function roundCoordinates(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } {
  return {
    latitude: roundToDecimals(latitude, 3),
    longitude: roundToDecimals(longitude, 3),
  };
}

/**
 * Validate that coordinates are within valid WGS 84 bounds.
 *
 * @param latitude - Latitude to validate (-90 to 90)
 * @param longitude - Longitude to validate (-180 to 180)
 * @returns True if valid
 */
export function isValidCoordinate(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
