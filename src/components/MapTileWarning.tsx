import { useEffect, useState } from 'react';
import { TileHealth } from '@/lib/map-icons';
import { WifiOff } from 'lucide-react';

interface MapTileWarningProps {
  health: TileHealth;
}

/**
 * Superposition affichée quand le fond de carte ne charge pas.
 *
 * Les repères et le tracé restent exploitables sans les tuiles: le message doit
 * donc rassurer sur ce qui fonctionne encore, pas masquer la carte.
 */
export const MapTileWarning = ({ health }: MapTileWarningProps) => {
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (health !== 'error' && !isOffline) return null;

  return (
    <div className="absolute inset-x-2 top-2 z-[500] flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50/95 px-3 py-2 shadow-sm backdrop-blur">
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-[11px] leading-snug text-amber-900">
        <span className="font-medium">Fond de carte indisponible.</span>{' '}
        {isOffline
          ? 'Vous êtes hors connexion.'
          : 'Le serveur de cartes ne répond pas.'}{' '}
        Les positions et le trajet restent affichés.
      </p>
    </div>
  );
};
