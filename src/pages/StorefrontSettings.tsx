// src/pages/StorefrontSettings.tsx
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, ExternalLink, QrCode, Copy, Check, Globe, Phone, Clock, MapPin, Truck, FileText } from 'lucide-react';
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
      <div className="space-y-5 md:space-y-6 pb-6">
        {/* Header avec gradient - Architecture standard */}
        <div className="px-4 md:px-0 py-4 md:py-5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">Vitrine en ligne</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Configurez votre boutique en ligne accessible par vos clients
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {/* QR Code - Mobile - Architecture standard */}
          {isMobile && config?.isActive && (
            <div className="px-4">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">QR Code</h3>
                  </div>

                  <div className="bg-white p-4 rounded-lg border flex items-center justify-center min-h-[200px]">
                    {qrLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44" />
                    ) : (
                      <p className="text-sm text-muted-foreground">Erreur de chargement</p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10"
                    onClick={handleDownloadQr}
                    disabled={!qrCodeUrl}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Télécharger le QR Code
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 px-4 md:px-0">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Activation - Architecture standard */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/5 via-background to-background border-2 border-border p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-success" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Statut de la vitrine</h3>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Activer la vitrine</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Rendre votre boutique visible au public
                      </p>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                    />
                  </div>

                  {form.isActive && config?.fullUrl && (
                    <div className="mt-2 p-4 bg-success/10 rounded-lg border border-success/20">
                      <p className="text-xs font-medium text-success mb-2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Votre boutique est en ligne
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1.5 rounded border border-border break-all flex-1 font-mono">
                          {config.fullUrl}
                        </code>
                        <div className="flex gap-1.5 w-full sm:w-auto">
                          <Button type="button" variant="outline" size="sm" onClick={handleCopyLink} className="flex-1 sm:flex-none h-9">
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </Button>
                          <Button type="button" variant="outline" size="sm" asChild className="flex-1 sm:flex-none h-9">
                            <a href={config.fullUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations - Architecture standard */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Informations de la boutique</h3>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-2">
                    Ces informations seront affichées sur votre vitrine en ligne
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez votre boutique..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsappNumber" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Numéro WhatsApp
                    </label>
                    <Input
                      id="whatsappNumber"
                      placeholder="+224 6XX XXX XXX"
                      value={form.whatsappNumber}
                      onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Les clients pourront vous contacter via ce numéro
                    </p>
                  </div>

                  <div>
                    <label htmlFor="horaires" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Horaires d'ouverture
                    </label>
                    <Input
                      id="horaires"
                      placeholder="Ex: Lun-Sam 9h-18h"
                      value={form.horaires}
                      onChange={(e) => setForm({ ...form, horaires: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label htmlFor="adresse" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Adresse
                    </label>
                    <Input
                      id="adresse"
                      placeholder="Ex: Marché Madina, Conakry"
                      value={form.adresse}
                      onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Livraison - Architecture standard */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/5 via-background to-background border-2 border-border p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Livraison</h3>
                  </div>

                  <div>
                    <label htmlFor="fraisLivraison" className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Frais de livraison (GNF)
                    </label>
                    <Input
                      id="fraisLivraison"
                      type="number"
                      min="0"
                      value={form.fraisLivraison}
                      onChange={(e) => setForm({ ...form, fraisLivraison: Number(e.target.value) })}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mettre 0 pour la livraison gratuite
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit - Architecture standard */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar - QR Code (Desktop) - Architecture standard */}
          <div className="hidden lg:block space-y-5">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-background to-background border-2 border-border p-5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">QR Code</h3>
                    <p className="text-xs text-muted-foreground">Partagez votre boutique</p>
                  </div>
                </div>

                {config?.isActive ? (
                  <>
                    <div className="bg-white p-4 rounded-lg border min-h-[220px] flex items-center justify-center">
                      {qrLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-52 h-52" />
                      ) : (
                        <p className="text-sm text-muted-foreground">Erreur de chargement</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full h-10"
                      onClick={handleDownloadQr}
                      disabled={!qrCodeUrl}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Télécharger le QR Code
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <QrCode className="h-14 w-14 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Activez la vitrine pour générer le QR code</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lien de partage - Architecture standard */}
            {config?.isActive && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary/5 via-background to-background border-2 border-border p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="relative space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Lien de partage</h3>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1.5">URL de votre boutique</p>
                    <p className="text-xs font-mono break-all text-foreground">{config.fullUrl}</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={handleCopyLink}>
                      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                      <span className="text-xs">Copier</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-9" asChild>
                      <a href={config.fullUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs">Ouvrir</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StorefrontSettings;
