
import { useState } from 'react';

import { getResponderAssignments } from '../api/responderAssignmentsApi';

import type {
  ResponderAssignmentsResponse,
} from '../types/responderWorkload.types';

interface UseResponderAssignmentsResult {
  data: ResponderAssignmentsResponse | null;
  loading: boolean;
  error: string | null;
  fetchAssignments: (responderId: string) => Promise<void>;
  clearAssignments: () => void;
}

export function useResponderAssignments(): UseResponderAssignmentsResult {
  const [data, setData] =
    useState<ResponderAssignmentsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async (responderId: string) => {
    try {
      setLoading(true);
      setError(null);
      setData(null);

      const result =
        await getResponderAssignments(responderId);

      setData(result);
    } catch (err) {
      console.error('Failed to fetch responder assignments:', err);

      setError(
        'Unable to load responder assignments. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAssignments = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    fetchAssignments,
    clearAssignments,
  };
}


// data	Selected responder's assignment details
// loading	Tracks API request progress
// error	Handles API failures
// fetchAssignments	Loads assignments for a selected responder
// clearAssignments	Clears the selected responder's details
