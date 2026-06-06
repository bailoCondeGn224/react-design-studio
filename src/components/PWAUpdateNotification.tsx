import { RefreshCw, X, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { Button } from '@/components/ui/button';

export const PWAUpdateNotification = () => {
  const { needRefresh, offlineReady, updateApp, close } = usePWAUpdate();

  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-top-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start gap-3">
          {needRefresh ? (
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {needRefresh ? 'Mise à jour disponible' : 'Application prête hors ligne'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {needRefresh
                ? 'Une nouvelle version de l\'application est disponible. Cliquez sur "Mettre à jour" pour l\'installer.'
                : 'L\'application est maintenant disponible hors ligne.'}
            </p>

            {needRefresh && (
              <div className="flex gap-2">
                <Button onClick={updateApp} size="sm" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Mettre à jour
                </Button>
                <Button onClick={close} variant="outline" size="sm">
                  Plus tard
                </Button>
              </div>
            )}

            {offlineReady && (
              <Button onClick={close} variant="outline" size="sm" className="w-full">
                OK
              </Button>
            )}
          </div>

          <button
            onClick={close}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-xs z-50">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-center gap-3 shadow-lg">
        <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            Mode hors ligne
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Certaines fonctionnalités sont limitées
          </p>
        </div>
      </div>
    </div>
  );
};
