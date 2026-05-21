import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Star, Truck, User, MapPin, Award, Package, Check } from "lucide-react";

interface FournisseurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const FournisseurForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: FournisseurFormProps) => {
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();
  const isMobile = useIsMobile();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      // Décomposer le nom complet du backend en nom et prénom pour l'affichage
      const nomComplet = initialData.nom || "";
      const parts = nomComplet.trim().split(" ");
      const nom = parts[0] || "";
      const prenom = parts.slice(1).join(" ") || "";

      return {
        ...initialData,
        nom,
        prenom,
      };
    }
    return {
      nom: "", prenom: "", adresse: "", telephone: "", email: "", produits: [] as string[], statut: "actif", rating: 0,
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Décomposer le nom complet du backend en nom et prénom pour l'affichage
      const nomComplet = initialData.nom || "";
      const parts = nomComplet.trim().split(" ");
      const nom = parts[0] || "";
      const prenom = parts.slice(1).join(" ") || "";

      setForm({
        ...initialData,
        nom,
        prenom,
      });
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleProduit = (p: string) => {
    setForm(prev => ({
      ...prev,
      produits: prev.produits.includes(p) ? prev.produits.filter(x => x !== p) : [...prev.produits, p],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.adresse.trim() || !form.telephone.trim()) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    // Combiner nom et prénom pour le backend
    const fournisseurData = {
      ...form,
      nom: `${form.nom} ${form.prenom}`.trim(),
    };

    // Retirer le champ prenom avant l'envoi
    const { prenom, ...dataToSend } = fournisseurData;

    onSubmit(dataToSend);

    setForm(getInitialState());
    onOpenChange(false);
    toast.success(mode === 'edit' ? "Fournisseur mis à jour" : "Fournisseur ajouté avec succès");
  };

  // Contenu du formulaire (partagé entre Dialog et Sheet)
  const formContent = (
    <div className="h-full flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg flex-shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
              {isMobile ? (mode === 'edit' ? 'Modifier' : 'Fournisseur') : (mode === 'edit' ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {mode === 'edit' ? 'Modifiez les informations du fournisseur' : 'Renseignez les informations du fournisseur'}
            </p>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Section Identité */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Identité du fournisseur *</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nom *</label>
                <input
                  type="text"
                  placeholder="Ex: Diallo"
                  value={form.nom}
                  onChange={e => update("nom", e.target.value)}
                  maxLength={100}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Prénom *</label>
                <input
                  type="text"
                  placeholder="Ex: Mamadou"
                  value={form.prenom}
                  onChange={e => update("prenom", e.target.value)}
                  maxLength={100}
                  className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Coordonnées */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Coordonnées</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Adresse *</label>
              <input
                type="text"
                placeholder="Dubaï"
                value={form.adresse}
                onChange={e => update("adresse", e.target.value)}
                maxLength={50}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Téléphone *</label>
              <input
                type="tel"
                placeholder="+224 6XX XXX XXX"
                value={form.telephone}
                onChange={e => update("telephone", e.target.value)}
                maxLength={20}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email (optionnel)</label>
              <input
                type="email"
                placeholder="contact@exemple.com"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                maxLength={100}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Section Statut et Évaluation */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Statut et évaluation</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Statut</label>
              <select
                value={form.statut}
                onChange={e => update("statut", e.target.value)}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="actif">Actif</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-muted-foreground">Évaluation (optionnel)</label>
                {form.rating > 0 && (
                  <span className="text-sm font-bold text-amber-500">
                    {form.rating}/5
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => update("rating", form.rating === star ? 0 : star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= form.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section Catégories */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-warning/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Catégories fournies</h3>
            </div>

            {loadingCategories ? (
              <div className="p-4 text-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chargement des catégories...</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleProduit(cat.nom)}
                    className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                      form.produits.includes(cat.nom)
                        ? "bg-warning text-warning-foreground shadow-md scale-105"
                        : "bg-muted text-foreground hover:bg-warning/10 hover:border-warning/30 border border-transparent"
                    }`}
                  >
                    {cat.nom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Footer avec actions - fixe en bas */}
      <div className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={(e: any) => {
              const container = e.target.closest('[role="dialog"]');
              const formElement = container?.querySelector('form');
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            className="w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            {mode === 'edit' ? 'Enregistrer les modifications' : 'Ajouter le fournisseur'}
          </Button>
        </div>
      </div>
    </div>
  );

  // Rendu conditionnel : Sheet pour mobile, Dialog pour desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0">
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] p-0">
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default FournisseurForm;
