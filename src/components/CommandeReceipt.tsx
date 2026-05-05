import { Commande } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

interface CommandeReceiptProps {
  commande: Commande;
  clientNom?: string;
  clientTelephone?: string;
  clientAdresse?: string;
  onClose: () => void;
}

const CommandeReceipt = ({ commande, clientNom, clientTelephone, clientAdresse, onClose }: CommandeReceiptProps) => {
  const handlePrint = () => {
    window.print();
  };

  const formatPrix = (prix: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(prix).replace('GNF', 'GNF');
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: fr });
  };

  const handleShareWhatsApp = () => {
    // Formater le statut
    const statutText =
      commande.statut === 'en_attente' ? 'En Attente' :
      commande.statut === 'confirmee' ? 'Confirmee' :
      commande.statut === 'en_preparation' ? 'En Preparation' :
      commande.statut === 'prete' ? 'Prete' :
      commande.statut === 'livree' ? 'Livree' :
      commande.statut === 'annulee' ? 'Annulee' : commande.statut;

    // Créer le message formaté pour WhatsApp (sans emojis problématiques)
    const message = `*RECU DE COMMANDE*
*WALLI INDUSTRIE - Boutique Abayas*

*Numero:* ${commande.numero}
*Date:* ${formatDate(commande.createdAt)}

*CLIENT*
Nom: ${clientNom || 'Client'}
Tel: ${clientTelephone || '-'}

*ARTICLES COMMANDES*
${commande.lignes?.map((ligne, idx) =>
  `${idx + 1}. ${ligne.nom}
   Qte: ${ligne.quantite} x ${formatPrix(ligne.prixUnitaire)}
   Sous-total: ${formatPrix(ligne.prixUnitaire * ligne.quantite)}`
).join('\n\n')}

---------------------------
*MONTANT TOTAL:* ${formatPrix(commande.total)}
*Acompte verse:* ${formatPrix(commande.acompte || 0)}
*RESTE A PAYER:* ${formatPrix(commande.montantRestant)}
---------------------------

*Livraison prevue:* ${commande.dateLivraison ? formatDate(commande.dateLivraison) : 'A definir'}
*Statut:* ${statutText}
${commande.note ? `\n*Note:* ${commande.note}` : ''}

Merci de votre confiance!
Pour toute question: Contactez-nous`;

    // Encoder le message pour l'URL
    const encodedMessage = encodeURIComponent(message);

    // Construire l'URL WhatsApp
    let whatsappUrl;
    if (clientTelephone) {
      // Nettoyer le numéro (enlever espaces, tirets, etc.)
      const cleanPhone = clientTelephone.replace(/\D/g, '');
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    } else {
      // Pas de numéro - l'utilisateur choisira le contact
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    }

    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Overlay pour fermer */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 print:hidden" onClick={onClose} />

      {/* Contenu du reçu */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:block">
        <div className="bg-background border-2 border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto print:border-0 print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">

          {/* Boutons d'action (cachés à l'impression) */}
          <div className="flex items-center justify-end gap-2 p-4 border-b border-border print:hidden">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              Imprimer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium text-sm"
            >
              Fermer
            </button>
          </div>

          {/* Contenu imprimable */}
          <div className="p-8 print:p-12">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">REÇU DE COMMANDE</h1>
                <p className="text-sm text-muted-foreground">
                  Numéro: <span className="font-semibold text-foreground">{commande.numero}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Date: <span className="font-semibold text-foreground">{formatDate(commande.createdAt)}</span>
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-primary mb-1">WALLI INDUSTRIE</h2>
                <p className="text-sm text-muted-foreground">Boutique Abayas</p>
                <p className="text-sm text-muted-foreground">Conakry, Guinée</p>
              </div>
            </div>

            {/* Informations client */}
            <div className="bg-secondary/30 rounded-lg p-6 mb-8">
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3">Informations Client</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="text-base font-semibold text-foreground">{clientNom || 'Client'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="text-base font-semibold text-foreground">{clientTelephone || '-'}</p>
                </div>
                {clientAdresse && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="text-base font-semibold text-foreground">{clientAdresse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Détails de la commande */}
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4">Détails de la Commande</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 text-sm font-semibold text-foreground">Article</th>
                    <th className="text-center py-3 text-sm font-semibold text-foreground">Quantité</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Prix Unitaire</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.lignes?.map((ligne, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 text-sm text-foreground">{ligne.nom}</td>
                      <td className="py-3 text-sm text-center text-foreground">{ligne.quantite}</td>
                      <td className="py-3 text-sm text-right text-foreground">{formatPrix(ligne.prixUnitaire)}</td>
                      <td className="py-3 text-sm text-right font-semibold text-foreground">
                        {formatPrix(ligne.prixUnitaire * ligne.quantite)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-base font-bold text-foreground">{formatPrix(commande.total)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Acompte versé</span>
                  <span className="text-base font-semibold text-success">{formatPrix(commande.acompte || 0)}</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 px-4 rounded-lg mt-2">
                  <span className="text-base font-bold text-foreground">Montant Restant</span>
                  <span className="text-lg font-bold text-primary">{formatPrix(commande.montantRestant)}</span>
                </div>
              </div>
            </div>

            {/* Date de livraison prévue */}
            {commande.dateLivraison && (
              <div className="bg-primary/5 border-l-4 border-primary rounded p-4 mb-8">
                <p className="text-sm text-muted-foreground mb-1">Date de Livraison Prévue</p>
                <p className="text-lg font-bold text-primary">{formatDate(commande.dateLivraison)}</p>
              </div>
            )}

            {/* Note */}
            {commande.note && (
              <div className="mb-8">
                <h3 className="text-sm font-bold uppercase text-muted-foreground mb-2">Note</h3>
                <p className="text-sm text-foreground bg-secondary/30 p-4 rounded-lg">{commande.note}</p>
              </div>
            )}

            {/* Statut */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">Statut de la commande</p>
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                {commande.statut === 'en_attente' && 'En Attente'}
                {commande.statut === 'confirmee' && 'Confirmée'}
                {commande.statut === 'en_preparation' && 'En Préparation'}
                {commande.statut === 'prete' && 'Prête'}
                {commande.statut === 'livree' && 'Livrée'}
                {commande.statut === 'annulee' && 'Annulée'}
              </div>
            </div>

            {/* Pied de page */}
            <div className="border-t-2 border-border pt-6 mt-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-muted-foreground mb-4">Signature du Client</p>
                  <div className="border-b border-border w-full h-16"></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-4">Cachet de l'Entreprise</p>
                  <div className="border-b border-border w-full h-16"></div>
                </div>
              </div>
              <div className="text-center mt-8">
                <p className="text-xs text-muted-foreground">
                  Ce reçu confirme la prise en compte de votre commande.
                </p>
                <p className="text-xs text-muted-foreground">
                  Merci de votre confiance!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </>
  );
};

export default CommandeReceipt;
