import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Boxes,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "@/hooks/useAuth";

const FEATURES = [
  { icon: Boxes, label: "Gestion du stock en temps réel" },
  { icon: TrendingUp, label: "Suivi des ventes et des finances" },
  { icon: Users, label: "Clients & fournisseurs centralisés" },
  { icon: BarChart3, label: "Rapports et analyses détaillés" },
] as const;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ---------- Panneau gauche : présentation ---------- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar">
        {/* Motif + halos décoratifs (charte verte) */}
        <div className="absolute inset-0 pattern-islamic opacity-[0.07]" />
        <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-16 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-sidebar-foreground w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-fade-in">
            <img
              src="/pwa-512x512.png"
              alt="Walli"
              className="w-12 h-12 rounded-xl object-cover shadow-elevated"
            />
            <div>
              <h1 className="font-heading text-2xl font-bold text-sidebar-accent-foreground leading-none">
                Walli
              </h1>
              <p className="text-sm text-sidebar-foreground/70 mt-1">
                Pharmacie · Magasin · Boutique
              </p>
            </div>
          </div>

          {/* Accroche */}
          <div className="space-y-8 max-w-lg">
            <div className="space-y-5">
              <h2 className="font-heading text-4xl xl:text-5xl font-bold text-sidebar-accent-foreground leading-[1.1] animate-fade-in">
                Gérez votre commerce en toute simplicité
              </h2>
              <p
                className="text-lg text-sidebar-foreground/80 leading-relaxed animate-fade-in"
                style={{ animationDelay: "80ms", animationFillMode: "backwards" }}
              >
                Une solution complète pour piloter votre stock, vos ventes et vos
                finances — quel que soit votre commerce.
              </p>
            </div>

            {/* Fonctionnalités */}
            <ul className="space-y-3 pt-2">
              {FEATURES.map(({ icon: Icon, label }, i) => (
                <li
                  key={label}
                  className="flex items-center gap-4 animate-slide-in"
                  style={{
                    animationDelay: `${150 + i * 90}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </span>
                  <span className="text-sidebar-foreground/90">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pied */}
          <p className="text-sm text-sidebar-foreground/50">
            © 2026 Walli. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* ---------- Panneau droit : formulaire ---------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center gap-4">
            <img
              src="/pwa-512x512.png"
              alt="Walli"
              className="w-16 h-16 rounded-2xl object-cover shadow-elevated"
            />
            <div className="text-center">
              <h1 className="font-heading text-3xl font-bold text-foreground leading-none">
                Walli
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Pharmacie · Magasin · Boutique
              </p>
            </div>
          </div>

          {/* Titre */}
          <div className="text-center lg:text-left">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Bon retour ! 👋
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Se souvenir / Mot de passe oublié */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
                />
                <span className="text-muted-foreground">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-primary font-medium hover:underline">
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full gradient-gold text-primary-foreground py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Lien inscription */}
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Créer une organisation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
