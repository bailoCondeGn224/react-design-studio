import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrackingInfo } from '@/types/livreur';
import { Phone, User, MapPin, Truck } from 'lucide-react';

interface TrackingMapProps {
  tracking: TrackingInfo;
}

export const TrackingMap = ({ tracking }: TrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const livreurMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const hasDestination = tracking.destinationLatitude && tracking.destinationLongitude;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(
      [tracking.latitude, tracking.longitude],
      15,
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapInstanceRef.current);

    // Livreur icon (blue - moving)
    const livreurIcon = L.divIcon({
      className: 'custom-marker livreur-marker',
      html: `<div style="background: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 12px rgba(59,130,246,0.5); animation: pulse 2s infinite;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    livreurMarkerRef.current = L.marker([tracking.latitude, tracking.longitude], {
      icon: livreurIcon,
    }).addTo(mapInstanceRef.current);
    livreurMarkerRef.current.bindPopup(`<b>🚚 ${tracking.livreurNom}</b><br/>Livreur en route`);

    // Destination icon (green - fixed) if available
    if (hasDestination) {
      const destinationIcon = L.divIcon({
        className: 'custom-marker destination-marker',
        html: `<div style="background: #10b981; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 12px rgba(16,185,129,0.5);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      destinationMarkerRef.current = L.marker(
        [tracking.destinationLatitude!, tracking.destinationLongitude!],
        { icon: destinationIcon }
      ).addTo(mapInstanceRef.current);
      destinationMarkerRef.current.bindPopup(
        `<b>📍 Destination</b><br/>${tracking.destinationAdresse || 'Adresse de livraison'}`
      );

      // Draw route line
      routeLineRef.current = L.polyline(
        [
          [tracking.latitude, tracking.longitude],
          [tracking.destinationLatitude!, tracking.destinationLongitude!]
        ],
        {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapInstanceRef.current);

      // Fit bounds to show both markers
      const bounds = L.latLngBounds(
        [tracking.latitude, tracking.longitude],
        [tracking.destinationLatitude!, tracking.destinationLongitude!]
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    // Add pulse animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      style.remove();
    };
  }, []);

  // Update livreur position in real-time
  useEffect(() => {
    if (livreurMarkerRef.current && mapInstanceRef.current) {
      livreurMarkerRef.current.setLatLng([tracking.latitude, tracking.longitude]);

      // Update route line if destination exists
      if (routeLineRef.current && hasDestination) {
        routeLineRef.current.setLatLngs([
          [tracking.latitude, tracking.longitude],
          [tracking.destinationLatitude!, tracking.destinationLongitude!]
        ]);
      }

      // Only pan if no destination (otherwise keep fitted bounds)
      if (!hasDestination) {
        mapInstanceRef.current.panTo([tracking.latitude, tracking.longitude]);
      }
    }
  }, [tracking.latitude, tracking.longitude]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (): string | null => {
    if (!hasDestination) return null;

    const R = 6371; // Earth's radius in km
    const dLat = (tracking.destinationLatitude! - tracking.latitude) * Math.PI / 180;
    const dLon = (tracking.destinationLongitude! - tracking.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(tracking.latitude * Math.PI / 180) * Math.cos(tracking.destinationLatitude! * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const distance = calculateDistance();

  return (
    <div className="space-y-3">
      {/* Livreur info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-blue-900">{tracking.livreurNom}</p>
            <a
              href={`tel:${tracking.livreurTelephone}`}
              className="flex items-center gap-1 text-sm text-blue-700"
            >
              <Phone className="w-3 h-3" />
              {tracking.livreurTelephone}
            </a>
          </div>
          {distance && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Distance</p>
              <p className="text-lg font-bold text-blue-600">{distance}</p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-72 rounded-lg overflow-hidden border shadow-inner" />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Livreur</span>
        </div>
        {hasDestination && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Destination</span>
          </div>
        )}
      </div>
    </div>
  );
};
