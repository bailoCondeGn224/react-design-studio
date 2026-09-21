import { BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArriveeSignalee } from '@/types/livreur';

interface ArriveeBannerProps {
  arrivees: ArriveeSignalee[];
  onAcknowledge: () => void;
}

export const ArriveeBanner = ({ arrivees, onAcknowledge }: ArriveeBannerProps) => {
  if (arrivees.length === 0) return null;

  return (
    <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3">
      <div className="flex items-start gap-2">
        <BellRing className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-900">
            Vous êtes arrivé à destination
          </p>
          <p className="text-xs text-emerald-800">
            {arrivees.map((a) => a.numero).join(', ')} — le client et la boutique
            ont été prévenus.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-emerald-800 shrink-0"
          onClick={onAcknowledge}
        >
          OK
        </Button>
      </div>
    </div>
  );
};
