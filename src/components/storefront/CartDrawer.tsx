// src/components/storefront/CartDrawer.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartMobileItem } from './CartMobileItem';
import { CartItem } from '@/types';
import { ShoppingBag, ChevronLeft, Loader2, CheckCircle, ArrowRight, MessageCircle, User } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useCartContext } from '@/contexts/CartContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CustomerAuthModal } from './CustomerAuthModal';
import { Button } from '@/components/ui/button';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  subtotal: number;
  fraisLivraison: number;
  onRemove: (articleId: string, modeVenteId?: string) => void;
  onUpdateQuantity: (articleId: string, quantity: number, modeVenteId?: string) => void;
  onCheckout: () => void;
  storefront: { nom: string; whatsappNumber?: string };
}

export interface OrderData {
  nomClient: string;
  items: CartItem[];
  subtotal: number;
  fraisLivraison: number;
  total: number;
  adresseLivraison?: string;
  telephone: string;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const buildWhatsAppMessage = (orderData: OrderData, storeName: string): string => {
  // Construction de la liste des articles
  const articlesText = orderData.items
    .map(item => {
      // Calculer la quantité réelle d'articles
      const quantiteReelle = item.quantiteStock && item.quantiteStock > 1
        ? item.quantity * item.quantiteStock
        : item.quantity;

      // Affichage avec quantité réelle
      const quantiteText = item.quantiteStock && item.quantiteStock > 1
        ? `x${item.quantity} lot(s) = ${quantiteReelle} pcs`
        : `x${item.quantity}`;

      return `• ${item.articleNom} ${quantiteText} - ${formatPrix(item.prixUnitaire)}`;
    })
    .join('\n');

  // Construction du message complet
  const message = `
🛍️ Nouvelle Commande Confirmée

Bonjour ${orderData.nomClient}!

Votre commande a été enregistrée avec succès.

📦 Articles commandés:
${articlesText}

💰 Sous-total: ${formatPrix(orderData.subtotal)}
🚚 Frais de livraison: ${formatPrix(orderData.fraisLivraison)}
✅ TOTAL: ${formatPrix(orderData.total)}

📍 Adresse de livraison: ${orderData.adresseLivraison || 'Non spécifiée'}
📞 Téléphone: ${orderData.telephone}

Nous vous contacterons bientôt pour confirmer votre commande.

Merci pour votre confiance! 🙏
${storeName}
  `.trim();

  return encodeURIComponent(message);
};

const openWhatsApp = (whatsappNumber: string, encodedMessage: string): void => {
  // Nettoyer le numéro (enlever espaces, +, tirets, parenthèses, etc.)
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  // Construire l'URL wa.me
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  // Ouvrir dans nouvelle fenêtre
  try {
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de WhatsApp:', error);
    // Ne pas bloquer le flux si l'ouverture échoue
  }
};

export const CartDrawer = ({
  open,
  onOpenChange,
  items,
  subtotal,
  fraisLivraison,
  onRemove,
  onUpdateQuantity,
  storefront,
}: CartDrawerProps) => {
  const { slug } = useParams<{ slug: string }>();
  const { clear } = useCartContext();
  const { isAuthenticated, customer } = useCustomerAuth();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nomClient: customer?.nom || '',
    telephone: customer?.telephone || '',
    adresseLivraison: '',
    notes: ''
  });
  const [savedOrderData, setSavedOrderData] = useState<OrderData | null>(null);

  // Update formData when customer changes
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        nomClient: customer.nom,
        telephone: customer.telephone,
      }));
    }
  }, [customer]);

  const total = subtotal + fraisLivraison;

  const handleCloseDrawer = () => {
    onOpenChange(false);
    // Reset to cart step after a delay
    setTimeout(() => {
      setStep('cart');
      setFormData({
        nomClient: '',
        telephone: '',
        adresseLivraison: '',
        notes: ''
      });
      setSavedOrderData(null);
    }, 300);
  };

  const handleSendToWhatsApp = () => {
    if (storefront?.whatsappNumber && savedOrderData) {
      try {
        const encodedMessage = buildWhatsAppMessage(savedOrderData, storefront.nom);
        openWhatsApp(storefront.whatsappNumber, encodedMessage);
        toast.success('WhatsApp ouvert!');
        // Fermer le drawer après ouverture WhatsApp
        setTimeout(() => {
          handleCloseDrawer();
        }, 1000);
      } catch (error) {
        console.error('Erreur WhatsApp:', error);
        toast.error('Erreur lors de l\'ouverture de WhatsApp');
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomClient.trim() || !formData.telephone.trim()) {
      toast.error('Veuillez remplir le nom et le téléphone');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        nomClient: formData.nomClient.trim(),
        telephone: formData.telephone.trim(),
        adresseLivraison: formData.adresseLivraison.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        articles: items.map(item => ({
          articleId: item.articleId,
          quantite: item.quantity,
          prixUnitaire: item.prixUnitaire,
          modeVenteId: item.modeVenteId || undefined
        }))
      };

      await apiClient.post(`/public/stores/${slug}/orders`, orderData);

      // Sauvegarder les données de commande pour WhatsApp optionnel (AVANT de vider le panier)
      setSavedOrderData({
        nomClient: formData.nomClient,
        items: items,
        subtotal: subtotal,
        fraisLivraison: fraisLivraison,
        total: total,
        adresseLivraison: formData.adresseLivraison,
        telephone: formData.telephone
      });

      // Vider le panier après succès
      clear();

      // Intégration WhatsApp
      if (storefront?.whatsappNumber) {
        try {
          // Construire le message WhatsApp
          const encodedMessage = buildWhatsAppMessage({
            nomClient: formData.nomClient,
            items: items,
            subtotal: subtotal,
            fraisLivraison: fraisLivraison,
            total: total,
            adresseLivraison: formData.adresseLivraison,
            telephone: formData.telephone
          }, storefront.nom);

          // Ouvrir WhatsApp avec le message
          openWhatsApp(storefront.whatsappNumber, encodedMessage);
        } catch (whatsappError) {
          // Logger l'erreur mais ne pas bloquer le flux
          console.error('Erreur WhatsApp:', whatsappError);
        }
      }

      setStep('success');

    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleCloseDrawer}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="mr-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span>
              {step === 'cart' && `Votre panier (${items.length})`}
              {step === 'checkout' && 'Informations de livraison'}
              {step === 'success' && 'Commande confirmée!'}
            </span>
          </SheetTitle>
        </SheetHeader>

        {/* Empty cart */}
        {items.length === 0 && step !== 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-sm">Votre panier est vide</p>
          </div>
        ) : (
          <>
            {/* Cart step */}
            {step === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <CartMobileItem
                        key={`${item.articleId}_${item.modeVenteId || ''}`}
                        item={item}
                        onRemove={() => onRemove(item.articleId, item.modeVenteId)}
                        onUpdateQuantity={(qty) => onUpdateQuantity(item.articleId, qty, item.modeVenteId)}
                        formatPrix={formatPrix}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom summary */}
                <div className="border-t bg-white p-4 space-y-3 flex-shrink-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-medium">{formatPrix(subtotal)}</span>
                    </div>
                    {fraisLivraison > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Livraison</span>
                        <span className="font-medium">{formatPrix(fraisLivraison)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary text-xl">{formatPrix(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('checkout')}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 active:scale-[0.98] transition-all shadow-md"
                  >
                    <span>Commander maintenant</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}

            {/* Checkout step */}
            {step === 'checkout' && (
              <>
                {!isAuthenticated ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <User className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Connexion requise</h3>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      Créez un compte ou connectez-vous pour passer commande et suivre vos livraisons
                    </p>
                    <Button onClick={() => setAuthModalOpen(true)} className="w-full max-w-xs">
                      Se connecter / Créer un compte
                    </Button>

                    <CustomerAuthModal
                      open={authModalOpen}
                      onOpenChange={setAuthModalOpen}
                    />
                  </div>
                ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nom complet <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nomClient}
                          onChange={(e) => setFormData(prev => ({ ...prev, nomClient: e.target.value }))}
                          placeholder="Entrez votre nom"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                          placeholder="Entrez votre numéro"
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Adresse de livraison
                        </label>
                        <input
                          type="text"
                          value={formData.adresseLivraison}
                          onChange={(e) => setFormData(prev => ({ ...prev, adresseLivraison: e.target.value }))}
                          placeholder="Entrez votre adresse (optionnel)"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Notes (optionnel)
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Instructions spéciales pour la livraison..."
                          rows={3}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        />
                      </div>

                      {/* Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2 mt-6">
                        <h4 className="font-semibold text-sm text-gray-900 mb-3">Résumé</h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{items.length} article{items.length > 1 ? 's' : ''}</span>
                          <span className="font-medium">{formatPrix(subtotal)}</span>
                        </div>
                        {fraisLivraison > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Livraison</span>
                            <span className="font-medium">{formatPrix(fraisLivraison)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                          <span>Total</span>
                          <span className="text-primary text-lg">{formatPrix(total)}</span>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Submit button */}
                  <div className="border-t bg-white p-4 flex-shrink-0">
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={isSubmitting}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-5 w-5" />
                          <span>Confirmer la commande</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
              </>
            )}

            {/* Success step */}
            {step === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Commande envoyée!</h3>
                <p className="text-sm text-gray-600 text-center max-w-sm leading-relaxed mb-6">
                  Votre commande a été enregistrée avec succès. Nous vous contacterons bientôt au <strong>{formData.telephone}</strong>.
                </p>

                {/* WhatsApp CTA */}
                {storefront?.whatsappNumber && savedOrderData ? (
                  <div className="w-full max-w-sm space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 text-center mb-3">
                        💡 <strong>Traitement rapide:</strong> Envoyez aussi votre commande sur WhatsApp pour un traitement prioritaire!
                      </p>
                      <button
                        onClick={handleSendToWhatsApp}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 active:scale-[0.98] transition-all shadow-md"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Envoyer sur WhatsApp</span>
                      </button>
                    </div>

                    <button
                      onClick={handleCloseDrawer}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 active:scale-[0.98] transition-all"
                    >
                      <span>Fermer</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-sm">
                    <button
                      onClick={handleCloseDrawer}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/95 active:scale-[0.98] transition-all shadow-md"
                    >
                      <span>Fermer</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
