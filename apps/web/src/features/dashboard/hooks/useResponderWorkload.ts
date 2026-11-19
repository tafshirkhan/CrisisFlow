
import { useEffect, useState } from 'react';

import { getResponderWorkload } from '../api/responderWorkloadApi';
import type {
  ResponderWorkloadResponse,
} from '../types/responderWorkload.types';

interface UseResponderWorkloadResult {
  data: ResponderWorkloadResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useResponderWorkload(): UseResponderWorkloadResult {
  const [data, setData] =
    useState<ResponderWorkloadResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkload = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getResponderWorkload();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch responder workload:', err);

      setError(
        'Unable to load responder workload. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchWorkload();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchWorkload,
  };
}

//data	Responder workload information
//loading	Indicates whether the API request is running
//error	Displays an error if the request fails
//refetch	Allows refreshing the workload data