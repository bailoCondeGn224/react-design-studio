// src/components/LivreursTrackingMap.tsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Livreur } from '@/types/livreur';
import { OnlineOrder } from '@/types';

interface LivreursTrackingMapProps {
  livreurs: Livreur[];
  ordersEnLivraison?: OnlineOrder[];
}

export const LivreursTrackingMap = ({ livreurs, ordersEnLivraison = [] }: LivreursTrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Filtrer les livreurs avec une position GPS
  const livreursWithPosition = livreurs.filter(
    (l) => l.latitude && l.longitude && l.isActive
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Centre par défaut: Conakry, Guinée
    const defaultCenter: [number, number] = [9.6412, -13.5784];

    // Si des livreurs ont une position, centrer sur le premier
    const center = livreursWithPosition.length > 0
      ? [livreursWithPosition[0].latitude!, livreursWithPosition[0].longitude!] as [number, number]
      : defaultCenter;

    mapInstanceRef.current = L.map(mapRef.current).setView(center, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Mettre à jour les marqueurs des livreurs
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Supprimer les marqueurs des livreurs qui ne sont plus actifs
    markersRef.current.forEach((marker, id) => {
      const livreur = livreursWithPosition.find((l) => l.id === id);
      if (!livreur) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Ajouter ou mettre à jour les marqueurs
    livreursWithPosition.forEach((livreur) => {
      const order = ordersEnLivraison.find((o) => o.livreurId === livreur.id);

      const livreurIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, hsl(119, 80%, 35%), hsl(119, 80%, 28%));
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const existingMarker = markersRef.current.get(livreur.id);

      if (existingMarker) {
        // Mettre à jour la position
        existingMarker.setLatLng([livreur.latitude!, livreur.longitude!]);
      } else {
        // Créer un nouveau marqueur
        const marker = L.marker([livreur.latitude!, livreur.longitude!], {
          icon: livreurIcon,
        }).addTo(mapInstanceRef.current!);

        const popupContent = `
          <div style="min-width: 150px;">
            <p style="font-weight: 600; margin-bottom: 4px;">${livreur.nom}</p>
            <p style="font-size: 12px; color: #666;">${livreur.telephone}</p>
            ${order ? `
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 11px; color: #666;">Commande en cours:</p>
              <p style="font-weight: 500; font-size: 12px;">${order.numero}</p>
            ` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);

        markersRef.current.set(livreur.id, marker);
      }
    });

    // Ajuster la vue pour voir tous les marqueurs
    if (livreursWithPosition.length > 0) {
      const bounds = L.latLngBounds(
        livreursWithPosition.map((l) => [l.latitude!, l.longitude!] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [livreursWithPosition, ordersEnLivraison]);

  if (livreursWithPosition.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Aucun livreur en activité avec GPS
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Les positions apparaîtront quand les livreurs activeront leur GPS
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>{livreursWithPosition.length} livreur{livreursWithPosition.length > 1 ? 's' : ''} actif{livreursWithPosition.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        className="h-80 rounded-lg overflow-hidden border border-border shadow-card"
      />
    </div>
  );
};
