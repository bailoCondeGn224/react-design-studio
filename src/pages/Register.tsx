import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { registerOrganization } from "@/api/organizations";
import { RegisterOrganizationDto } from "@/types";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState<RegisterOrganizationDto>({
    nom: "",
    slug: "",
    email: "",
    telephone: "",
    proprietaire: {
      nom: "",
      email: "",
      telephone: "",
    },
    adresse: "",
    slogan: "",
    nomCourt: "",
  });

  // Mutation pour l'inscription
  const registerMutation = useMutation({
    mutationFn: registerOrganization,
    onSuccess: (data) => {
      setIsSuccess(true);
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de l'inscription";
      toast.error(message);
    },
  });

  // Générer le slug automatiquement à partir du nom
  const generateSlug = (nom: string) => {
    return nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères spéciaux par des tirets
      .replace(/^-+|-+$/g, ""); // Enlever les tirets au début et à la fin
  };

  const handleChange = (field: string, value: string) => {
    if (field.startsWith("proprietaire.")) {
      const propField = field.replace("proprietaire.", "");
      setFormData({
        ...formData,
        proprietaire: {
          ...formData.proprietaire,
          [propField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
        // Auto-générer le slug quand on change le nom
        ...(field === "nom" ? { slug: generateSlug(value) } : {}),
      });
    }
  };

  const validateStep1 = () => {
    if (!formData.nom || !formData.email || !formData.telephone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    if (!formData.email.includes("@")) {
      toast.error("Email invalide");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.proprietaire.nom || !formData.proprietaire.email || !formData.proprietaire.telephone) {
      toast.error("Veuillez remplir tous les champs du propriétaire");
      return false;
    }
    if (!formData.proprietaire.email.includes("@")) {
      toast.error("Email du propriétaire invalide");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      registerMutation.mutate(formData);
    }
  };

  // Écran de succès
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Demande envoyée !
          </h2>
          <p className="text-muted-foreground">
            Votre demande d'inscription pour <strong>{formData.nom}</strong> a été soumise avec succès.
          </p>
          <p className="text-muted-foreground">
            Vous recevrez un SMS au <strong>{formData.proprietaire.telephone}</strong> une fois votre compte approuvé avec vos identifiants de connexion.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full gradient-gold text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            Retour à la connexion
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 pattern-islamic opacity-5" />
        <div className="absolute inset-0 gradient-dark opacity-90" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-sidebar-foreground w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-sidebar-accent-foreground">
                Walli Industrie
              </h1>
              <p className="text-sm text-sidebar-foreground/70">Gestion de Boutique</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-heading text-4xl font-bold text-sidebar-accent-foreground leading-tight">
              Créez votre espace de gestion
            </h2>
            <p className="text-lg text-sidebar-foreground/80 max-w-md">
              Rejoignez des centaines de commerçants qui gèrent efficacement leur boutique avec Walli Industrie.
            </p>

            <div className="space-y-4 pt-6">
              {[
                "Inscription gratuite",
                "Validation rapide",
                "Support dédié",
                "Fonctionnalités complètes"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-sidebar-foreground/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-sidebar-foreground/60">
            © 2026 Walli Industrie. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl gradient-gold flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Walli Industrie
              </h1>
              <p className="text-sm text-muted-foreground">Gestion de Boutique</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Organisation</span>
            </div>
            <div className="w-12 h-0.5 bg-muted" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Propriétaire</span>
            </div>
          </div>

          {/* Form Title */}
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              {step === 1 ? "Informations de l'organisation" : "Informations du propriétaire"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {step === 1
                ? "Renseignez les informations de votre entreprise"
                : "Renseignez vos informations personnelles (administrateur)"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                {/* Nom de l'organisation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nom de l'organisation *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => handleChange("nom", e.target.value)}
                      placeholder="Ma Boutique"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Identifiant URL (slug)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="ma-boutique"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sera utilisé dans l'URL : walliindustrie.com/{formData.slug || "ma-boutique"}
                  </p>
                </div>

                {/* Email organisation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email de l'organisation *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="contact@maboutique.com"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Téléphone organisation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Téléphone de l'organisation *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => handleChange("telephone", e.target.value)}
                      placeholder="+224 6XX XXX XXX"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.adresse || ""}
                      onChange={(e) => handleChange("adresse", e.target.value)}
                      placeholder="Conakry, Guinée"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Bouton Suivant */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full gradient-gold text-primary-foreground py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-90 transition-opacity"
                >
                  Suivant
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                {/* Nom du propriétaire */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nom complet *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.proprietaire.nom}
                      onChange={(e) => handleChange("proprietaire.nom", e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Email du propriétaire */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email personnel *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={formData.proprietaire.email}
                      onChange={(e) => handleChange("proprietaire.email", e.target.value)}
                      placeholder="jean.dupont@email.com"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cet email sera utilisé pour vous connecter
                  </p>
                </div>

                {/* Téléphone du propriétaire */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Téléphone personnel *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={formData.proprietaire.telephone}
                      onChange={(e) => handleChange("proprietaire.telephone", e.target.value)}
                      placeholder="+224 6XX XXX XXX"
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vous recevrez vos identifiants par SMS sur ce numéro
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 border border-border hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 gradient-gold text-primary-foreground py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        S'inscrire
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
