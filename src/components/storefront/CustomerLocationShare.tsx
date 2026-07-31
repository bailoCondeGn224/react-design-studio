// src/components/storefront/CustomerLocationShare.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface CustomerLocationShareProps {
  orderId: string;
  isOrderEnLivraison: boolean;
}

export const CustomerLocationShare = ({ orderId, isOrderEnLivraison }: CustomerLocationShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Récupérer le token client
  const getCustomerToken = () => localStorage.getItem('customer_token');

  // Envoyer la position au serveur
  const sendPosition = useCallback(async (lat: number, lng: number) => {
    const token = getCustomerToken();
    if (!token) return;

    try {
      await apiClient.put(
        `/public/orders/${orderId}/customer-position`,
        { latitude: lat, longitude: lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosition({ lat, lng });
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Erreur envoi position:', err);
    }
  }, [orderId]);

  // Démarrer le partage de position
  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    // Demander la position immédiatement
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        sendPosition(latitude, longitude);
        setIsSharing(true);
        toast.success('Position partagée avec le livreur');
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Vous devez autoriser la géolocalisation');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position non disponible');
            break;
          case err.TIMEOUT:
            setError('Délai de localisation dépassé');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Surveiller les changements de position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        sendPosition(latitude, longitude);
      },
      (err) => console.error('GPS watch error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    // Envoyer la position toutes les 30 secondes
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendPosition(pos.coords.latitude, pos.coords.longitude),
        (err) => console.error('GPS interval error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }, 30000);
  }, [sendPosition]);

  // Arrêter le partage
  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSharing(false);
    toast.info('Partage de position arrêté');
  }, []);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Ne pas afficher si la commande n'est pas en livraison
  if (!isOrderEnLivraison) {
    return null;
  }

  return (
    <Card className={`border-2 ${isSharing ? 'border-green-500 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSharing ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            {isSharing ? (
              <Navigation className="h-5 w-5 animate-pulse" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              {isSharing ? 'Position partagée' : 'Partager ma position'}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {isSharing
                ? 'Le livreur peut voir où vous êtes pour vous retrouver plus facilement'
                : 'Aidez le livreur à vous trouver en partageant votre position GPS'
              }
            </p>

            {error && (
              <div className="flex items-center gap-1 text-xs text-destructive mb-2">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}

            {isSharing && lastUpdate && (
              <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
                <CheckCircle2 className="h-3 w-3" />
                Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            <Button
              size="sm"
              variant={isSharing ? 'destructive' : 'default'}
              onClick={isSharing ? stopSharing : startSharing}
              className="w-full"
            >
              {isSharing ? (
                <>Arrêter le partage</>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-1" />
                  Partager ma position
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
