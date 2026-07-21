// src/pages/customer/CustomerProfile.tsx
import { useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerNavbar } from '@/components/customer/CustomerNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const { customer, updateProfile, logout } = useCustomerAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nom: customer?.nom || '',
    email: customer?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profil mis à jour');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold">Mon profil</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="h-12 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={customer?.telephone || ''}
                  disabled
                  className="h-12 mt-1 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le téléphone ne peut pas être modifié
                </p>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 mt-1"
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={saving}>
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Enregistrer</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      <CustomerNavbar />
    </div>
  );
};

export default CustomerProfile;
