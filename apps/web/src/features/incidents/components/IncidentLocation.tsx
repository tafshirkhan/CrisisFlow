
import IncidentLocationMap from './IncidentLocationMap';

import type { IncidentLocation } from '../types/incidentReport.types';

interface IncidentLocationProps {
  location: IncidentLocation;
  error?: string;
  locationError: string | null;
  isLocating: boolean;
  onAddressChange: (address: string) => void;
  onSelectCoordinates: (latitude: number, longitude: number) => void;
  onUseCurrentLocation: () => void;
}

export default function IncidentLocationStep({
  location,
  error,
  locationError,
  isLocating,
  onAddressChange,
  onSelectCoordinates,
  onUseCurrentLocation,
}: IncidentLocationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Where is the emergency?
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Provide the address and select the incident location on the map.
        </p>
      </div>

      <div>
        <label
          htmlFor="incident-address"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Incident address
        </label>

        <input
          id="incident-address"
          type="text"
          value={location.address}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder="Street, area, city or nearby landmark"
          autoComplete="street-address"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="button"
        onClick={onUseCurrentLocation}
        disabled={isLocating}
        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true">📍</span>
        {isLocating ? 'Finding your location...' : 'Use my current location'}
      </button>

      {locationError && (
        <p className="text-sm text-amber-700" role="alert">
          {locationError}
        </p>
      )}

      <IncidentLocationMap
        location={location}
        onSelectCoordinates={onSelectCoordinates}
      />

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Selected coordinates
        </p>

        {location.latitude !== null && location.longitude !== null ? (
          <p className="mt-2 break-words text-sm text-slate-800">
            Latitude: {location.latitude.toFixed(6)}
            <br />
            Longitude: {location.longitude.toFixed(6)}
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No coordinates selected yet.
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Location access requires browser permission. You can enter the
        address manually if you prefer.
      </p>
    </div>
  );
}
