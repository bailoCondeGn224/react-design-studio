// src/pages/StorefrontSettings.tsx
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ExternalLink, QrCode, Copy, Check, Globe, Phone, Clock, MapPin, Truck } from 'lucide-react';
import { useStorefrontConfig, useUpdateStorefrontConfig } from '@/hooks/useStorefrontConfig';
import { storefrontConfigApi } from '@/api/storefront-config';
import { toast } from 'sonner';

const StorefrontSettings = () => {
  const { data: config, isLoading } = useStorefrontConfig();
  const updateMutation = useUpdateStorefrontConfig();
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    isActive: false,
    description: '',
    whatsappNumber: '',
    horaires: '',
    fraisLivraison: 0,
    adresse: '',
  });

  useEffect(() => {
    if (config) {
      setForm({
        isActive: config.isActive,
        description: config.description || '',
        whatsappNumber: config.whatsappNumber || '',
        horaires: config.horaires || '',
        fraisLivraison: config.fraisLivraison || 0,
        adresse: config.adresse || '',
      });
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleCopyLink = () => {
    if (config?.fullUrl) {
      navigator.clipboard.writeText(config.fullUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = storefrontConfigApi.getQrCodeUrl();
    link.download = 'qrcode-boutique.png';
    link.click();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Vitrine en ligne</h1>
          <p className="text-muted-foreground">
            Configurez votre boutique en ligne accessible par vos clients
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Activation */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Statut de la vitrine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activer la vitrine</p>
                      <p className="text-sm text-muted-foreground">
                        Rendre votre boutique visible au public
                      </p>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    />
                  </div>
                  {form.isActive && config?.fullUrl && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        Votre boutique est accessible sur :
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                          {config.fullUrl}
                        </code>
                        <Button type="button" variant="ghost" size="sm" onClick={handleCopyLink}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" asChild>
                          <a href={config.fullUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                  <CardDescription>
                    Ces informations seront affichées sur votre vitrine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre boutique..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Numéro WhatsApp
                    </Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="+224 6XX XXX XXX"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      className="mt-1 h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Les clients pourront vous contacter via ce numéro
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="horaires" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Horaires d'ouverture
                    </Label>
                    <Input
                      id="horaires"
                      placeholder="Ex: Lun-Sam 9h-18h"
                      value={form.horaires}
                      onChange={(e) => setForm({ ...form, horaires: e.target.value })}
                      className="mt-1 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </Label>
                    <Input
                      id="adresse"
                      placeholder="Ex: Marché Madina, Conakry"
                      value={form.adresse}
                      onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                      className="mt-1 h-12"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Livraison */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="fraisLivraison">Frais de livraison (GNF)</Label>
                    <Input
                      id="fraisLivraison"
                      type="number"
                      min="0"
                      value={form.fraisLivraison}
                      onChange={(e) => setForm({ ...form, fraisLivraison: Number(e.target.value) })}
                      className="mt-1 h-12"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mettre 0 pour la livraison gratuite
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Sidebar - QR Code */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code
                </CardTitle>
                <CardDescription>
                  Partagez ce QR code pour accéder à votre boutique
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {config?.isActive ? (
                  <>
                    <div className="bg-white p-4 rounded-lg border">
                      <img
                        src={storefrontConfigApi.getQrCodeUrl()}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={handleDownloadQr}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Activez la vitrine pour générer le QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            {config?.isActive && (
              <Card>
                <CardHeader>
                  <CardTitle>Lien de partage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">URL de votre boutique</p>
                      <p className="text-sm font-mono break-all">{config.fullUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                        {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                        Copier
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={config.fullUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Ouvrir
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorefrontSettings;
