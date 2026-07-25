import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, Package, Camera, Upload, X, ImageIcon, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useZonesActive } from "@/hooks/useZones";
import FormField from "@/components/FormField";
import MobileCombobox from "@/components/MobileCombobox";

type TypeVente = "detail" | "gros" | "gros_et_detail";

interface LigneArticle {
  code: string;
  nom: string;
  description: string;
  categorieId: string;
  zone: string;
  prixAchat: string;
  prixVente: string;
  stock: string;
  seuilAlerte: string;
  photo: File | null;
  photoPreview: string | null;
  uniteStock: string;
  typeVente: TypeVente;
  quantiteGros: string;
  prixGros: string;
  disponibleEnLigne: boolean;
  prixEnLigne: string;
}

interface BulkArticleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (articles: any[], photos: (File | null)[]) => void;
  isSubmitting?: boolean;
}

const BulkArticleForm = ({ open, onOpenChange, onSubmit, isSubmitting = false }: BulkArticleFormProps) => {
  const { data: categories = [] } = useCategoriesActive();
  const { data: zones = [] } = useZonesActive();
  const isMobile = useIsMobile();

  const ligneVide: LigneArticle = {
    code: "",
    nom: "",
    description: "",
    categorieId: "",
    zone: "",
    prixAchat: "",
    prixVente: "",
    stock: "",
    seuilAlerte: "10",
    photo: null,
    photoPreview: null,
    uniteStock: "Unité",
    typeVente: "detail",
    quantiteGros: "12",
    prixGros: "",
    disponibleEnLigne: false,
    prixEnLigne: "",
  };

  const [lignes, setLignes] = useState<LigneArticle[]>([{ ...ligneVide }]);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  // Restaurer l'état depuis sessionStorage au montage
  useEffect(() => {
    const saved = sessionStorage.getItem('bulkArticleFormState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const lignesData = parsed.lignes || parsed;
        if (Array.isArray(lignesData) && lignesData.length > 0) {
          setLignes(lignesData);
        }
        sessionStorage.removeItem('bulkArticleFormState');
      } catch (e) {
        console.error('Erreur restauration formulaire:', e);
        sessionStorage.removeItem('bulkArticleFormState');
      }
    }
  }, []);

  // Sauvegarder l'état dans sessionStorage
  useEffect(() => {
    if (open && lignes.length > 0) {
      const dataToSave = {
        timestamp: Date.now(),
        lignes: lignes.map(ligne => ({ ...ligne, photo: null }))
      };
      sessionStorage.setItem('bulkArticleFormState', JSON.stringify(dataToSave));
    }
  }, [lignes, open]);

  useEffect(() => {
    if (open) {
      const saved = sessionStorage.getItem('bulkArticleFormState');
      if (!saved) {
        setLignes([{ ...ligneVide }]);
      }
    }
  }, [open]);

  const ajouterLigne = () => {
    setLignes(prev => [...prev, { ...ligneVide }]);
  };

  const supprimerLigne = (index: number) => {
    if (lignes.length === 1) {
      toast.error("Vous devez avoir au moins une ligne");
      return;
    }
    setLignes(prev => prev.filter((_, i) => i !== index));
  };

  const updateLigne = (index: number, field: keyof LigneArticle, value: string | TypeVente | boolean) => {
    setLignes(prev => {
      const newLignes = [...prev];
      newLignes[index] = { ...newLignes[index], [field]: value };
      return newLignes;
    });
  };

  const handlePhotoChange = (index: number, file: File | null) => {
    if (!file) {
      setLignes(prev => {
        const newLignes = [...prev];
        newLignes[index] = { ...newLignes[index], photo: null, photoPreview: null };
        return newLignes;
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLignes(prev => {
        const newLignes = [...prev];
        newLignes[index] = {
          ...newLignes[index],
          photo: file,
          photoPreview: reader.result as string
        };
        return newLignes;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    setIsCapturingPhoto(true);
    const dataToSave = {
      timestamp: Date.now(),
      lignes: lignes.map(ligne => ({ ...ligne, photo: null }))
    };
    sessionStorage.setItem('bulkArticleFormState', JSON.stringify(dataToSave));
  };

  const resetForm = () => {
    lignes.forEach(ligne => {
      if (ligne.photoPreview && ligne.photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(ligne.photoPreview);
      }
    });
    sessionStorage.removeItem('bulkArticleFormState');
    setLignes([{ ...ligneVide }]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = () => {
    const lignesValides = lignes.filter(ligne => ligne.code && ligne.nom && ligne.categorieId && ligne.zone);

    if (lignesValides.length === 0) {
      toast.error("Veuillez remplir au moins un article complet");
      return;
    }

    const codes = lignesValides.map(l => l.code.trim());
    const doublons = codes.filter((code, index) => codes.indexOf(code) !== index);
    if (doublons.length > 0) {
      toast.error(`Code(s) en double : ${doublons.join(', ')}`);
      return;
    }

    const articles = lignesValides.map(ligne => {
      const modesVente: any[] = [];
      const prixGros = Number(ligne.prixGros) || 0;
      const qteGros = Number(ligne.quantiteGros) || 12;

      let prixVenteArticle: number;
      if (ligne.typeVente === "gros") {
        prixVenteArticle = prixGros > 0 ? Math.round(prixGros / qteGros) : 0;
      } else {
        prixVenteArticle = Number(ligne.prixVente) || 0;
      }

      if (ligne.typeVente === "detail" || ligne.typeVente === "gros_et_detail") {
        modesVente.push({
          nom: "Détail",
          quantiteStock: 1,
          prixVente: prixVenteArticle,
          parDefaut: ligne.typeVente === "detail",
        });
      }

      if (ligne.typeVente === "gros" || ligne.typeVente === "gros_et_detail") {
        modesVente.push({
          nom: "Gros",
          quantiteStock: qteGros,
          prixVente: prixGros,
          parDefaut: ligne.typeVente === "gros",
        });
      }

      return {
        code: ligne.code.trim(),
        nom: ligne.nom.trim(),
        description: ligne.description.trim(),
        categorieId: ligne.categorieId,
        zone: ligne.zone,
        prixAchat: Number(ligne.prixAchat) || 0,
        prixVente: prixVenteArticle,
        stock: Number(ligne.stock) || 0,
        seuilAlerte: Number(ligne.seuilAlerte) || 10,
        max: Number(ligne.stock) || 0,
        uniteStock: ligne.uniteStock || "Unité",
        modesVente: modesVente.length > 0 ? modesVente : undefined,
        disponibleEnLigne: ligne.disponibleEnLigne,
        prixEnLigne: ligne.prixEnLigne ? Number(ligne.prixEnLigne) : undefined,
      };
    });

    const photos = lignesValides.map(ligne => ligne.photo);
    onSubmit(articles, photos);
    resetForm();
    onOpenChange(false);
  };

  const isLigneValide = (ligne: LigneArticle) => {
    return ligne.code && ligne.nom && ligne.categorieId && ligne.zone;
  };

  const lignesValides = lignes.filter(isLigneValide).length;

  // Rendu d'une carte article
  const renderArticleCard = (ligne: LigneArticle, index: number) => (
    <div key={index} className="border-2 border-border rounded-xl bg-card overflow-hidden">
      {/* Header de la carte */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
            isLigneValide(ligne) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {index + 1}
          </div>
          <span className="font-semibold text-sm">
            {ligne.nom || `Article ${index + 1}`}
          </span>
        </div>
        {lignes.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => supprimerLigne(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Corps de la carte */}
      <div className="p-4 space-y-4">
        {/* Section Photo */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Photo (optionnel)</label>

          {/* Inputs cachés */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoChange(index, file);
              e.target.value = '';
            }}
            className="hidden"
            id={`photo-camera-${index}`}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handlePhotoChange(index, file);
              e.target.value = '';
            }}
            className="hidden"
            id={`photo-gallery-${index}`}
          />

          {ligne.photoPreview ? (
            <div className="relative w-full h-32 rounded-lg border border-border overflow-hidden">
              <img src={ligne.photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handlePhotoChange(index, null)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <label
                htmlFor={`photo-camera-${index}`}
                onClick={handleCameraClick}
                className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-primary/30 rounded-lg cursor-pointer bg-primary text-primary-foreground font-medium text-sm active:scale-[0.98] transition-all"
              >
                <Camera className="w-4 h-4" />
                Photo
              </label>
              <label
                htmlFor={`photo-gallery-${index}`}
                onClick={handleCameraClick}
                className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 text-muted-foreground font-medium text-sm active:scale-[0.98] transition-all"
              >
                <Upload className="w-4 h-4" />
                Galerie
              </label>
            </div>
          )}
        </div>

        {/* Champs du formulaire */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Code *"
            placeholder="ART001"
            value={ligne.code}
            onChange={(e) => updateLigne(index, 'code', (e.target as HTMLInputElement).value)}
            maxLength={20}
          />
          <FormField
            label="Nom *"
            placeholder="Nom de l'article"
            value={ligne.nom}
            onChange={(e) => updateLigne(index, 'nom', (e.target as HTMLInputElement).value)}
            maxLength={100}
          />
        </div>

        {/* Catégorie et Zone */}
        <div className="grid grid-cols-2 gap-3">
          {isMobile ? (
            <>
              <MobileCombobox
                label="Catégorie *"
                value={ligne.categorieId}
                onChange={(value) => updateLigne(index, 'categorieId', value)}
                options={categories.filter(cat => cat.actif).map(cat => ({ value: cat.id, label: cat.nom }))}
                placeholder="Sélectionner..."
                emptyMessage="Aucune catégorie"
              />
              <MobileCombobox
                label="Zone *"
                value={ligne.zone}
                onChange={(value) => updateLigne(index, 'zone', value)}
                options={zones.map(z => ({ value: z.code, label: `${z.code} - ${z.nom}` }))}
                placeholder="Sélectionner..."
                emptyMessage="Aucune zone"
              />
            </>
          ) : (
            <>
              <FormField
                label="Catégorie *"
                as="select"
                value={ligne.categorieId}
                onChange={(e) => updateLigne(index, 'categorieId', (e.target as HTMLSelectElement).value)}
              >
                <option value="">Sélectionner...</option>
                {categories.filter(cat => cat.actif).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </FormField>
              <FormField
                label="Zone *"
                as="select"
                value={ligne.zone}
                onChange={(e) => updateLigne(index, 'zone', (e.target as HTMLSelectElement).value)}
              >
                <option value="">Sélectionner...</option>
                {zones.map(z => (
                  <option key={z.id} value={z.code}>{z.code} - {z.nom}</option>
                ))}
              </FormField>
            </>
          )}
        </div>

        {/* Type de vente */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Type de vente</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'detail', label: 'Détail' },
              { value: 'gros', label: 'Gros' },
              { value: 'gros_et_detail', label: 'Les deux' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateLigne(index, 'typeVente', opt.value as TypeVente)}
                className={`h-10 rounded-lg text-sm font-medium transition-all ${
                  ligne.typeVente === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prix */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Prix d'achat (GNF)</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatPrixInput(ligne.prixAchat)}
              onChange={(e) => updateLigne(index, 'prixAchat', handlePrixChange(e.target.value))}
              className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {ligne.typeVente !== 'gros' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Prix détail (GNF) *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatPrixInput(ligne.prixVente)}
                onChange={(e) => updateLigne(index, 'prixVente', handlePrixChange(e.target.value))}
                className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          )}
        </div>

        {/* Champs Gros si applicable */}
        {(ligne.typeVente === 'gros' || ligne.typeVente === 'gros_et_detail') && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Qté par gros</label>
              <input
                type="number"
                min={2}
                value={ligne.quantiteGros}
                onChange={(e) => updateLigne(index, 'quantiteGros', e.target.value)}
                className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Prix gros (GNF)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatPrixInput(ligne.prixGros)}
                onChange={(e) => updateLigne(index, 'prixGros', handlePrixChange(e.target.value))}
                className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>
        )}

        {/* Stock et seuil */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Stock initial"
            type="number"
            placeholder="0"
            value={ligne.stock}
            onChange={(e) => updateLigne(index, 'stock', (e.target as HTMLInputElement).value)}
            min="0"
          />
          <FormField
            label="Seuil d'alerte"
            type="number"
            placeholder="10"
            value={ligne.seuilAlerte}
            onChange={(e) => updateLigne(index, 'seuilAlerte', (e.target as HTMLInputElement).value)}
            min="0"
          />
        </div>

        {/* Vitrine en ligne */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Disponible en ligne</span>
            </div>
            <Switch
              checked={ligne.disponibleEnLigne}
              onCheckedChange={(checked) => updateLigne(index, 'disponibleEnLigne', checked)}
            />
          </div>
          {ligne.disponibleEnLigne && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Prix en ligne (GNF)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Laisser vide = prix de vente"
                value={formatPrixInput(ligne.prixEnLigne)}
                onChange={(e) => updateLigne(index, 'prixEnLigne', handlePrixChange(e.target.value))}
                className="w-full px-4 h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <p className="text-xs text-muted-foreground">Si vide, le prix de vente sera utilisé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const formContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-base sm:text-lg font-bold">Ajout en masse</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {lignesValides} / {lignes.length} article(s) valide(s)
            </p>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {lignes.map((ligne, index) => renderArticleCard(ligne, index))}

        {/* Bouton ajouter */}
        <Button
          type="button"
          variant="outline"
          onClick={ajouterLigne}
          className="w-full h-12 border-2 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      {/* Footer avec boutons */}
      <div className="p-4 sm:p-6 border-t flex-shrink-0 bg-background">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:flex-1 h-12"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={lignesValides === 0 || isSubmitting}
            className="w-full sm:flex-1 h-12 gradient-gold text-primary-foreground"
          >
            {isSubmitting ? 'En cours...' : `Enregistrer ${lignesValides > 0 ? `(${lignesValides})` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else onOpenChange(true); }}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); else onOpenChange(true); }}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>Ajout d'articles en masse</DialogTitle>
          <DialogDescription>Ajoutez plusieurs articles rapidement</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default BulkArticleForm;
