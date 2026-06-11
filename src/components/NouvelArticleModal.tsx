import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useCreateArticle } from "@/hooks/useStock";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { ImageIcon, Upload, X, Calendar, Package } from "lucide-react";

interface NouvelArticleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArticleCreated?: (article: any) => void;
}

const NouvelArticleModal = ({ open, onOpenChange, onArticleCreated }: NouvelArticleModalProps) => {
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();
  const createArticle = useCreateArticle();
  const isMobile = useIsMobile();

  const [form, setForm] = useState({
    nom: "",
    reference: "",
    categorieId: "",
    zone: "A",
    seuilAlerte: "10",
    prixVente: "",
    prixAchat: "",
    dateExpiration: "",
    delaiAlerteExpiration: "30",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({
      nom: "",
      reference: "",
      categorieId: "",
      zone: "A",
      seuilAlerte: "10",
      prixVente: "",
      prixAchat: "",
      dateExpiration: "",
      delaiAlerteExpiration: "30",
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Taille maximale: 5MB");
      return;
    }

    // Valider le type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WEBP");
      return;
    }

    setPhotoFile(file);

    // Générer l'aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      prixVente: Number(form.prixVente),
      prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
      dateExpiration: form.dateExpiration || undefined,
      delaiAlerteExpiration: form.delaiAlerteExpiration ? Number(form.delaiAlerteExpiration) : undefined,
    };

    createArticle.mutate(
      { data: articleData, photo: photoFile || undefined },
      {
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
      }
    );
  };

  // Contenu partagé entre Sheet et Dialog
  const formContent = (
    <>
      {/* Header pour Sheet (mobile) */}
      <div className="md:hidden px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-success/10 via-success/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold">Créer un Nouvel Article</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stock initial de 0. Ajouté par l'approvisionnement.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0 p-4 sm:p-6">
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

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Photo de l'article (optionnel)
            </label>

            <div className="flex items-center gap-4">
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-lg border border-border overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium cursor-pointer hover:bg-secondary transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choisir une photo
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG ou WEBP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

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
          </div>

          {/* Date d'expiration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                Date d'expiration
              </label>
              <input
                type="date"
                value={form.dateExpiration}
                onChange={e => update("dateExpiration", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <FormField
              label="Délai alerte (jours)"
              type="number"
              placeholder="30"
              value={form.delaiAlerteExpiration}
              onChange={e => update("delaiAlerteExpiration", (e.target as HTMLInputElement).value)}
              min="1"
              max="365"
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

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="w-full sm:flex-1 h-12 rounded-lg border border-border text-base font-medium text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={createArticle.isPending}
              className="w-full sm:flex-1 h-12 rounded-lg gradient-gold text-primary-foreground text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {createArticle.isPending ? 'Création...' : 'Créer l\'article'}
            </button>
          </div>
        </form>
    </>
  );

  // Rendu conditionnel : Sheet pour mobile, Dialog pour desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0 flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-success/10 via-success/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3 pr-12">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Créer un Nouvel Article
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Stock initial de 0. La quantité sera ajoutée par l'approvisionnement.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default NouvelArticleModal;
