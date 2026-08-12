import { CapturedPosition, POOR_ACCURACY_M } from '@/hooks/useAccuratePosition';
import { formatDistance } from '@/lib/geo';
import { CheckCircle2, Hand, Loader2, TriangleAlert } from 'lucide-react';

interface GpsAccuracyBadgeProps {
  position: CapturedPosition;
  isRefining: boolean;
}

const GOOD_ACCURACY_M = 20;

export const GpsAccuracyBadge = ({ position, isRefining }: GpsAccuracyBadgeProps) => {
  if (position.source === 'manual') {
    return (
      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
        <Hand className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium">
          Repère placé à la main — c'est ce point qui guidera le livreur
        </span>
      </div>
    );
  }

  const accuracy = position.accuracy;

  if (isRefining) {
    return (
      <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
        <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
        <span className="text-xs font-medium">
          Affinage de la position…
          {accuracy != null && ` précision actuelle ${formatDistance(accuracy)}`}
        </span>
      </div>
    );
  }

  if (accuracy == null) {
    return null;
  }

  if (accuracy <= GOOD_ACCURACY_M) {
    return (
      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium">
          Position précise à environ {formatDistance(accuracy)}
        </span>
      </div>
    );
  }

  const isPoor = accuracy > POOR_ACCURACY_M;

  return (
    <div
      className={`flex items-start gap-2 px-3 py-2 rounded-lg ${
        isPoor ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
      }`}
    >
      <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="text-xs">
        <span className="font-medium">
          Position approximative à environ {formatDistance(accuracy)}.
        </span>{' '}
        {isPoor
          ? "C'est trop imprécis pour guider un livreur. Sortez à l'air libre et relancez, ou placez le repère à la main sur la carte."
          : 'Vous pouvez corriger le repère sur la carte ci-dessous.'}
      </span>
    </div>
  );
};
