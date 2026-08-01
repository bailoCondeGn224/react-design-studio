import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLivreurAuth } from '@/contexts/LivreurAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';

const LivreurLogin = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { login } = useLivreurAuth();
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ telephone, password });
      navigate(`/b/${slug}/livreur/dashboard`);
    } catch {
      toast.error('Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Espace Livreur</h1>
          <p className="text-muted-foreground mt-2">
            Connectez-vous pour voir vos livraisons
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="h-12"
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
              className="h-12"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LivreurLogin;
