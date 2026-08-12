import { useEffect } from 'react';
import { useAccuratePosition } from '@/hooks/useAccuratePosition';
import { GpsAccuracyBadge } from '@/components/storefront/GpsAccuracyBadge';
import { PositionPicker } from '@/components/storefront/PositionPicker';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';

interface BoutiquePositionFieldProps {
  latitude?: number;
  longitude?: number;
  onChange: (position: { latitude: number; longitude: number }) => void;
  compact?: boolean;
}

export const BoutiquePositionField = ({
  latitude,
  longitude,
  onChange,
  compact = false,
}: BoutiquePositionFieldProps) => {
  const { position, status, error, capture, setManualPosition } =
    useAccuratePosition();

  useEffect(() => {
    if (position) {
      onChange({ latitude: position.latitude, longitude: position.longitude });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position?.latitude, position?.longitude]);

  const displayed =
    position ??
    (latitude != null && longitude != null
      ? { latitude, longitude, accuracy: null, source: 'manual' as const }
      : null);

  const isCapturing = status === 'capturing';

  return (
    <div className="space-y-2">
      {!compact && (
        <p className="text-xs text-muted-foreground">
          Ce point sert de départ aux livraisons et guide vos livreurs. Placez-le
          depuis la boutique pour un meilleur résultat.
        </p>
      )}

      {displayed ? (
        <>
          {position && (
            <GpsAccuracyBadge position={position} isRefining={isCapturing} />
          )}

          <PositionPicker position={displayed} onChange={setManualPosition} />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={capture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Localisation…
              </>
            ) : (
              <>
                <Navigation className="mr-2 h-3.5 w-3.5" />
                Utiliser ma position actuelle
              </>
            )}
          </Button>
        </>
      ) : (
        <Button type="button" variant="outline" onClick={capture} disabled={isCapturing}>
          {isCapturing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Localisation…
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Définir la position de la boutique
            </>
          )}
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
