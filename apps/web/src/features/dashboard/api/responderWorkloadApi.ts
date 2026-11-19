// What this does:
// Connects to the Assignment Service on port 3003.
// Attaches the authenticated user's JWT access token.
// Returns the responder workload data using your existing TypeScript interfaces.
// Supports configuring the API URL through VITE_ASSIGNMENT_API_URL.

import axios from 'axios';
import type {
  ResponderWorkloadResponse,
} from '../types/responderWorkload.types';

const API_BASE_URL =
  import.meta.env.VITE_ASSIGNMENT_API_URL ??
  'http://127.0.0.1:3003/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(
    'crisisflow_access_token'
  );

  if (token) {
    config.headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  return config;
});

export async function getResponderWorkload():
  Promise<ResponderWorkloadResponse> {
  const response =
    await api.get<ResponderWorkloadResponse>(
      '/assignments/responders/workload'
    );

  return response.data;
}