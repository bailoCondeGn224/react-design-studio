import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLivreurs, useDispatchOrder } from '@/hooks/useLivreurs';
import { Loader2, User, Phone, CheckCircle } from 'lucide-react';
import { OnlineOrder } from '@/types';

interface DispatchDialogProps {
  order: OnlineOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DispatchDialog = ({
  order,
  open,
  onOpenChange,
}: DispatchDialogProps) => {
  const { data: livreurs = [], isLoading } = useLivreurs();
  const dispatch = useDispatchOrder();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeLivreurs = livreurs.filter((l) => l.isActive);

  const handleDispatch = async () => {
    if (!order || !selectedId) return;
    await dispatch.mutateAsync({ orderId: order.id, livreurId: selectedId });
    onOpenChange(false);
    setSelectedId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un livreur</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : activeLivreurs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun livreur actif disponible
          </p>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {activeLivreurs.map((livreur) => (
              <button
                key={livreur.id}
                onClick={() => setSelectedId(livreur.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  selectedId === livreur.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{livreur.nom}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {livreur.telephone}
                  </div>
                </div>
                {selectedId === livreur.id && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}

        <Button
          className="w-full"
          disabled={!selectedId || dispatch.isPending}
          onClick={handleDispatch}
        >
          {dispatch.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Assigner
        </Button>
      </DialogContent>
    </Dialog>
  );
};
