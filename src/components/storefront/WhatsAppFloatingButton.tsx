// src/components/storefront/WhatsAppFloatingButton.tsx
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

interface WhatsAppFloatingButtonProps {
  phoneNumber: string;
  storeName: string;
}

export const WhatsAppFloatingButton = ({ phoneNumber, storeName }: WhatsAppFloatingButtonProps) => {
  const handleWhatsAppClick = () => {
    // Nettoyer le numéro de téléphone (enlever espaces, tirets, etc.)
    const cleanPhone = phoneNumber.replace(/\s+|-/g, '');

    // Message pré-rempli personnalisé
    const message = encodeURIComponent(
      `Bonjour, je visite votre boutique ${storeName} et j'ai une question...`
    );

    // URL WhatsApp (fonctionne sur mobile et desktop)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    // Ouvrir dans un nouvel onglet
    window.open(whatsappUrl, '_blank');
  };

  // Ne pas afficher si pas de numéro
  if (!phoneNumber) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={handleWhatsAppClick}
        className="group relative flex items-center gap-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
        aria-label="Contactez-nous sur WhatsApp"
      >
        {/* Icône + texte sur desktop */}
        <div className="flex items-center gap-2 pl-5 pr-5 py-4">
          <WhatsAppIcon className="h-6 w-6 animate-pulse" size={24} />
          <span className="hidden sm:inline font-semibold text-sm">
            Besoin d'aide ?
          </span>
        </div>

        {/* Animation pulse ring */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </button>

      {/* Tooltip mobile (apparaît brièvement au chargement) */}
      <div className="sm:hidden absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Contactez-nous
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
};
