import L from 'leaflet';
import { distanceInMeters } from '@/lib/geo';

const DEFAULT_DURATION_MS = 900;

const TELEPORT_THRESHOLD_M = 2000;

const MIN_BEARING_DISTANCE_M = 12;

const animations = new WeakMap<L.Marker, number>();
const bearings = new WeakMap<L.Marker, number>();

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const cancelMarkerAnimation = (marker: L.Marker) => {
  const frame = animations.get(marker);
  if (frame !== undefined) {
    cancelAnimationFrame(frame);
    animations.delete(marker);
  }
};

export const animateMarkerTo = (
  marker: L.Marker,
  target: [number, number],
  duration = DEFAULT_DURATION_MS,
) => {
  cancelMarkerAnimation(marker);

  const start = marker.getLatLng();
  const jump = distanceInMeters(start.lat, start.lng, target[0], target[1]);

  if (jump > TELEPORT_THRESHOLD_M || jump === 0) {
    marker.setLatLng(target);
    return;
  }

  const from = { lat: start.lat, lng: start.lng };
  const startedAt = performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = easeOutCubic(progress);

    marker.setLatLng([
      from.lat + (target[0] - from.lat) * eased,
      from.lng + (target[1] - from.lng) * eased,
    ]);

    if (progress < 1) {
      animations.set(marker, requestAnimationFrame(step));
    } else {
      animations.delete(marker);
    }
  };

  animations.set(marker, requestAnimationFrame(step));
};

export const computeBearing = (
  from: [number, number],
  to: [number, number],
): number | null => {
  if (distanceInMeters(from[0], from[1], to[0], to[1]) < MIN_BEARING_DISTANCE_M) {
    return null;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const lat1 = toRad(from[0]);
  const lat2 = toRad(to[0]);
  const dLon = toRad(to[1] - from[1]);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return (Math.atan2(y, x) * 180) / Math.PI;
};

export const applyBearing = (marker: L.Marker, degrees: number) => {
  bearings.set(marker, degrees);

  const rotor = marker.getElement()?.querySelector<HTMLElement>('.marker-rotor');
  if (rotor) rotor.style.transform = `rotate(${degrees}deg)`;
};

export const setIconPreservingBearing = (marker: L.Marker, icon: L.DivIcon) => {
  marker.setIcon(icon);

  const bearing = bearings.get(marker);
  if (bearing !== undefined) applyBearing(marker, bearing);
};
