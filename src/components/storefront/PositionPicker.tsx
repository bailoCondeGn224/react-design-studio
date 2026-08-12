import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CapturedPosition } from '@/hooks/useAccuratePosition';
import { addTileLayer, buildDestinationIcon, TileHealth } from '@/lib/map-icons';
import { MapTileWarning } from '@/components/MapTileWarning';

interface PositionPickerProps {
  position: CapturedPosition;
  onChange: (latitude: number, longitude: number) => void;
}

export const PositionPicker = ({ position, onChange }: PositionPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [tileHealth, setTileHealth] = useState<TileHealth>('loading');

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(
      [position.latitude, position.longitude],
      17,
    );
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    addTileLayer(map, setTileHealth);

    const marker = L.marker([position.latitude, position.longitude], {
      icon: buildDestinationIcon(),
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      onChangeRef.current(lat, lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChangeRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const coords: [number, number] = [position.latitude, position.longitude];

    if (position.source === 'gps') {
      marker.setLatLng(coords);
      map.setView(coords, map.getZoom());
    }

    circleRef.current?.remove();
    circleRef.current = null;

    if (position.source === 'gps' && position.accuracy != null) {
      circleRef.current = L.circle(coords, {
        radius: position.accuracy,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(map);
    }
  }, [position.latitude, position.longitude, position.accuracy, position.source]);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <MapTileWarning health={tileHealth} />
        <div
          ref={mapRef}
          className="h-52 rounded-lg overflow-hidden border border-gray-200"
        />
      </div>
      <p className="text-[11px] text-gray-500">
        Le repère n'est pas au bon endroit ? Touchez la carte ou faites-le glisser
        pour le corriger.
      </p>
    </div>
  );
};
