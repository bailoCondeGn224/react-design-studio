import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Fraîcheur d'une position GPS de livreur.
 *
 * L'app livreur envoie sa position dès qu'elle a bougé de 50 m (au plus une fois
 * toutes les 15 s), et de toute façon au moins une fois par minute même à l'arrêt.
 * Une position de plus de 2 minutes signifie donc que l'app est fermée, que le GPS
 * est coupé ou que le réseau est tombé — pas que le livreur est immobile.
 */
export type PositionFreshness = 'live' | 'stale' | 'offline';

export const LIVE_THRESHOLD_MS = 2 * 60 * 1000;
export const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;

export const getPositionFreshness = (
  lastPositionAt?: string | null,
  now: number = Date.now(),
): PositionFreshness => {
  if (!lastPositionAt) return 'offline';

  const age = now - new Date(lastPositionAt).getTime();
  if (Number.isNaN(age)) return 'offline';
  if (age <= LIVE_THRESHOLD_MS) return 'live';
  if (age <= OFFLINE_THRESHOLD_MS) return 'stale';
  return 'offline';
};

export const FRESHNESS_COLORS: Record<PositionFreshness, string> = {
  live: '#16a34a',
  stale: '#f59e0b',
  offline: '#9ca3af',
};

export const FRESHNESS_LABELS: Record<PositionFreshness, string> = {
  live: 'En direct',
  stale: 'Signal faible',
  offline: 'Hors ligne',
};

/** « il y a 3 minutes », ou null si on n'a jamais reçu de position. */
export const formatPositionAge = (lastPositionAt?: string | null): string | null => {
  if (!lastPositionAt) return null;

  const date = new Date(lastPositionAt);
  if (Number.isNaN(date.getTime())) return null;

  return formatDistanceToNowStrict(date, { locale: fr, addSuffix: true });
};
