import L from 'leaflet';
import { FRESHNESS_COLORS, PositionFreshness } from './position-freshness';

/**
 * Fournisseur de tuiles.
 *
 * Par défaut, le serveur de la fondation OpenStreetMap. Sa politique d'usage
 * interdit l'exploitation commerciale à volume: pour un déploiement qui monte
 * en charge, renseigner VITE_TILE_URL avec son propre serveur ou un fournisseur
 * sous contrat. Penser à élargir TILE_HOST_PATTERN dans vite.config.ts pour que
 * le service worker mette aussi ces tuiles en cache.
 */
export const TILE_URL =
  import.meta.env.VITE_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION =
  import.meta.env.VITE_TILE_ATTRIBUTION || '© OpenStreetMap';

/** Centre par défaut: Conakry, Guinée. */
export const DEFAULT_CENTER: [number, number] = [9.6412, -13.5784];

const PULSE_STYLE_ID = 'livreur-pulse-keyframes';

/** Injecte une seule fois les keyframes du halo pulsant du marqueur livreur. */
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

const TRUCK_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
`;

const PIN_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
`;

/** Marqueur livreur, coloré selon la fraîcheur de sa position. */
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
    ">${TRUCK_SVG}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

/** Marqueur destination. `label` affiche un numéro d'ordre dans la pastille. */
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

/** Marqueur de la boutique: point de départ de la course. */
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

/** Marqueur « vous êtes ici » de l'app livreur. */
export const buildSelfIcon = () => {
  ensurePulseStyle();

  return L.divIcon({
    className: 'custom-marker self-marker',
    html: `<div style="
      background: #2563eb;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(37,99,235,0.6);
      animation: livreur-pulse 2s infinite;
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export type TileHealth = 'loading' | 'ok' | 'error';

/**
 * Ajoute la couche de tuiles à une carte et signale son état de chargement.
 *
 * Sans ce retour, une panne réseau ou un fournisseur qui refuse la requête se
 * traduit par un rectangle gris muet: l'utilisateur croit que la position est
 * inconnue alors que seules les images de fond manquent.
 */
export const addTileLayer = (
  map: L.Map,
  onHealthChange?: (health: TileHealth) => void,
) => {
  const layer = L.tileLayer(TILE_URL, {
    attribution: TILE_ATTRIBUTION,
    // Garde la dernière tuile connue visible pendant un rechargement
    keepBuffer: 4,
  });

  if (onHealthChange) {
    let failures = 0;

    layer.on('loading', () => {
      failures = 0;
      onHealthChange('loading');
    });

    // Une tuile isolée peut échouer sans que la carte soit inutilisable;
    // on n'alerte qu'à partir de plusieurs échecs.
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

/** En dessous de ce rayon, le cercle d'incertitude n'apporte rien visuellement. */
export const MIN_UNCERTAINTY_RADIUS_M = 25;

/**
 * Cercle d'incertitude autour d'un point de livraison.
 *
 * Un point issu d'une triangulation Wi-Fi peut être faux de plusieurs centaines
 * de mètres; l'afficher comme un point net envoie le livreur au mauvais endroit
 * avec assurance. Le cercle dit la vérité sur ce qu'on sait.
 */
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
