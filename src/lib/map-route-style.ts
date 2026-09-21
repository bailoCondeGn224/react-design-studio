import L from 'leaflet';

export const ROUTE_COLOR = '#0d9488';
export const ROUTE_CASING_COLOR = '#0f3d38';
export const ROUTE_WEIGHT = 7;
export const ROUTE_CASING_WEIGHT = 11;

export interface RouteLine {
  setLatLngs(coordinates: [number, number][]): void;
  setApproximate(approximate: boolean): void;
  getBounds(): L.LatLngBounds;
  remove(): void;
}

export const createRouteLine = (
  map: L.Map,
  coordinates: [number, number][],
  approximate = false,
): RouteLine => {
  const dash = approximate ? '12, 12' : undefined;

  const casing = L.polyline(coordinates, {
    color: ROUTE_CASING_COLOR,
    weight: ROUTE_CASING_WEIGHT,
    opacity: 0.35,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: dash,
  }).addTo(map);

  const line = L.polyline(coordinates, {
    color: ROUTE_COLOR,
    weight: ROUTE_WEIGHT,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round',
    dashArray: dash,
  }).addTo(map);

  return {
    setLatLngs(next) {
      casing.setLatLngs(next);
      line.setLatLngs(next);
    },
    setApproximate(next) {
      const nextDash = next ? '12, 12' : undefined;
      casing.setStyle({ dashArray: nextDash });
      line.setStyle({ dashArray: nextDash });
    },
    getBounds: () => line.getBounds(),
    remove() {
      casing.remove();
      line.remove();
    },
  };
};
