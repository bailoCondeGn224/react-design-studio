// src/components/storefront/CartDrawer.tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CartMobileItem } from './CartMobileItem';
import { CartItem } from '@/types';
import { ShoppingBag, ChevronLeft, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { useCartContext } from '@/contexts/CartContext';

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
    .map(item => `• ${item.articleNom} x${item.quantity} - ${formatPrix(item.prixUnitaire)}`)
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
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nomClient: '',
    telephone: '',
    adresseLivraison: '',
    notes: ''
  });

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
    }, 300);
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

      // Close drawer after 3 seconds
      setTimeout(() => {
        handleCloseDrawer();
      }, 3000);

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
        {items.length === 0 ? (
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

            {/* Success step */}
            {step === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                  <CheckCircle className="h-14 w-14 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Commande envoyée!</h3>
                <p className="text-sm text-gray-600 text-center max-w-sm leading-relaxed">
                  Votre commande a été enregistrée avec succès. Nous vous contacterons bientôt au <strong>{formData.telephone}</strong>.
                </p>
                <div className="mt-8 text-xs text-gray-400">
                  Fermeture automatique...
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
