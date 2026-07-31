// src/pages/storefront/LivreurLogin.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Phone, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const LivreurLogin = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useLivreurAuth();

  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    navigate(`/b/${slug}/livreur/dashboard`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!telephone || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      await login(telephone, password, slug || '');
      toast.success('Connexion réussie');
      navigate(`/b/${slug}/livreur/dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/b/${slug}`)}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la boutique
        </Button>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Espace Livreur</CardTitle>
            <CardDescription>
              Connectez-vous pour accéder à vos livraisons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telephone"
                    type="tel"
                    placeholder="Votre numéro de téléphone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Contactez votre gérant pour obtenir vos identifiants
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LivreurLogin;
