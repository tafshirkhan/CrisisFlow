
import { useCallback, useEffect, useState } from 'react';

import { getResponderRecommendations } from '../api/assignmentApi';
import type { ResponderRecommendation } from '../types/assignment.types';

export function useResponderRecommendations(incidentId?: string) {
  const [responders, setResponders] = useState<ResponderRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!incidentId) {
      setResponders([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getResponderRecommendations(incidentId);

      setResponders(response.responders);
    } catch {
      setResponders([]);
      setError('Failed to load responder recommendations.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    responders,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}
