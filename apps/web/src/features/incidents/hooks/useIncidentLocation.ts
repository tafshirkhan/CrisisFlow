
import { useState } from 'react';
import type { IncidentLocation } from '../types/incidentReport.types';

const INITIAL_LOCATION: IncidentLocation = {
  address: '',
  latitude: null,
  longitude: null,
};

export function useIncidentLocation() {
  const [location, setLocation] =
    useState<IncidentLocation>(INITIAL_LOCATION);

  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  function updateAddress(address: string) {
    setLocation((current) => ({ ...current, address }));
    setError(null);
  }

  function setCoordinates(
    latitude: number,
    longitude: number,
  ) {
    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError('The selected coordinates are invalid.');
      return;
    }

    setLocation((current) => ({
      ...current,
      latitude,
      longitude,
    }));

    setError(null);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates(
          position.coords.latitude,
          position.coords.longitude,
        );
        setIsLocating(false);
      },
      () => {
        setError(
          'Location access failed. You can enter the address manually.',
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  function resetLocation() {
    setLocation(INITIAL_LOCATION);
    setError(null);
  }

  return {
    location,
    error,
    isLocating,
    updateAddress,
    setCoordinates,
    useCurrentLocation,
    resetLocation,
  };
}
