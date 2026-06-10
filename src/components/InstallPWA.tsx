import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Button } from '@/components/ui/button';

export const InstallPWA = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  // Ne rien afficher si l'app est déjà installée ou si l'utilisateur a fermé le banner
  if (isInstalled || dismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Sauvegarder dans localStorage pour ne pas afficher à nouveau pendant 7 jours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Vérifier si le banner a été fermé récemment (moins de 7 jours)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  if (dismissedTime) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (parseInt(dismissedTime) > sevenDaysAgo) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icône - Plus grande sur mobile */}
          <div className="flex-shrink-0 w-14 h-14 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Download className="w-7 h-7 sm:w-6 sm:h-6 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Titre - Plus grand sur mobile */}
            <h3 className="text-base sm:text-sm font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-1">
              Installer l'application
            </h3>
            {/* Description - Plus grande sur mobile */}
            <p className="text-sm sm:text-xs text-gray-600 dark:text-gray-400 mb-4 sm:mb-3 leading-relaxed">
              Installez Walli Indistrie sur votre appareil pour un accès rapide et une meilleure expérience.
            </p>

            {/* Boutons - Touch-friendly sur mobile */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2">
              <Button
                onClick={handleInstall}
                className="h-12 sm:h-9 text-base sm:text-sm font-semibold flex-1"
              >
                <Download className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                Installer
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="h-12 sm:h-9 text-base sm:text-sm font-medium sm:w-auto"
              >
                Plus tard
              </Button>
            </div>
          </div>

          {/* Bouton fermer - Plus grand sur mobile */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 -mt-1 sm:mt-0"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
