import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FormField from "@/components/FormField";
import { toast } from "sonner";
import { usePlans } from "@/hooks/usePlans";

interface OrganizationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  mode?: 'create' | 'edit';
}

const OrganizationForm = ({ open, onOpenChange, onSubmit, initialData = null, mode = 'create' }: OrganizationFormProps) => {
  const { data: plans = [] } = usePlans();

  const getInitialState = () => {
    if (mode === 'edit' && initialData) {
      return {
        nom: initialData.nom || "",
        slug: initialData.slug || "",
        planId: initialData.planId || "",
        actif: initialData.actif !== undefined ? initialData.actif : true,
        nomCourt: initialData.nomCourt || "",
        slogan: initialData.slogan || "",
        email: initialData.email || "",
        telephone: initialData.telephone || "",
        adresse: initialData.adresse || "",
        siteWeb: initialData.siteWeb || "",
        rccm: initialData.rccm || "",
        nif: initialData.nif || "",
        registreCommerce: initialData.registreCommerce || "",
        devise: initialData.devise || "GNF",
        mentionsLegales: initialData.mentionsLegales || "",
        abonnementExpire: initialData.abonnementExpire || "",
      };
    }
    return {
      nom: "",
      slug: "",
      planId: "",
      actif: true,
      nomCourt: "",
      slogan: "",
      email: "",
      telephone: "",
      adresse: "",
      siteWeb: "",
      rccm: "",
      nif: "",
      registreCommerce: "",
      devise: "GNF",
      mentionsLegales: "",
      abonnementExpire: "",
    };
  };

  const [form, setForm] = useState(getInitialState());

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm(getInitialState());
    }
  }, [mode, initialData, open]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  // Générer automatiquement le slug à partir du nom
  const handleNomChange = (value: string) => {
    update("nom", value);
    if (mode === 'create') {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      update("slug", slug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nom.trim()) {
      toast.error("Le nom de l'organization est obligatoire");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Le slug est obligatoire");
      return;
    }
    if (!form.planId) {
      toast.error("Veuillez sélectionner un plan");
      return;
    }

    const organizationData = {
      nom: form.nom,
      slug: form.slug,
      planId: form.planId,
      actif: form.actif,
      nomCourt: form.nomCourt || undefined,
      slogan: form.slogan || undefined,
      email: form.email || undefined,
      telephone: form.telephone || undefined,
      adresse: form.adresse || undefined,
      siteWeb: form.siteWeb || undefined,
      rccm: form.rccm || undefined,
      nif: form.nif || undefined,
      registreCommerce: form.registreCommerce || undefined,
      devise: form.devise || "GNF",
      mentionsLegales: form.mentionsLegales || undefined,
      abonnementExpire: form.abonnementExpire || undefined,
    };

    onSubmit(organizationData);
    setForm(getInitialState());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto elegant-scroll">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {mode === 'edit' ? "Modifier l'Organization" : 'Nouvelle Organization'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? "Modifiez les informations de l'organization"
              : 'Créez une nouvelle organization. Vous pourrez ensuite créer les utilisateurs via la page Utilisateurs.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations principales */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Informations principales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Nom complet *"
                placeholder="Ex: Walli Industrie SARL"
                value={form.nom}
                onChange={e => handleNomChange((e.target as HTMLInputElement).value)}
                maxLength={100}
              />
              <FormField
                label="Nom court"
                placeholder="Ex: Walli"
                value={form.nomCourt}
                onChange={e => update("nomCourt", (e.target as HTMLInputElement).value)}
                maxLength={50}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Slug *"
                placeholder="Ex: walli-industrie"
                value={form.slug}
                onChange={e => update("slug", (e.target as HTMLInputElement).value)}
                maxLength={100}
                disabled={mode === 'edit'}
              />
              <FormField
                label="Slogan"
                placeholder="Ex: Mode & Tradition"
                value={form.slogan}
                onChange={e => update("slogan", (e.target as HTMLInputElement).value)}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan <span className="text-destructive">*</span></label>
                <select
                  value={form.planId}
                  onChange={e => update("planId", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Sélectionner un plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nom} - {plan.prixMensuel} GNF/mois
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <select
                  value={form.actif ? "true" : "false"}
                  onChange={e => update("actif", e.target.value === "true")}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <FormField
              label="Date d'expiration de l'abonnement"
              type="date"
              value={form.abonnementExpire}
              onChange={e => update("abonnementExpire", (e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Coordonnées */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Coordonnées</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Email"
                type="email"
                placeholder="contact@organization.com"
                value={form.email}
                onChange={e => update("email", (e.target as HTMLInputElement).value)}
                maxLength={100}
              />
              <FormField
                label="Téléphone"
                type="tel"
                placeholder="+224 123 456 789"
                value={form.telephone}
                onChange={e => update("telephone", (e.target as HTMLInputElement).value)}
                maxLength={20}
              />
            </div>

            <FormField
              label="Adresse"
              as="textarea"
              placeholder="Adresse complète"
              value={form.adresse}
              onChange={e => update("adresse", (e.target as HTMLTextAreaElement).value)}
              maxLength={200}
            />

            <FormField
              label="Site Web"
              type="url"
              placeholder="www.organization.com"
              value={form.siteWeb}
              onChange={e => update("siteWeb", (e.target as HTMLInputElement).value)}
              maxLength={100}
            />
          </div>

          {/* Informations légales */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Informations légales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField
                label="RCCM"
                placeholder="Numéro RCCM"
                value={form.rccm}
                onChange={e => update("rccm", (e.target as HTMLInputElement).value)}
                maxLength={50}
              />
              <FormField
                label="NIF"
                placeholder="Numéro NIF"
                value={form.nif}
                onChange={e => update("nif", (e.target as HTMLInputElement).value)}
                maxLength={50}
              />
              <FormField
                label="Registre de Commerce"
                placeholder="Numéro registre"
                value={form.registreCommerce}
                onChange={e => update("registreCommerce", (e.target as HTMLInputElement).value)}
                maxLength={50}
              />
            </div>
          </div>

          {/* Paramètres de facturation */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Paramètres de facturation</h3>
            <FormField
              label="Devise"
              placeholder="GNF"
              value={form.devise}
              onChange={e => update("devise", (e.target as HTMLInputElement).value)}
              maxLength={3}
            />

            <FormField
              label="Mentions légales"
              as="textarea"
              placeholder="Mentions légales affichées sur les factures"
              value={form.mentionsLegales}
              onChange={e => update("mentionsLegales", (e.target as HTMLTextAreaElement).value)}
              maxLength={500}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 gradient-gold text-primary-foreground px-4 py-2.5 rounded-lg font-semibold shadow-elevated hover:opacity-90 transition-opacity"
            >
              {mode === 'edit' ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationForm;
