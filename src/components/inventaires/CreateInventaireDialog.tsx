import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateInventaire, useInventaireDateMin } from '@/hooks/useInventaires';

interface CreateInventaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateInventaireDialog({
  open,
  onOpenChange,
}: CreateInventaireDialogProps) {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const createMutation = useCreateInventaire();
  const { data: dateMinData } = useInventaireDateMin();

  // Obtenir la date/heure maximale (maintenant)
  const getMaxDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // Obtenir la date/heure minimale (dernier inventaire ou null)
  const getMinDateTime = () => {
    if (!dateMinData?.dateMin) return undefined;
    const minDate = new Date(dateMinData.dateMin);
    minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
    return minDate.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const inventaire = await createMutation.mutateAsync({
        date: date ? new Date(date).toISOString() : undefined,
        note: note || undefined,
      });

      // Rediriger vers la page de comptage
      navigate(`/inventaires/${inventaire.id}`);
      onOpenChange(false);
      setDate('');
      setNote('');
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvel Inventaire</DialogTitle>
            <DialogDescription>
              Créez un nouvel inventaire pour compter vos articles et ajuster
              les stocks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date de l'inventaire</Label>
              <Input
                id="date"
                type="datetime-local"
                min={getMinDateTime()}
                max={getMaxDateTime()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {dateMinData?.dateMin
                  ? `Date entre ${new Date(dateMinData.dateMin).toLocaleDateString('fr-FR')} et aujourd'hui`
                  : 'La date ne peut pas être dans le futur. Par défaut: maintenant'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optionnel)</Label>
              <Input
                id="note"
                placeholder="Ex: Inventaire mensuel mai 2026"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Une description pour identifier cet inventaire
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? 'Création...'
                : 'Démarrer le comptage'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
