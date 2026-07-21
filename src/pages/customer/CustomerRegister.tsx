// src/pages/customer/CustomerRegister.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useCustomerAuth();

  const [form, setForm] = useState({
    nom: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await register({
        nom: form.nom,
        telephone: form.telephone,
        email: form.email || undefined,
        password: form.password,
      });
      toast.success('Compte créé avec succès');
      navigate('/customer/orders');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
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
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone *</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+224 6XX XXX XXX"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (optionnel)</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-12 mt-1"
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Créer mon compte'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà un compte ?{' '}
            <Link to="/customer/login" className="text-primary font-medium">
              Se connecter
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRegister;
