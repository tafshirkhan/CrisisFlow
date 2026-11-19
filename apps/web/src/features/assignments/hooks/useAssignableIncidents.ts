import { useCallback, useEffect, useState } from 'react';

import { getAssignableIncidents } from '../api/assignmentApi';
import type { CreatedIncident } from '../../incidents/types/incidentApi.types';

export function useAssignableIncidents() {
  const [incidents, setIncidents] = useState<CreatedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAssignableIncidents();
      setIncidents(data);
    } catch {
      setError('Failed to load assignable incidents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return {
    incidents,
    loading,
    error,
    refetch: fetchIncidents,
  };
}