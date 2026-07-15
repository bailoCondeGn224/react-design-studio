import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import FormField from "@/components/FormField";
import MobileCombobox from "@/components/MobileCombobox";
import { toast } from "sonner";
import { useCategoriesActive } from "@/hooks/useCategories";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { ImageIcon, Upload, X, Camera, Layers } from "lucide-react";
import { getPhotoUrl } from "@/lib/api-client";
import { ModeVenteInline } from '@/types';
import { TypeVenteSelector, TypeVente } from "./TypeVenteSelector";

interface StockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

function inferTypeVenteFromModes(modes: ModeVenteInline[] | undefined): {
  typeVente: TypeVente;
  quantiteGros: number;
  prixGros: number;
} {
  if (!modes || modes.length === 0) {
    return { typeVente: "detail", quantiteGros: 12, prixGros: 0 };
  }

  const modeDetail = modes.find((m) => m.quantiteStock === 1);
  const modeGros = modes.find((m) => m.quantiteStock > 1);

  if (modeDetail && modeGros) {
    return {
      typeVente: "gros_et_detail",
      quantiteGros: modeGros.quantiteStock,
      prixGros: modeGros.prixVente,
    };
  } else if (modeGros) {
    return {
      typeVente: "gros",
      quantiteGros: modeGros.quantiteStock,
      prixGros: modeGros.prixVente,
    };
  } else {
    return {
      typeVente: "detail",
      quantiteGros: 12,
      prixGros: 0,
    };
  }
}

const StockForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: StockFormProps) => {
  const { data: categories = [], isLoading: loadingCategories } = useCategoriesActive();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        ...initialData,
        categorieId: initialData.categorieId || '',
        stock: String(initialData.stock),
        seuilAlerte: String(initialData.seuilAlerte),
        prixVente: initialData.prixVente?.toString().replace(' GNF', '') || '',
        prixAchat: initialData.prixAchat?.toString().replace(' GNF', '') || '',
        reference: initialData.reference || '',
        dateExpiration: initialData.dateExpiration || '',
        delaiAlerteExpiration: initialData.delaiAlerteExpiration?.toString() || '30',
        uniteStock: initialData.uniteStock || 'Unité',
        modesVente: initialData.modesVente?.map((m: any) => ({
          nom: m.nom,
          quantiteStock: m.quantiteStock,
          prixVente: m.prixVente,
          codeBarre: m.codeBarre,
          parDefaut: m.parDefaut,
        })) || [],
      };
    }
    return {
      nom: "",
      reference: "",
      categorieId: "",
      zone: "A",
      stock: "",
      seuilAlerte: "",
      prixVente: "",
      prixAchat: "",
      dateExpiration: "",
      delaiAlerteExpiration: "30",
      uniteStock: "Unité",
      modesVente: [] as ModeVenteInline[],
    };
  };

  const [form, setForm] = useState(getInitialState());
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [typeVente, setTypeVente] = useState<TypeVente>("detail");
  const [quantiteGros, setQuantiteGros] = useState(12);
  const [prixGros, setPrixGros] = useState(0);
  const isMobile = useIsMobile();

  // Gérer la fermeture du dialog/sheet en bloquant pendant la capture photo
  const handleOpenChange = (newOpen: boolean) => {
    // Ne pas fermer si on est en train de capturer une photo
    if (!newOpen && isCapturingPhoto) {
      return;
    }
    onOpenChange(newOpen);
  };

  // Restaurer l'état depuis sessionStorage au montage (mode create seulement)
  useEffect(() => {
    if (mode === 'create') {
      const saved = sessionStorage.getItem('stockFormState');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm(parsed.form);
          if (parsed.photoPreview) {
            setPhotoPreview(parsed.photoPreview);
          }
          sessionStorage.removeItem('stockFormState');
        } catch (e) {
          console.error('Erreur restauration formulaire:', e);
        }
      }
    }
  }, [mode]);

  // Sauvegarder l'état dans sessionStorage quand le formulaire change (mode create seulement)
  useEffect(() => {
    if (open && mode === 'create') {
      const dataToSave = {
        form,
        photoPreview,
      };
      sessionStorage.setItem('stockFormState', JSON.stringify(dataToSave));
    }
  }, [form, photoPreview, open, mode]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        ...initialData,
        stock: String(initialData.stock),
        seuilAlerte: String(initialData.seuilAlerte),
        prixVente: initialData.prixVente?.replace(' GNF', '') || '',
        prixAchat: initialData.prixAchat?.replace(' GNF', '') || '',
        reference: initialData.reference || '',
        dateExpiration: initialData.dateExpiration || '',
        delaiAlerteExpiration: initialData.delaiAlerteExpiration?.toString() || '30',
        uniteStock: initialData.uniteStock || 'Unité',
        modesVente: initialData.modesVente?.map((m: any) => ({
          nom: m.nom,
          quantiteStock: m.quantiteStock,
          prixVente: m.prixVente,
          codeBarre: m.codeBarre,
          parDefaut: m.parDefaut,
        })) || [],
      });

      // Initialize typeVente state from existing modes
      const venteConfig = inferTypeVenteFromModes(initialData.modesVente);
      setTypeVente(venteConfig.typeVente);
      setQuantiteGros(venteConfig.quantiteGros);
      setPrixGros(venteConfig.prixGros);

      // Afficher la photo existante si présente
      if (initialData.photo) {
        setPhotoPreview(getPhotoUrl(initialData.photo));
      } else {
        setPhotoPreview(null);
      }
      setPhotoFile(null); // Pas de fichier (juste l'aperçu depuis l'URL)
    }

    // NE PAS nettoyer sessionStorage ici automatiquement
    // Le nettoyage se fait uniquement lors d'une fermeture intentionnelle (annuler/soumettre)
  }, [mode, initialData, open]);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Désactiver le flag de capture
    setIsCapturingPhoto(false);

    const file = e.target.files?.[0];
    if (!file) return;

    // Valider la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux. Taille maximale: 5MB");
      e.target.value = ''; // Reset input
      return;
    }

    // Valider le type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Format non supporté. Utilisez JPG, PNG ou WEBP");
      e.target.value = ''; // Reset input
      return;
    }

    setPhotoFile(file);

    // Générer l'aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input pour permettre de re-sélectionner le même fichier
    e.target.value = '';
  };

  // Déclencher la capture photo (sauvegarde IMMÉDIATE avant d'ouvrir la caméra)
  const handleCameraClick = () => {
    setIsCapturingPhoto(true);

    // CRITIQUE: Sauvegarder immédiatement AVANT d'ouvrir la caméra
    // Car l'OS mobile peut décharger l'app web de la mémoire
    if (mode === 'create') {
      const dataToSave = {
        form,
        photoPreview,
        timestamp: Date.now(), // Pour vérifier la fraîcheur des données
      };
      sessionStorage.setItem('stockFormState', JSON.stringify(dataToSave));
    }
  };

  // Réinitialiser le flag quand la fenêtre reprend le focus (si l'utilisateur annule la caméra)
  useEffect(() => {
    const handleFocus = () => {
      // Petit délai pour laisser le temps à handlePhotoChange de s'exécuter si une photo a été prise
      setTimeout(() => {
        setIsCapturingPhoto(false);
      }, 500);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.categorieId || !form.seuilAlerte || !form.prixVente.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Générer les modes de vente en fonction du type sélectionné
    const generatedModesVente: ModeVenteInline[] = [];

    if (typeVente === "detail" || typeVente === "gros_et_detail") {
      generatedModesVente.push({
        nom: "Détail",
        quantiteStock: 1,
        prixVente: Number(form.prixVente),
        parDefaut: typeVente === "detail",
      });
    }

    if (typeVente === "gros" || typeVente === "gros_et_detail") {
      generatedModesVente.push({
        nom: "Gros",
        quantiteStock: quantiteGros,
        prixVente: prixGros || Number(form.prixVente) * quantiteGros,
        parDefaut: typeVente === "gros",
      });
    }

    const articleData = {
      nom: form.nom,
      reference: form.reference || undefined,
      categorieId: form.categorieId,
      zone: form.zone,
      stock: Number(form.stock) || 0,
      seuilAlerte: Number(form.seuilAlerte),
      prixVente: Number(form.prixVente),
      prixAchat: form.prixAchat ? Number(form.prixAchat) : undefined,
      dateExpiration: form.dateExpiration || undefined,
      delaiAlerteExpiration: form.delaiAlerteExpiration ? Number(form.delaiAlerteExpiration) : undefined,
      uniteStock: form.uniteStock || 'Unité',
      modesVente: generatedModesVente.length > 0 ? generatedModesVente : undefined,
    };

    // Ne passer photo que si un nouveau fichier a été sélectionné
    const submitData: any = { ...articleData, id: form.id };
    if (photoFile) {
      submitData.photo = photoFile;
    }

    onSubmit(submitData);

    // Nettoyer sessionStorage après soumission réussie
    sessionStorage.removeItem('stockFormState');

    setForm(getInitialState());
    setPhotoFile(null);
    setPhotoPreview(null);
    onOpenChange(false);
  };

  // Fonction pour annuler et nettoyer
  const handleCancel = () => {
    sessionStorage.removeItem('stockFormState');
    setForm(getInitialState());
    setPhotoFile(null);
    setPhotoPreview(null);
    onOpenChange(false);
  };

  const formContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 sm:p-6 border-b flex-shrink-0">
        <h2 className="font-heading text-base sm:text-lg font-bold">
          {mode === 'edit' ? 'Modifier l\'Article' : 'Nouvel Article'}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {mode === 'edit' ? 'Modifiez toutes les informations de l\'article' : 'Ajoutez un nouvel article au stock'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0 p-4 sm:p-6">
          <FormField label="Nom de l'article *" placeholder="Ex: Abaya Noire Premium" value={form.nom} onChange={e => update("nom", (e.target as HTMLInputElement).value)} maxLength={100} />
          <FormField label="Référence (SKU)" placeholder="Ex: ABY-001" value={form.reference} onChange={e => update("reference", (e.target as HTMLInputElement).value)} maxLength={50} />
          <FormField
            label="Unité de stock"
            placeholder="Ex: Bouteille, Kilo, Pièce"
            value={form.uniteStock}
            onChange={e => update("uniteStock", (e.target as HTMLInputElement).value)}
            maxLength={50}
          />

          {/* Photo Upload - Optimisé mobile */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Photo de l'article (optionnel)
            </label>

            {/* Version mobile: pleine largeur */}
            <div className="md:hidden">
              {photoPreview ? (
                <div className="relative w-full rounded-xl border-2 border-border overflow-hidden bg-muted/30">
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="flex items-center gap-2 px-4 h-11 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold active:scale-95 transition-transform"
                    >
                      <X className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-2">
                  {/* Input pour caméra */}
                  <input
                    type="file"
                    id="photo-camera-edit-mobile"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {/* Input pour galerie */}
                  <input
                    type="file"
                    id="photo-gallery-edit-mobile"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                  {/* Bouton Prendre une photo */}
                  <label
                    htmlFor="photo-camera-edit-mobile"
                    onClick={handleCameraClick}
                    className="flex items-center justify-center gap-2 w-full h-14 border-2 border-primary/30 rounded-xl cursor-pointer bg-primary text-primary-foreground active:scale-[0.98] transition-all font-semibold"
                  >
                    <Camera className="w-5 h-5" />
                    Prendre une photo
                  </label>

                  {/* Bouton Choisir depuis galerie */}
                  <label
                    htmlFor="photo-gallery-edit-mobile"
                    onClick={handleCameraClick}
                    className="flex items-center justify-center gap-2 w-full h-14 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 active:bg-primary/10 active:scale-[0.98] transition-all font-medium"
                  >
                    <Upload className="w-5 h-5 text-primary" />
                    Choisir depuis la galerie
                  </label>
                </div>
              )}
            </div>

            {/* Version desktop: horizontal */}
            <div className="hidden md:flex items-center gap-4">
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
                  id="photo-upload-edit-desktop"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload-edit-desktop"
                  onClick={handleCameraClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium cursor-pointer hover:bg-secondary transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {photoPreview ? 'Changer la photo' : 'Choisir une photo'}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG ou WEBP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Mobile: MobileCombobox avec Sheet */}
            <div className="md:hidden">
              <MobileCombobox
                label="Catégorie"
                value={form.categorieId}
                onChange={(value) => update("categorieId", value)}
                options={categories
                  .filter(cat => cat.actif)
                  .map(cat => ({ value: cat.id, label: cat.nom }))}
                placeholder="Rechercher une catégorie..."
                disabled={loadingCategories}
                required
                emptyMessage="Aucune catégorie trouvée"
              />
            </div>

            {/* Desktop: Select standard */}
            <div className="hidden md:block">
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
            </div>

            {/* Mobile: Zone avec MobileCombobox */}
            <div className="md:hidden">
              <MobileCombobox
                label="Zone de stockage"
                value={form.zone}
                onChange={(value) => update("zone", value)}
                options={[
                  { value: "A", label: "Zone A" },
                  { value: "B", label: "Zone B" },
                  { value: "C", label: "Zone C" },
                  { value: "D", label: "Zone D" },
                  { value: "E", label: "Zone E" },
                ]}
                placeholder="Rechercher une zone..."
                required
                emptyMessage="Aucune zone trouvée"
              />
            </div>

            {/* Desktop: Zone select standard */}
            <div className="hidden md:block">
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
          </div>

          {/* Stock et seuils */}
          <div className="grid grid-cols-1 gap-3">
            <FormField
              label="Stock actuel *"
              type="number"
              placeholder="100"
              value={form.stock}
              onChange={e => update("stock", (e.target as HTMLInputElement).value)}
              min="0"
            />
            <FormField
              label="Seuil alerte *"
              type="number"
              placeholder="10"
              value={form.seuilAlerte}
              onChange={e => update("seuilAlerte", (e.target as HTMLInputElement).value)}
              min="0"
            />
          </div>

          {/* Date d'expiration */}
          <div className="grid grid-cols-1 gap-3">
            <FormField
              label="Date d'expiration (optionnel)"
              type="date"
              value={form.dateExpiration}
              onChange={e => update("dateExpiration", (e.target as HTMLInputElement).value)}
            />
            <FormField
              label="Délai d'alerte expiration (jours)"
              type="number"
              placeholder="30"
              value={form.delaiAlerteExpiration}
              onChange={e => update("delaiAlerteExpiration", (e.target as HTMLInputElement).value)}
              min="1"
              max="365"
            />
          </div>

          {/* Prix */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Prix de vente (GNF) <span className="text-destructive">*</span></label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="85 000"
                value={formatPrixInput(form.prixVente)}
                onChange={e => update("prixVente", handlePrixChange(e.target.value))}
                className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 text-base"
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
                className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 text-base"
              />
            </div>
          </div>

          {/* Section Type de Vente - Simplifiée */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
            <TypeVenteSelector
              value={typeVente}
              onChange={setTypeVente}
              uniteStock={form.uniteStock}
              quantiteGros={quantiteGros}
              onQuantiteGrosChange={(q) => {
                setQuantiteGros(q);
                // Auto-calculer prix gros si pas encore défini
                if (prixGros === 0 && form.prixVente) {
                  setPrixGros(Number(form.prixVente) * q);
                }
              }}
            />

            {/* Champ prix gros - visible si gros sélectionné */}
            {(typeVente === "gros" || typeVente === "gros_et_detail") && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Prix de vente en gros (GNF)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatPrixInput(prixGros)}
                    onChange={(e) => setPrixGros(Number(handlePrixChange(e.target.value)))}
                    className="w-32 px-3 h-11 rounded-lg border border-border bg-card text-base font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <span className="text-sm text-muted-foreground">GNF</span>
                </div>
                {form.prixVente && (
                  <p className="text-xs text-muted-foreground">
                    Prix suggéré sans remise: {(Number(form.prixVente) * quantiteGros).toLocaleString()} GNF
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Boutons - Touch-friendly */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:flex-1 h-12 rounded-lg border border-border text-base font-medium text-muted-foreground hover:bg-secondary active:scale-[0.98] transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 h-12 rounded-lg gradient-gold text-primary-foreground text-base font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === 'edit' ? 'Modifier l\'Article' : 'Nouvel Article'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez toutes les informations de l\'article' : 'Ajoutez un nouvel article au stock'}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default StockForm;
