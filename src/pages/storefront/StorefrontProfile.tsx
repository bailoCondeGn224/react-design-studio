// src/pages/storefront/StorefrontProfile.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { User, Phone, Mail, Edit2, Save, X, LogOut, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const StorefrontProfile = () => {
  const { customer, logout, updateProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: customer?.nom || '',
    email: customer?.email || '',
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        nom: formData.nom || undefined,
        email: formData.email || undefined,
      });
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: customer?.nom || '',
      email: customer?.email || '',
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  if (!customer) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <p className="text-muted-foreground">Veuillez vous connecter</p>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-background pb-24 md:pb-4">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground flex-1">Mon compte</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-primary/10 text-primary rounded-full transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-3">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{customer.nom}</h2>
            <p className="text-sm text-muted-foreground mt-1">Membre depuis {new Date(customer.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Profile Form */}
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <div className="px-4 py-3 bg-muted/50 border-b border-border">
              <h3 className="font-semibold text-foreground">Informations personnelles</h3>
            </div>

            <div className="p-4 space-y-4">
              {/* Nom */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <User className="h-4 w-4" />
                  Nom complet
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card text-foreground transition-all"
                    placeholder="Votre nom complet"
                  />
                ) : (
                  <div className="px-4 py-3 bg-muted rounded-lg text-foreground">
                    {customer.nom}
                  </div>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </label>
                <div className="px-4 py-3 bg-muted rounded-lg text-muted-foreground flex items-center justify-between">
                  <span>{customer.telephone}</span>
                  <span className="text-xs text-muted-foreground/70">Non modifiable</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card text-foreground transition-all"
                    placeholder="votre@email.com"
                  />
                ) : (
                  <div className="px-4 py-3 bg-muted rounded-lg text-foreground">
                    {customer.email || 'Non renseigné'}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons (Edit Mode) */}
            {isEditing && (
              <div className="px-4 pb-4 pt-2 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive/10 text-destructive rounded-xl font-medium hover:bg-destructive/20 transition-colors border border-destructive/20"
          >
            <LogOut className="h-5 w-5" />
            Se déconnecter
          </button>
        </div>
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontProfile;
