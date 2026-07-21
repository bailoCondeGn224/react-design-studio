// src/pages/customer/CustomerLogin.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/customer/orders';
  const { login, isLoading } = useCustomerAuth();

  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ telephone, password });
      toast.success('Connexion réussie');
      navigate(redirect);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <CardTitle className="text-2xl">Connexion client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+224 6XX XXX XXX"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="h-12 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de compte ?{' '}
            <Link to="/customer/register" className="text-primary font-medium">
              S'inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLogin;
