// What this API function does
// When a dispatcher selects a responder, it will:
// 1. Send the selected responder's ID to the Assignment Service.
// 2. Attach the Dispatcher JWT.
// 3. Retrieve active assignments.
// 4. Return incident information, including priority, status and location.


import axios from 'axios';

import type {
  ResponderAssignmentsResponse,
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

export async function getResponderAssignments(
  responderId: string,
): Promise<ResponderAssignmentsResponse> {
  const response =
    await api.get<ResponderAssignmentsResponse>(
      `/assignments/responders/${responderId}/active`
    );

  return response.data;
}
