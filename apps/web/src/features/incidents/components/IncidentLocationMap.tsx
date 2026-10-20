
import { useEffect } from 'react';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from 'react-leaflet';

import type { IncidentLocation } from '../types/incidentReport.types';

interface IncidentLocationMapProps {
  location: IncidentLocation;
  onSelectCoordinates: (latitude: number, longitude: number) => void;
}

const DEFAULT_POSITION: [number, number] = [53.3498, -6.2603];

function MapClickHandler({
  onSelectCoordinates,
}: {
  onSelectCoordinates: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelectCoordinates(
        event.latlng.lat,
        event.latlng.lng,
      );
    },
  });

  return null;
}

function MapPositionUpdater({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMapEvents({});

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15), {
        duration: 0.5,
      });
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function IncidentLocationMap({
  location,
  onSelectCoordinates,
}: IncidentLocationMapProps) {
  const hasCoordinates =
    location.latitude !== null &&
    location.longitude !== null;

  const position: [number, number] = hasCoordinates
    ? [location.latitude!, location.longitude!]
    : DEFAULT_POSITION;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          Pinpoint the incident location
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Click or tap the map to place the marker. The initial view
          is centred on Dublin.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={position}
          zoom={hasCoordinates ? 15 : 11}
          scrollWheelZoom
          className="h-80 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onSelectCoordinates={onSelectCoordinates}
          />

          <MapPositionUpdater
            latitude={location.latitude}
            longitude={location.longitude}
          />

          {hasCoordinates && (
            <CircleMarker
              center={position}
              radius={9}
              pathOptions={{
                color: '#1d4ed8',
                fillColor: '#3b82f6',
                fillOpacity: 0.85,
              }}
            />
          )}
        </MapContainer>
      </div>

      {hasCoordinates ? (
        <p className="text-xs text-slate-600">
          Selected coordinates:{' '}
          <span className="font-medium">
            {location.latitude!.toFixed(6)},{' '}
            {location.longitude!.toFixed(6)}
          </span>
        </p>
      ) : (
        <p className="text-xs text-amber-700">
          No map location selected yet. Select a point on the map or
          use your current location.
        </p>
      )}
    </section>
  );
}
