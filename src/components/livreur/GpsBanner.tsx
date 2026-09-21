import { AlertTriangle, Loader2 } from 'lucide-react';
import { GeoStatus } from '@/hooks/useLivreurPositionTracking';
import { formatPositionAge } from '@/lib/position-freshness';

interface GpsBannerProps {
  status: GeoStatus;
  lastSentAt: Date | null;
}

const ERROR_MESSAGES: Record<Exclude<GeoStatus, 'active' | 'starting'>, string> = {
  denied:
    "Localisation refusée. Le client ne peut pas suivre sa livraison. Autorisez la localisation dans les réglages de votre navigateur.",
  unavailable:
    "Position GPS indisponible. Vérifiez que la localisation de votre téléphone est activée.",
  unsupported:
    "Ce navigateur ne gère pas la localisation. Le suivi en direct est désactivé.",
};

export const GpsBanner = ({ status, lastSentAt }: GpsBannerProps) => {
  if (status === 'active') {
    const age = lastSentAt ? formatPositionAge(lastSentAt.toISOString()) : null;
    return (
      <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600" />
        </span>
        <p className="text-xs text-green-800">
          Position partagée{age ? ` · envoyée ${age}` : ''}
        </p>
      </div>
    );
  }

  if (status === 'starting') {
    return (
      <div className="bg-muted border-b border-border px-4 py-2 flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Recherche du signal GPS…</p>
      </div>
    );
  }

  return (
    <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-3 flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
      <p className="text-xs text-destructive font-medium">{ERROR_MESSAGES[status]}</p>
    </div>
  );
};
