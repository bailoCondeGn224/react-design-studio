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
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const StorefrontSettings = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: config, isLoading } = useStorefrontConfig();
  const updateMutation = useUpdateStorefrontConfig();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

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

  // Charger le QR code avec authentification
  useEffect(() => {
    const fetchQrCode = async () => {
      if (config?.isActive) {
        setQrLoading(true);
        try {
          const response = await apiClient.get('/storefront/qrcode', {
            responseType: 'blob',
          });
          const url = URL.createObjectURL(response.data);
          setQrCodeUrl(url);
        } catch (error) {
          console.error('Erreur chargement QR code:', error);
        } finally {
          setQrLoading(false);
        }
      }
    };
    fetchQrCode();

    // Cleanup blob URL
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [config?.isActive]);

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
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'qrcode-boutique.png';
      link.click();
    }
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
      <div className="space-y-4 md:space-y-6 pb-6">
        {/* Header */}
        <div className="px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-bold">Vitrine en ligne</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Configurez votre boutique en ligne accessible par vos clients
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* QR Code - Afficher en premier sur mobile */}
          {isMobile && config?.isActive && (
            <div className="space-y-4 px-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="h-5 w-5" />
                    QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-0">
                  <div className="bg-white p-3 rounded-lg border w-full flex items-center justify-center min-h-[180px]">
                    {qrLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                    ) : (
                      <p className="text-sm text-muted-foreground">Erreur de chargement</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={handleDownloadQr}
                    disabled={!qrCodeUrl}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Télécharger le QR
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 px-4 md:px-0">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Activation */}
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Globe className="h-5 w-5" />
                    Statut de la vitrine
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
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
                    <div className="mt-4 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs md:text-sm text-green-700 dark:text-green-400 font-medium mb-2">
                        Votre boutique est accessible sur :
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <code className="text-xs md:text-sm bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded break-all flex-1">
                          {config.fullUrl}
                        </code>
                        <div className="flex gap-1 w-full sm:w-auto">
                          <Button type="button" variant="ghost" size="sm" onClick={handleCopyLink} className="flex-1 sm:flex-none h-8">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button type="button" variant="ghost" size="sm" asChild className="flex-1 sm:flex-none h-8">
                            <a href={config.fullUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations */}
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">Informations</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Ces informations seront affichées sur votre vitrine
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <div>
                    <Label htmlFor="description" className="text-sm">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre boutique..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="mt-1.5 text-sm md:text-base"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber" className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Numéro WhatsApp
                    </Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="+224 6XX XXX XXX"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      className="mt-1.5 h-10 md:h-12 text-sm md:text-base"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Les clients pourront vous contacter via ce numéro
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="horaires" className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Horaires d'ouverture
                    </Label>
                    <Input
                      id="horaires"
                      placeholder="Ex: Lun-Sam 9h-18h"
                      value={form.horaires}
                      onChange={(e) => setForm({ ...form, horaires: e.target.value })}
                      className="mt-1.5 h-10 md:h-12 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="adresse" className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Adresse
                    </Label>
                    <Input
                      id="adresse"
                      placeholder="Ex: Marché Madina, Conakry"
                      value={form.adresse}
                      onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                      className="mt-1.5 h-10 md:h-12 text-sm md:text-base"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Livraison */}
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Truck className="h-5 w-5" />
                    Livraison
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div>
                    <Label htmlFor="fraisLivraison" className="text-sm">Frais de livraison (GNF)</Label>
                    <Input
                      id="fraisLivraison"
                      type="number"
                      min="0"
                      value={form.fraisLivraison}
                      onChange={(e) => setForm({ ...form, fraisLivraison: Number(e.target.value) })}
                      className="mt-1.5 h-10 md:h-12 text-sm md:text-base"
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
                className="w-full h-11 md:h-12 text-sm md:text-base"
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

          {/* Sidebar - QR Code (Desktop uniquement) */}
          <div className="hidden lg:block space-y-6">
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
                    <div className="bg-white p-4 rounded-lg border min-h-[200px] flex items-center justify-center">
                      {qrLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : qrCodeUrl ? (
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-48 h-48"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Erreur de chargement</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={handleDownloadQr}
                      disabled={!qrCodeUrl}
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
