// src/components/storefront/CustomerAuthModal.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
}

export const CustomerAuthModal = ({
  open,
  onOpenChange,
  defaultTab = 'login'
}: CustomerAuthModalProps) => {
  const { login, register, isLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login form state
  const [loginData, setLoginData] = useState({ telephone: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [registerData, setRegisterData] = useState({
    nom: '',
    telephone: '',
    email: '',
    password: '',
  });
  const [registerError, setRegisterError] = useState('');

  const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Le téléphone est requis';
    if (!/^[0-9]{9,15}$/.test(phone)) return 'Le numéro doit contenir entre 9 et 15 chiffres';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format d\'email invalide';
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const phoneError = validatePhone(loginData.telephone);
    if (phoneError) {
      setLoginError(phoneError);
      return;
    }

    if (!loginData.password) {
      setLoginError('Le mot de passe est requis');
      return;
    }

    try {
      await login({
        telephone: loginData.telephone,
        password: loginData.password,
      });
      toast.success('Connexion réussie !');
      onOpenChange(false);
      setLoginData({ telephone: '', password: '' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur de connexion';
      if (error.response?.status === 401) {
        setLoginError('Téléphone ou mot de passe incorrect');
      } else if (error.response?.status === 404) {
        setLoginError('Aucun compte trouvé avec ce numéro');
      } else {
        setLoginError(message);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerData.nom.trim()) {
      setRegisterError('Le nom est requis');
      return;
    }

    const phoneError = validatePhone(registerData.telephone);
    if (phoneError) {
      setRegisterError(phoneError);
      return;
    }

    const emailError = validateEmail(registerData.email);
    if (emailError) {
      setRegisterError(emailError);
      return;
    }

    if (!registerData.password) {
      setRegisterError('Le mot de passe est requis');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register({
        nom: registerData.nom,
        telephone: registerData.telephone,
        email: registerData.email || undefined,
        password: registerData.password,
      });
      toast.success(`Compte créé avec succès ! Bienvenue ${registerData.nom} !`);
      onOpenChange(false);
      setRegisterData({ nom: '', telephone: '', email: '', password: '' });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la création du compte';
      if (error.response?.status === 409) {
        setRegisterError('Ce numéro est déjà enregistré. Connectez-vous ou utilisez un autre numéro');
      } else {
        setRegisterError(message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mon compte</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Créer un compte</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Téléphone</Label>
                <Input
                  id="login-phone"
                  type="tel"
                  placeholder="624123456"
                  value={loginData.telephone}
                  onChange={(e) => setLoginData({ ...loginData, telephone: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Pas de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-primary hover:underline"
                >
                  Créez-en un
                </button>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="register-nom">Nom complet</Label>
                <Input
                  id="register-nom"
                  type="text"
                  placeholder="Mamadou Diallo"
                  value={registerData.nom}
                  onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone">Téléphone</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  placeholder="624123456"
                  value={registerData.telephone}
                  onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email (optionnel)</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mot de passe</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>

              {registerError && (
                <p className="text-sm text-destructive">{registerError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-primary hover:underline"
                >
                  Connectez-vous
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>

        {/* Lien Espace Livreur */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate(`/b/${slug}/livreur`);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm text-muted-foreground hover:text-foreground"
          >
            <Truck className="h-4 w-4" />
            <span>Vous êtes livreur ? <span className="font-medium text-primary">Connectez-vous ici</span></span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
