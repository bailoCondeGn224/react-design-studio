import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAddComptage } from '@/hooks/useInventaires';
import { Article } from '@/types';

interface ComptageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article;
  inventaireId: string;
}

export default function ComptageDialog({
  open,
  onOpenChange,
  article,
  inventaireId,
}: ComptageDialogProps) {
  const [quantiteComptee, setQuantiteComptee] = useState(article.stock);
  const [note, setNote] = useState('');
  const addComptageMutation = useAddComptage();

  const ecart = quantiteComptee - article.stock;

  useEffect(() => {
    if (open) {
      setQuantiteComptee(article.stock);
      setNote('');
    }
  }, [open, article.stock]);

  const getEcartColor = () => {
    if (ecart === 0) return 'text-green-600 bg-green-50';
    if (Math.abs(ecart) <= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getEcartMessage = () => {
    if (ecart === 0) return '✅ Quantité correcte';
    if (ecart > 0) return `🟢 Surplus de ${ecart} unité(s)`;
    return `🔴 Manque ${Math.abs(ecart)} unité(s)`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addComptageMutation.mutateAsync({
        inventaireId,
        data: {
          articleId: article.id,
          quantiteComptee,
          note: note || undefined,
        },
      });

      onOpenChange(false);
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Compter: {article.nom}</DialogTitle>
            <DialogDescription>
              Combien d'unités avez-vous comptées physiquement?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Stock système */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Stock dans le système</p>
              <p className="text-2xl font-bold">{article.stock}</p>
            </div>

            {/* Quantité comptée */}
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité comptée</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantiteComptee(Math.max(0, quantiteComptee - 1))
                  }
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Input
                  id="quantite"
                  type="number"
                  min="0"
                  value={quantiteComptee}
                  onChange={(e) =>
                    setQuantiteComptee(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  className="text-center text-2xl font-bold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantiteComptee(quantiteComptee + 1)}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Différence */}
            <div className={`p-4 rounded-lg text-center ${getEcartColor()}`}>
              <p className="text-sm font-medium mb-1">Différence</p>
              <p className="text-2xl font-bold">
                {ecart > 0 ? '+' : ''}
                {ecart}
              </p>
              <p className="text-sm mt-1">{getEcartMessage()}</p>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (optionnel)</Label>
              <Textarea
                id="note"
                placeholder="Ex: 2 articles abîmés"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
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
            <Button type="submit" disabled={addComptageMutation.isPending}>
              {addComptageMutation.isPending
                ? 'Enregistrement...'
                : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
