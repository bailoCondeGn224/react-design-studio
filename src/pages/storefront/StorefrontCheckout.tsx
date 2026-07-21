// src/pages/storefront/StorefrontCheckout.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { CheckoutMobileForm } from '@/components/storefront/CheckoutMobileForm';
import { useStorefront } from '@/hooks/useStorefront';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOnlineOrders';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { ModeLivraison, CartItem, StoreFront } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

const generateWhatsAppMessage = (
  order: { numero: string },
  items: CartItem[],
  formData: { modeLivraison: ModeLivraison; adresseLivraison?: string; nomClient?: string; telephoneLivraison: string },
  storefront: StoreFront,
  subtotal: number,
  fraisLivraison: number
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR');
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const itemsText = items
    .map((item) => `• ${item.articleNom} × ${item.quantity} = ${formatPrix(item.prixUnitaire * item.quantity)}`)
    .join('\n');

  const modeText = formData.modeLivraison === ModeLivraison.LIVRAISON
    ? `Livraison à ${formData.adresseLivraison}`
    : 'Retrait en boutique';

  const total = subtotal + fraisLivraison;

  return `🛒 *Nouvelle commande*

📦 Commande: ${order.numero}
📅 Date: ${dateStr} à ${timeStr}

👤 Client: ${formData.nomClient || 'Non spécifié'}
📱 Téléphone: ${formData.telephoneLivraison}
📍 Mode: ${modeText}

*Articles:*
${itemsText}

💰 Sous-total: ${formatPrix(subtotal)}
🚚 Livraison: ${formatPrix(fraisLivraison)}
*TOTAL: ${formatPrix(total)}*

Merci de confirmer la réception de cette commande.`;
};

const StorefrontCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: storefront } = useStorefront(slug || '');
  const { items, subtotal, clear } = useCart(slug || '');
  const { customer, isAuthenticated } = useCustomerAuth();
  const createOrder = useCreateOrder();

  if (!storefront) return null;

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="p-4 text-center">
          <p className="text-muted-foreground mb-4">Votre panier est vide</p>
          <Button onClick={() => navigate(`/b/${slug}`)}>
            Voir le catalogue
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  const handleSubmit = async (formData: { modeLivraison: ModeLivraison; adresseLivraison?: string; nomClient?: string; telephoneLivraison: string }) => {
    try {
      const fraisLivraison = formData.modeLivraison === ModeLivraison.LIVRAISON
        ? storefront.fraisLivraison
        : 0;

      const order = await createOrder.mutateAsync({
        storefrontSlug: slug!,
        modeLivraison: formData.modeLivraison,
        adresseLivraison: formData.adresseLivraison,
        telephoneLivraison: formData.telephoneLivraison,
        nomClient: formData.nomClient,
        items: items.map((item) => ({
          articleId: item.articleId,
          modeVenteId: item.modeVenteId,
          quantite: item.quantity,
        })),
      });

      // Générer message WhatsApp
      const message = generateWhatsAppMessage(
        order,
        items,
        formData,
        storefront,
        subtotal,
        fraisLivraison
      );

      // Vider le panier
      clear();

      // Ouvrir WhatsApp
      const whatsappUrl = `https://wa.me/${storefront.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Rediriger vers confirmation ou historique
      if (isAuthenticated) {
        navigate('/customer/orders');
      } else {
        navigate(`/b/${slug}?success=1`);
      }
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <StorefrontLayout>
      <div className="p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/b/${slug}/cart`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Button>

        <h1 className="text-xl font-bold mb-6">Finaliser la commande</h1>

        <CheckoutMobileForm
          storefront={storefront}
          items={items}
          subtotal={subtotal}
          onSubmit={handleSubmit}
          isLoading={createOrder.isPending}
          defaultValues={
            isAuthenticated && customer
              ? { telephoneLivraison: customer.telephone, nomClient: customer.nom }
              : undefined
          }
        />
      </div>
    </StorefrontLayout>
  );
};

export default StorefrontCheckout;
