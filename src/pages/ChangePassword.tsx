import { useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Sparkles } from "lucide-react";
import { useChangePassword } from "@/hooks/useAuth";
import { toast } from "sonner";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePasswordMutation = useChangePassword();

  // Calculer la force du mot de passe
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, label: "Faible", color: "text-destructive" };
    if (score <= 3) return { score, label: "Moyen", color: "text-warning" };
    return { score, label: "Fort", color: "text-success" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (newPassword === currentPassword) {
      toast.error("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2 px-2">
            Changement de mot de passe requis
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Pour votre sécurité, veuillez changer votre mot de passe par défaut
          </p>
        </div>

        {/* Alert */}
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-foreground">
            <p className="font-semibold mb-1">Mot de passe sécurisé requis</p>
            <ul className="text-muted-foreground space-y-0.5 sm:space-y-1">
              <li>• Minimum 8 caractères</li>
              <li>• Mélange majuscules et minuscules</li>
              <li>• Au moins un chiffre</li>
              <li>• Caractère spécial recommandé</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="current" className="text-xs sm:text-sm font-medium text-foreground">
              Mot de passe actuel
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <input
                id="current"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="new" className="text-xs sm:text-sm font-medium text-foreground">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <input
                id="new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Force du mot de passe:</span>
                  <span className={`font-semibold ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.score <= 2
                        ? "bg-destructive"
                        : passwordStrength.score <= 3
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirm" className="text-xs sm:text-sm font-medium text-foreground">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-lg border border-border bg-card text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {/* Match Indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-success">Les mots de passe correspondent</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-destructive">Les mots de passe ne correspondent pas</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full gradient-gold text-primary-foreground py-2.5 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold flex items-center justify-center gap-2 shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {changePasswordMutation.isPending ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                Modifier le mot de passe
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-muted-foreground px-4">
          Votre mot de passe sera chiffré et stocké en toute sécurité
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
