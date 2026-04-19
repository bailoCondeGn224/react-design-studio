import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import { useParametres, useUpdateParametres, useUploadLogo } from '@/hooks/useParametres';
import { parametresApi } from '@/api/parametres';
import { Save, Building2, Mail, Phone, MapPin, Globe, FileText, DollarSign, Upload, Image as ImageIcon, Edit, X } from 'lucide-react';
import { toast } from 'sonner';

const Parametres = () => {
  const { data: parametres, isLoading } = useParametres();
  const updateParametres = useUpdateParametres();
  const uploadLogo = useUploadLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    nomComplet: parametres?.nomComplet || '',
    nomCourt: parametres?.nomCourt || '',
    slogan: parametres?.slogan || '',
    logo: parametres?.logo || '',
    email: parametres?.email || '',
    telephone: parametres?.telephone || '',
    adresse: parametres?.adresse || '',
    siteWeb: parametres?.siteWeb || '',
    rccm: parametres?.rccm || '',
    nif: parametres?.nif || '',
    registreCommerce: parametres?.registreCommerce || '',
    devise: parametres?.devise || 'GNF',
    mentionsLegales: parametres?.mentionsLegales || '',
  });

  // Mettre à jour le formulaire quand les données sont chargées
  useEffect(() => {
    if (parametres) {
      setFormData({
        nomComplet: parametres.nomComplet,
        nomCourt: parametres.nomCourt,
        slogan: parametres.slogan || '',
        logo: parametres.logo || '',
        email: parametres.email,
        telephone: parametres.telephone,
        adresse: parametres.adresse,
        siteWeb: parametres.siteWeb || '',
        rccm: parametres.rccm || '',
        nif: parametres.nif || '',
        registreCommerce: parametres.registreCommerce || '',
        devise: parametres.devise,
        mentionsLegales: parametres.mentionsLegales || '',
      });
      // Définir le logo comme preview si disponible
      if (parametres.logo) {
        setLogoPreview(parametresApi.getLogoUrl());
      }
    }
  }, [parametres]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation basique
    if (!formData.nomComplet || !formData.nomCourt || !formData.email || !formData.telephone || !formData.adresse) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    updateParametres.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    if (parametres) {
      setFormData({
        nomComplet: parametres.nomComplet,
        nomCourt: parametres.nomCourt,
        slogan: parametres.slogan || '',
        logo: parametres.logo || '',
        email: parametres.email,
        telephone: parametres.telephone,
        adresse: parametres.adresse,
        siteWeb: parametres.siteWeb || '',
        rccm: parametres.rccm || '',
        nif: parametres.nif || '',
        registreCommerce: parametres.registreCommerce || '',
        devise: parametres.devise,
        mentionsLegales: parametres.mentionsLegales || '',
      });
      setLogoPreview(null);
    }
    setIsEditing(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.match(/image\/(jpg|jpeg|png|gif|webp|svg\+xml)/)) {
      toast.error('Format de fichier non supporté. Utilisez jpg, png, gif, webp ou svg');
      return;
    }

    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Uploader le fichier
    uploadLogo.mutate(file);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement des paramètres...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <PageHeader
          title="Paramètres de l'Entreprise"
          description="Configurez les informations de votre entreprise pour les factures et reçus"
        />
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="gradient-gold text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-elevated hover:opacity-90 transition-opacity w-full sm:w-auto whitespace-nowrap"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Informations Générales */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 shadow-card">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Informations Générales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Nom Complet <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="nomComplet"
                value={formData.nomComplet}
                onChange={handleChange}
                placeholder="Ex: Walli Industrie SARL"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Utilisé sur les factures et documents officiels</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Nom Court <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="nomCourt"
                value={formData.nomCourt}
                onChange={handleChange}
                placeholder="Ex: Walli"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Affiché dans le menu latéral</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Slogan</label>
              <input
                type="text"
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                placeholder="Ex: Mode & Tradition"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Logo de l'entreprise</label>
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Preview area */}
                <div className="flex-shrink-0">
                  {logoPreview || parametres?.logo ? (
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg border-2 border-border overflow-hidden bg-muted">
                      <img
                        src={logoPreview || parametresApi.getLogoUrl()}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleLogoClick}
                    disabled={!isEditing || uploadLogo.isPending}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadLogo.isPending ? 'Téléchargement...' : 'Choisir un fichier'}
                  </button>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                    Formats acceptés: JPG, PNG, GIF, WebP, SVG (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 shadow-card">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Coordonnées</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Téléphone <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+224 XXX XX XX XX"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                Adresse <span className="text-destructive">*</span>
              </label>
              <textarea
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Adresse complète de l'entreprise"
                rows={2}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Site Web</label>
              <input
                type="url"
                name="siteWeb"
                value={formData.siteWeb}
                onChange={handleChange}
                placeholder="www.entreprise.com"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Informations Légales */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 shadow-card">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Informations Légales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">RCCM</label>
              <input
                type="text"
                name="rccm"
                value={formData.rccm}
                onChange={handleChange}
                placeholder="Numéro RCCM"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">NIF</label>
              <input
                type="text"
                name="nif"
                value={formData.nif}
                onChange={handleChange}
                placeholder="Numéro NIF"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Registre de Commerce</label>
              <input
                type="text"
                name="registreCommerce"
                value={formData.registreCommerce}
                onChange={handleChange}
                placeholder="Numéro registre"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Paramètres de Facturation */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 md:p-6 shadow-card">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Paramètres de Facturation</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Devise</label>
              <input
                type="text"
                name="devise"
                value={formData.devise}
                onChange={handleChange}
                placeholder="GNF"
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Mentions Légales</label>
              <textarea
                name="mentionsLegales"
                value={formData.mentionsLegales}
                onChange={handleChange}
                placeholder="Mentions légales affichées sur les factures"
                rows={3}
                disabled={!isEditing}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Boutons de soumission */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateParametres.isPending}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={updateParametres.isPending}
              className="w-full sm:w-auto gradient-gold text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateParametres.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </form>
    </AppLayout>
  );
};

export default Parametres;
