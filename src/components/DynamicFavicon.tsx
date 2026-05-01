import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';

const DynamicFavicon = () => {
  const user = useCurrentUser();
  const organization = user?.organization;

  useEffect(() => {
    // Si on a une organization et un logo
    if (organization?.logo && organization?.id) {
      // Récupérer l'URL du logo depuis organization
      const logoUrl = `${import.meta.env.VITE_API_URL}/organizations/logo/${organization.id}`;

      // Chercher l'élément link existant pour le favicon
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;

      // Si l'élément n'existe pas, le créer
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      // Mettre à jour le href avec l'URL du logo
      link.href = logoUrl;
    }
  }, [organization]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default DynamicFavicon;
