// src/components/storefront/TrackingMap.tsx
import { useEffect, useRef, useState } from 'react';
import { Loader2, Navigation, AlertCircle, Phone, MapPin } from 'lucide-react';
import { OrderTracking } from '@/types/customer';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface TrackingMapProps {
  tracking: OrderTracking | null;
  isLoading?: boolean;
  height?: string;
  showCustomerPosition?: boolean; // Pour le livreur, afficher la position du client
}

export const TrackingMap = ({
  tracking,
  isLoading,
  height = '300px',
  showCustomerPosition = false,
}: TrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const livreurMarkerRef = useRef<google.maps.Marker | null>(null);
  const customerMarkerRef = useRef<google.maps.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer la clé API depuis les variables d'environnement
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Charger le script Google Maps
  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    if (!googleMapsApiKey) {
      setError('Clé API Google Maps non configurée dans .env');
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setError('Erreur de chargement de Google Maps');
    document.head.appendChild(script);
  }, [googleMapsApiKey]);

  // Initialiser et mettre à jour la carte
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Déterminer le centre de la carte
    const livreurPos = tracking?.position;
    const customerPos = tracking?.customerPosition;

    // Si aucune position disponible, ne pas initialiser
    if (!livreurPos && !customerPos) return;

    const centerLat = livreurPos?.latitude || customerPos?.latitude || 0;
    const centerLng = livreurPos?.longitude || customerPos?.longitude || 0;

    // Créer la carte si elle n'existe pas
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
    }

    // Marqueur du livreur (bleu)
    if (livreurPos) {
      if (livreurMarkerRef.current) {
        livreurMarkerRef.current.setPosition({ lat: livreurPos.latitude, lng: livreurPos.longitude });
      } else {
        livreurMarkerRef.current = new window.google.maps.Marker({
          position: { lat: livreurPos.latitude, lng: livreurPos.longitude },
          map: mapInstanceRef.current,
          title: tracking?.livreur.nom || 'Livreur',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
        });

        const livreurInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui, sans-serif;">
              <p style="font-weight: 600; margin: 0 0 4px 0;">${tracking?.livreur.nom || 'Livreur'}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">${showCustomerPosition ? 'Livreur' : 'En route vers vous'}</p>
            </div>
          `,
        });

        livreurMarkerRef.current.addListener('click', () => {
          livreurInfoWindow.open(mapInstanceRef.current, livreurMarkerRef.current);
        });
      }
    }

    // Marqueur du client (vert) - seulement si showCustomerPosition est true
    if (showCustomerPosition && customerPos) {
      if (customerMarkerRef.current) {
        customerMarkerRef.current.setPosition({ lat: customerPos.latitude, lng: customerPos.longitude });
      } else {
        customerMarkerRef.current = new window.google.maps.Marker({
          position: { lat: customerPos.latitude, lng: customerPos.longitude },
          map: mapInstanceRef.current,
          title: 'Client',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#22C55E',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
        });

        const customerInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: system-ui, sans-serif;">
              <p style="font-weight: 600; margin: 0 0 4px 0;">Client</p>
              <p style="margin: 0; color: #666; font-size: 12px;">Destination</p>
            </div>
          `,
        });

        customerMarkerRef.current.addListener('click', () => {
          customerInfoWindow.open(mapInstanceRef.current, customerMarkerRef.current);
        });
      }
    }

    // Ajuster les limites pour montrer les deux marqueurs si présents
    if (showCustomerPosition && livreurPos && customerPos) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: livreurPos.latitude, lng: livreurPos.longitude });
      bounds.extend({ lat: customerPos.latitude, lng: customerPos.longitude });
      mapInstanceRef.current.fitBounds(bounds, 50);
    } else if (livreurPos) {
      mapInstanceRef.current.panTo({ lat: livreurPos.latitude, lng: livreurPos.longitude });
    }
  }, [mapLoaded, tracking, showCustomerPosition]);

  // Affichage du chargement
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-muted/50 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Erreur de configuration
  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-muted/50 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Pas de position disponible
  if (!tracking?.position) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-4">
          <Navigation className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Position du livreur non disponible
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Le livreur n'a pas encore activé son GPS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Infos livreur */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Navigation className="h-4 w-4 text-primary-foreground animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{tracking.livreur.nom}</p>
          <p className="text-xs text-muted-foreground">
            Mise à jour:{' '}
            {new Date(tracking.position.lastPositionAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <a
          href={`tel:${tracking.livreur.telephone}`}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Phone className="h-3 w-3" />
          Appeler
        </a>
      </div>

      {/* Carte Google Maps */}
      <div
        ref={mapRef}
        className="rounded-lg overflow-hidden border"
        style={{ height }}
      />
    </div>
  );
};
