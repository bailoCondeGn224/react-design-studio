import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useCreateArticle } from "@/hooks/useStock";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";

interface NouvelArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArticleCreated?: (article: any) => void;
}

const NouvelArticleModal = ({ open, onOpenChange, onArticleCreated }: NouvelArticleModalProps) => {
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();
  const createArticle = useCreateArticle();

  const [form, setForm] = useState({
    nom: "",
    reference: "",
    categorieId: "",
    zone: "A",
    seuilAlerte: "10",
    max: "100",
    prixVente: "",
    prixAchat: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({
      nom: "",
      reference: "",
      categorieId: "",
      zone: "A",
      seuilAlerte: "10",
      max: "100",
      prixVente: "",
      prixAchat: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.categorieId || !form.seuilAlerte || !form.prixVente.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const articleData = {
      nom: form.nom,
      reference: form.reference || undefined,
      categorieId: form.categorieId,
      zone: form.zone,
      stock: 0, // Stock initial à 0, sera augmenté par l'approvisionnement
      seuilAlerte: Number(form.seuilAlerte),
      max: form.max ? Number(form.max) : undefined,
      prixVente: Number(form.prixVente),
      prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
    };

    createArticle.mutate(articleData, {
      onSuccess: (newArticle) => {
        toast.success("Article créé avec succès");
        if (onArticleCreated) {
          onArticleCreated(newArticle);
        }
        resetForm();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Erreur lors de la création de l'article");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Créer un Nouvel Article</DialogTitle>
          <DialogDescription>
            L'article sera créé avec un stock initial de 0. La quantité sera ajoutée par l'approvisionnement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Nom de l'article *"
            placeholder="Ex: Abaya Noire Premium"
            value={form.nom}
            onChange={e => update("nom", (e.target as HTMLInputElement).value)}
            maxLength={100}
          />

          <FormField
            label="Référence (SKU)"
            placeholder="Ex: ABY-001"
            value={form.reference}
            onChange={e => update("reference", (e.target as HTMLInputElement).value)}
            maxLength={50}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Catégorie *"
              as="select"
              value={form.categorieId}
              onChange={e => update("categorieId", (e.target as HTMLSelectElement).value)}
              disabled={loadingCategories}
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories
                .filter(cat => cat.actif)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
            </FormField>

            <FormField
              label="Zone de stockage *"
              as="select"
              value={form.zone}
              onChange={e => update("zone", (e.target as HTMLSelectElement).value)}
            >
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
              <option value="D">Zone D</option>
              <option value="E">Zone E</option>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Seuil d'alerte *"
              type="number"
              placeholder="10"
              value={form.seuilAlerte}
              onChange={e => update("seuilAlerte", (e.target as HTMLInputElement).value)}
              min="0"
            />
            <FormField
              label="Stock maximum"
              type="number"
              placeholder="100"
              value={form.max}
              onChange={e => update("max", (e.target as HTMLInputElement).value)}
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prix de vente (GNF) *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="85 000"
                value={formatPrixInput(form.prixVente)}
                onChange={e => update("prixVente", handlePrixChange(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prix d'achat (GNF)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="50 000"
                value={formatPrixInput(form.prixAchat)}
                onChange={e => update("prixAchat", handlePrixChange(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> L'article sera créé avec un stock de 0. La quantité sera automatiquement
              ajoutée lorsque vous compléterez l'approvisionnement.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createArticle.isPending}
              className="flex-1 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createArticle.isPending ? 'Création...' : 'Créer l\'article'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NouvelArticleModal;
