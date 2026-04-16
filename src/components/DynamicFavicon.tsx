import { useEffect } from 'react';
import { useParametres } from '@/hooks/useParametres';
import { parametresApi } from '@/api/parametres';

const DynamicFavicon = () => {
  const { data: parametres } = useParametres();

  useEffect(() => {
    // Si on a des paramètres et un logo
    if (parametres?.logo) {
      // Récupérer l'URL du logo (même logique que la sidebar)
      const logoUrl = parametresApi.getLogoUrl();

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
  }, [parametres]);

  // Ce composant ne rend rien visuellement
  return null;
};

export default DynamicFavicon;
