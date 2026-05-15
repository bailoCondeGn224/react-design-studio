import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Trash2, Package, CheckCircle2, Sparkles, TrendingUp, Layers, Upload, X, Image as ImageIcon } from "lucide-react";
import { formatPrixInput, handlePrixChange } from "@/utils/format-prix";
import { useCategoriesActive } from "@/hooks/useCategories";
import { useZonesActive } from "@/hooks/useZones";

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
}

interface BulkArticleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (articles: any[], photos: (File | null)[]) => void;
}

const BulkArticleForm = ({ open, onOpenChange, onSubmit }: BulkArticleFormProps) => {
  const { data: categories = [] } = useCategoriesActive();
  const { data: zones = [] } = useZonesActive();

  const ligneVide: LigneArticle = {
    code: "",
    nom: "",
    description: "",
    categorieId: "",
    zone: "",
    prixAchat: "0",
    prixVente: "0",
    stock: "0",
    seuilAlerte: "10",
    photo: null,
    photoPreview: null
  };

  const [lignes, setLignes] = useState<LigneArticle[]>([{ ...ligneVide }]);

  useEffect(() => {
    if (open) {
      setLignes([{ ...ligneVide }]);
    } else {
      // Nettoyer les previews quand on ferme
      lignes.forEach(ligne => {
        if (ligne.photoPreview) {
          URL.revokeObjectURL(ligne.photoPreview);
        }
      });
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

  const updateLigne = (index: number, field: keyof LigneArticle, value: string) => {
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

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 MB');
      return;
    }

    // Créer le preview
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

  const removePhoto = (index: number) => {
    setLignes(prev => {
      const newLignes = [...prev];
      newLignes[index] = { ...newLignes[index], photo: null, photoPreview: null };
      return newLignes;
    });
  };

  const handleSubmit = () => {
    const lignesValides = lignes.filter(ligne => {
      return ligne.code && ligne.nom && ligne.categorieId && ligne.zone;
    });

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

    const articles = lignesValides.map(ligne => ({
      code: ligne.code.trim(),
      nom: ligne.nom.trim(),
      description: ligne.description.trim(),
      categorieId: ligne.categorieId,
      zone: ligne.zone,
      prixAchat: Number(ligne.prixAchat) || 0,
      prixVente: Number(ligne.prixVente) || 0,
      stock: Number(ligne.stock) || 0,
      seuilAlerte: Number(ligne.seuilAlerte) || 10,
      max: Number(ligne.stock) || 0
    }));

    // Extraire les photos des lignes valides
    const photos = lignesValides.map(ligne => ligne.photo);

    onSubmit(articles, photos);
    onOpenChange(false);
  };

  const formatPrix = (montant: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(montant).replace('GNF', 'GNF');
  };

  const calculerTotaux = () => {
    let totalArticles = lignes.filter(l => l.code && l.nom && l.categorieId && l.zone).length;
    let totalStock = 0;
    let valeurTotale = 0;

    lignes.forEach(ligne => {
      const stock = Number(ligne.stock) || 0;
      const prixAchat = Number(ligne.prixAchat) || 0;
      totalStock += stock;
      valeurTotale += stock * prixAchat;
    });

    return { totalArticles, totalStock, valeurTotale };
  };

  const totaux = calculerTotaux();

  const isLigneValide = (ligne: LigneArticle) => {
    return ligne.code && ligne.nom && ligne.categorieId && ligne.zone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full max-h-[95vh] overflow-hidden flex flex-col p-0 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header avec gradient */}
        <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Ajouter des articles en masse
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Créez plusieurs articles rapidement et efficacement
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Zone de scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Cartes statistiques */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-4 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Articles</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{totaux.totalArticles}</p>
                <p className="text-xs text-muted-foreground mt-1">valides</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-4 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Quantité</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{totaux.totalStock}</p>
                <p className="text-xs text-muted-foreground mt-1">unités</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent border border-violet-500/20 p-4 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Valeur</p>
                </div>
                <p className="text-2xl font-bold text-violet-600">{formatPrix(totaux.valeurTotale)}</p>
                <p className="text-xs text-muted-foreground mt-1">totale</p>
              </div>
            </div>
          </div>

          {/* Liste des articles */}
          <div className="space-y-4">
            {lignes.map((ligne, index) => {
              const valide = isLigneValide(ligne);
              return (
                <div
                  key={index}
                  className={`group relative rounded-xl border-2 transition-all duration-300 ${
                    valide
                      ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-background hover:shadow-xl hover:shadow-emerald-500/10'
                      : 'border-border/50 bg-card hover:shadow-lg'
                  }`}
                >
                  {/* Header de la carte */}
                  <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 ${
                        valide
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-br from-muted to-muted/70 text-muted-foreground'
                      }`}>
                        {valide ? <CheckCircle2 className="w-5 h-5" /> : `#${index + 1}`}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {ligne.nom || `Article ${index + 1}`}
                        </h4>
                        {ligne.code && (
                          <p className="text-xs text-muted-foreground font-mono">{ligne.code}</p>
                        )}
                      </div>
                    </div>

                    {lignes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => supprimerLigne(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-4">
                    {/* Section Photo */}
                    <div className="mb-5">
                      <label className="text-xs font-semibold text-foreground mb-2 block">
                        Photo de l'article
                      </label>

                      {!ligne.photoPreview ? (
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoChange(index, file);
                            }}
                            className="hidden"
                            id={`photo-input-${index}`}
                          />
                          <label
                            htmlFor={`photo-input-${index}`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 rounded-xl cursor-pointer bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 group"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-primary" />
                              </div>
                              <p className="text-sm font-medium text-foreground">
                                Cliquez pour ajouter une photo
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG jusqu'à 5MB
                              </p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="relative group w-full h-32 rounded-xl overflow-hidden border-2 border-primary/30">
                          <img
                            src={ligne.photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay avec boutons */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            <label
                              htmlFor={`photo-input-${index}`}
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                              <ImageIcon className="w-4 h-4" />
                              Changer
                            </label>
                            <Button
                              type="button"
                              onClick={() => removePhoto(index)}
                              size="sm"
                              variant="destructive"
                              className="flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Supprimer
                            </Button>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoChange(index, file);
                            }}
                            className="hidden"
                            id={`photo-input-${index}`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Code Article */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Code Article <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={ligne.code}
                          onChange={(e) => updateLigne(index, 'code', e.target.value)}
                          placeholder="ex: ART001"
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Nom */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Nom <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={ligne.nom}
                          onChange={(e) => updateLigne(index, 'nom', e.target.value)}
                          placeholder="Nom de l'article"
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Catégorie */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Catégorie <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={ligne.categorieId}
                          onChange={(e) => updateLigne(index, 'categorieId', e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="">Sélectionner...</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.nom}</option>
                          ))}
                        </select>
                      </div>

                      {/* Zone */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Zone <span className="text-destructive">*</span>
                        </label>
                        <select
                          value={ligne.zone}
                          onChange={(e) => updateLigne(index, 'zone', e.target.value)}
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="">Sélectionner...</option>
                          {zones.map((zone: any) => (
                            <option key={zone.id} value={zone.code}>{zone.code} - {zone.nom}</option>
                          ))}
                        </select>
                      </div>

                      {/* Prix d'achat */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Prix d'achat (GNF)
                        </label>
                        <input
                          type="text"
                          value={formatPrixInput(ligne.prixAchat)}
                          onChange={(e) => updateLigne(index, 'prixAchat', handlePrixChange(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Prix de vente */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Prix de vente (GNF)
                        </label>
                        <input
                          type="text"
                          value={formatPrixInput(ligne.prixVente)}
                          onChange={(e) => updateLigne(index, 'prixVente', handlePrixChange(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {Number(ligne.prixVente) > 0 && Number(ligne.prixAchat) > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <p className="text-xs font-semibold text-emerald-600">
                              Marge: {(((Number(ligne.prixVente) - Number(ligne.prixAchat)) / Number(ligne.prixVente)) * 100).toFixed(1)}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stock initial */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Stock initial
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ligne.stock}
                          onChange={(e) => updateLigne(index, 'stock', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Seuil d'alerte */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Seuil d'alerte
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={ligne.seuilAlerte}
                          onChange={(e) => updateLigne(index, 'seuilAlerte', e.target.value)}
                          placeholder="10"
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-semibold text-foreground">
                          Description
                        </label>
                        <textarea
                          value={ligne.description}
                          onChange={(e) => updateLigne(index, 'description', e.target.value)}
                          placeholder="Description de l'article (optionnel)"
                          rows={2}
                          className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-xl bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bouton ajouter ligne */}
          <div className="mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={ajouterLigne}
              className="w-full h-14 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-xl text-primary font-semibold transition-all duration-300 group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Ajouter un article
            </Button>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div className="px-6 py-4 border-t bg-gradient-to-r from-muted/50 to-transparent flex gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-xl font-semibold"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
            disabled={totaux.totalArticles === 0}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Enregistrer {totaux.totalArticles > 0 && `(${totaux.totalArticles})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkArticleForm;
