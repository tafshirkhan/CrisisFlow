
import { useEffect, useState } from 'react';
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

interface PlaceSuggestion {
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    postcode?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

function getPlaceAddress(place: PlaceSuggestion): string {
  const p = place.properties;

  return [
    [p.housenumber, p.street].filter(Boolean).join(' '),
    p.name,
    p.district,
    p.city,
    p.postcode,
    p.state,
    p.country,
  ]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(', ');
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
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const query = location.address.trim();
    let cancelled = false;

    if (query.length < 3 || !showSuggestions) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);

        const params = new URLSearchParams({
          q: query,
          limit: '5',
          lang: 'en',
        });

        const response = await fetch(
          `https://photon.komoot.io/api/?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('Unable to search locations.');
        }

        const data = (await response.json()) as {
          features: PlaceSuggestion[];
        };

        if (!cancelled) {
          setSuggestions(data.features ?? []);
        }
      } catch {
        if (!cancelled && !controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [location.address, showSuggestions]);

  function selectSuggestion(place: PlaceSuggestion) {
    const address = getPlaceAddress(place);
    const [longitude, latitude] = place.geometry.coordinates;

    onAddressChange(address);
    onSelectCoordinates(latitude, longitude);

    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Where is the emergency?
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter a location and select a suggestion, or pinpoint the
          incident directly on the map.
        </p>
      </div>

      <div className="relative">
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
          onChange={(event) => {
            onAddressChange(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          placeholder="Start typing a street, area or landmark..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {showSuggestions &&
          location.address.trim().length >= 3 &&
          (searching || suggestions.length > 0) && (
            <div className="absolute z-[1000] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {searching && (
                <p className="px-4 py-3 text-sm text-slate-500">
                  Searching locations...
                </p>
              )}

              {!searching &&
                suggestions.map((place, index) => {
                  const address = getPlaceAddress(place);

                  return (
                    <button
                      key={`${address}-${index}`}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(place)}
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-blue-50"
                    >
                      <span className="block font-medium text-slate-800">
                        {place.properties.name ||
                          place.properties.street ||
                          address}
                      </span>

                      <span className="mt-1 block text-xs text-slate-500">
                        {address}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
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
        Location suggestions require an internet connection. You can
        still enter an address manually or select a point on the map.
        Map data © OpenStreetMap contributors.
      </p>
    </div>
  );
}
