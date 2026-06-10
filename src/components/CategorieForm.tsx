import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { Categorie } from "@/types";
import { useZonesActive } from "@/hooks/useZones";
import { FolderTree, Tag, FileText, MapPin, CheckCircle, Check } from "lucide-react";

interface CategorieFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: Categorie | null;
  mode?: 'create' | 'edit';
}

const CategorieForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: CategorieFormProps) => {
  const { data: zones = [], isLoading: loadingZones } = useZonesActive();
  const isMobile = useIsMobile();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        nom: initialData.nom || '',
        code: initialData.code || '',
        description: initialData.description || '',
        actif: initialData.actif ?? true,
        zoneId: (initialData as any).zoneId || '',
      };
    }
    return {
      nom: '',
      code: '',
      description: '',
      actif: true,
      zoneId: '',
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (open) {
      setForm(getInitialState());
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom.trim() || !form.code.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const categorieData = {
      nom: form.nom.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      actif: form.actif,
      zoneId: form.zoneId || undefined,
    };

    if (mode === 'edit' && initialData) {
      onSubmit({ id: initialData.id, data: categorieData });
    } else {
      onSubmit(categorieData);
    }

    setForm(getInitialState());
    onOpenChange(false);
  };

  const formContent = (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header avec gradient */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-12">
            <div className="hidden md:flex w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg flex-shrink-0">
              <FolderTree className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                <span className="md:hidden">{mode === 'edit' ? 'Modifier' : 'Catégorie'}</span>
                <span className="hidden md:inline">{mode === 'edit' ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {mode === 'edit' ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie de produits'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5">
        {/* Section Informations - Primary */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Informations principales *</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                placeholder="Ex: Abayas"
                value={form.nom}
                onChange={e => update("nom", e.target.value)}
                maxLength={100}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Code *
              </label>
              <input
                type="text"
                placeholder="Ex: ABY"
                value={form.code}
                onChange={e => update("code", e.target.value.toUpperCase())}
                maxLength={10}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Le code sera automatiquement converti en majuscules
              </p>
            </div>
          </div>
        </div>

        {/* Section Description */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/30 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Description (optionnelle)</h3>
            </div>
            <textarea
              placeholder="Description de la catégorie"
              value={form.description}
              onChange={e => update("description", e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Section Zone */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-secondary-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Zone d'entreposage</h3>
            </div>
            <div>
              <select
                value={form.zoneId}
                onChange={e => update("zoneId", e.target.value)}
                disabled={loadingZones}
                className="w-full px-3 h-11 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Aucune zone</option>
                {zones.map((zone: any) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.code} — {zone.nom}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Associez cette catégorie à une zone d'entreposage spécifique
              </p>
            </div>
          </div>
        </div>

        {/* Section Statut */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/5 via-background to-background border-2 border-border p-4 sm:p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Statut</h3>
            </div>
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success/20">
              <input
                type="checkbox"
                id="actif"
                checked={form.actif}
                onChange={e => update("actif", e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded flex-shrink-0"
              />
              <div className="flex-1">
                <label htmlFor="actif" className="text-sm font-medium text-foreground cursor-pointer block">
                  Catégorie active
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Les catégories actives sont visibles lors de la création d'articles
                </p>
              </div>
            </div>
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
              const dialogContent = e.target.closest('[role="dialog"]');
              const formElement = dialogContent?.querySelector('form');
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            className="w-full sm:w-auto"
          >
            <Check className="w-4 h-4 mr-2" />
            {mode === 'edit' ? 'Enregistrer les modifications' : 'Créer la catégorie'}
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl h-[90vh] flex flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="sr-only">
          <DialogTitle>{mode === 'edit' ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie de produits'}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default CategorieForm;
