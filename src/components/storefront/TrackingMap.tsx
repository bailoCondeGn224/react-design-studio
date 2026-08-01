import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrackingInfo } from '@/types/livreur';
import { Phone, User } from 'lucide-react';

interface TrackingMapProps {
  tracking: TrackingInfo;
}

export const TrackingMap = ({ tracking }: TrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(
      [tracking.latitude, tracking.longitude],
      15,
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapInstanceRef.current);

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    markerRef.current = L.marker([tracking.latitude, tracking.longitude], {
      icon,
    }).addTo(mapInstanceRef.current);

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([tracking.latitude, tracking.longitude]);
      mapInstanceRef.current.panTo([tracking.latitude, tracking.longitude]);
    }
  }, [tracking.latitude, tracking.longitude]);

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
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
        </div>
      </div>
      <div ref={mapRef} className="h-64 rounded-lg overflow-hidden border" />
    </div>
  );
};
