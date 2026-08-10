/** Distance à vol d'oiseau entre deux points GPS, en mètres (formule de Haversine). */
export const distanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371000; // rayon terrestre en mètres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** « 350 m » ou « 2,4 km ». */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
};

/** « 4 min » ou « 1 h 12 ». */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest}`;
};

/** Lien d'itinéraire Google Maps: coordonnées GPS si on les a, adresse sinon. */
export const buildDirectionsUrl = (params: {
  latitude?: number | null;
  longitude?: number | null;
  adresse?: string | null;
}): string | null => {
  const { latitude, longitude, adresse } = params;

  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  if (adresse?.trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(adresse)}`;
  }

  return null;
};
