import L from 'leaflet';
import { FRESHNESS_COLORS, PositionFreshness } from './position-freshness';

export const TILE_URL =
  import.meta.env.VITE_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION =
  import.meta.env.VITE_TILE_ATTRIBUTION || '© OpenStreetMap';

export const DEFAULT_CENTER: [number, number] = [9.6412, -13.5784];

const PULSE_STYLE_ID = 'livreur-pulse-keyframes';

export const ensurePulseStyle = () => {
  if (document.getElementById(PULSE_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes livreur-pulse {
      0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(22, 163, 74, 0); }
      100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
    }
  `;
  document.head.appendChild(style);
};

const VEHICLE_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5" stroke-linejoin="round">
    <path d="M12 3 L18.5 19 L12 15.5 L5.5 19 Z"></path>
  </svg>
`;

const rotor = (content: string) =>
  `<div class="marker-rotor" style="display:flex;align-items:center;justify-content:center;transition:transform .5s ease-out;">${content}</div>`;

const PIN_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
`;

export const buildLivreurIcon = (
  freshness: PositionFreshness,
  options: { size?: number; animate?: boolean } = {},
) => {
  const { size = 36, animate = freshness === 'live' } = options;
  const color = FRESHNESS_COLORS[freshness];

  if (animate) ensurePulseStyle();

  return L.divIcon({
    className: 'custom-marker livreur-marker',
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.35);
      opacity: ${freshness === 'offline' ? 0.65 : 1};
      ${animate ? 'animation: livreur-pulse 2s infinite;' : ''}
    ">${rotor(VEHICLE_SVG)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const buildDestinationIcon = (options: { label?: string; dimmed?: boolean } = {}) => {
  const { label, dimmed = false } = options;
  const size = 32;

  return L.divIcon({
    className: 'custom-marker destination-marker',
    html: `<div style="
      background: ${dimmed ? '#94a3b8' : '#10b981'};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      font: 600 12px/1 system-ui, sans-serif;
      color: white;
    ">${label ?? PIN_SVG}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

export const buildBoutiqueIcon = () => {
  const size = 32;

  return L.divIcon({
    className: 'custom-marker boutique-marker',
    html: `<div style="
      background: #7c3aed;
      width: ${size}px;
      height: ${size}px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M3 9l1-5h16l1 5"></path>
        <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"></path>
        <path d="M9 21v-6h6v6"></path>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const buildSelfIcon = () => {
  ensurePulseStyle();

  const cone = `<svg width="38" height="38" viewBox="0 0 38 38"><path d="M19 2 L27 14 L11 14 Z" fill="#2563eb" opacity="0.85"></path></svg>`;
  const dot = `<div style="position:absolute;background:#2563eb;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px rgba(37,99,235,0.6);animation:livreur-pulse 2s infinite;"></div>`;

  return L.divIcon({
    className: 'custom-marker self-marker',
    html: `<div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">${rotor(cone)}${dot}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

export type TileHealth = 'loading' | 'ok' | 'error';

export const addTileLayer = (
  map: L.Map,
  onHealthChange?: (health: TileHealth) => void,
) => {
  const layer = L.tileLayer(TILE_URL, {
    attribution: TILE_ATTRIBUTION,
    keepBuffer: 4,
  });

  if (onHealthChange) {
    let failures = 0;

    layer.on('loading', () => {
      failures = 0;
      onHealthChange('loading');
    });

    layer.on('tileerror', () => {
      failures += 1;
      if (failures >= 3) onHealthChange('error');
    });

    layer.on('load', () => {
      failures = 0;
      onHealthChange('ok');
    });
  }

  layer.addTo(map);
  return layer;
};

export const MIN_UNCERTAINTY_RADIUS_M = 25;

export const buildUncertaintyCircle = (
  center: [number, number],
  radiusMeters: number,
) =>
  L.circle(center, {
    radius: radiusMeters,
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.12,
    weight: 1,
    dashArray: '4, 4',
  });
