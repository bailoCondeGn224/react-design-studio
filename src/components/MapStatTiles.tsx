import { Clock, Route as RouteIcon } from 'lucide-react';
import { formatDistance, formatDuration } from '@/lib/geo';

interface MapStatTilesProps {
  distanceM?: number | null;
  durationS?: number | null;
  approximate?: boolean;
}

const Tile = ({
  value,
  hint,
  icon,
}: {
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-1 items-center justify-between gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-white shadow-lg">
    <div className="min-w-0">
      <p className="truncate text-xl font-bold leading-tight">{value}</p>
      {hint && <p className="text-[10px] text-white/60">{hint}</p>}
    </div>
    <div className="shrink-0 text-white/80">{icon}</div>
  </div>
);

export const MapStatTiles = ({
  distanceM,
  durationS,
  approximate = false,
}: MapStatTilesProps) => {
  if (distanceM == null) return null;

  return (
    <div className="flex gap-2">
      <Tile
        value={formatDistance(distanceM)}
        hint={approximate ? "à vol d'oiseau" : undefined}
        icon={<RouteIcon className="h-7 w-7" strokeWidth={1.5} />}
      />
      {durationS != null && (
        <Tile
          value={formatDuration(durationS)}
          icon={<Clock className="h-7 w-7" strokeWidth={1.5} />}
        />
      )}
    </div>
  );
};
