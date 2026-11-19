
import axios from 'axios';

import type {
  CreateAssignmentInput,
  CreateAssignmentResponse,
  ResponderWorkload,
  ResponderRecommendationsResponse
} from '../types/assignment.types';

import { getIncidents } from '../../incidents/api/incidentApi';

import type { CreatedIncident } from '../../incidents/types/incidentApi.types';

const API_BASE_URL =
  import.meta.env.VITE_ASSIGNMENT_API_URL ??
  'http://127.0.0.1:3003/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(
    'crisisflow_access_token',
  );

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

export async function createAssignment(
  input: CreateAssignmentInput,
): Promise<CreateAssignmentResponse> {
  const response = await api.post<CreateAssignmentResponse>(
    '/assignments',
    input,
  );

  return response.data;
}


//This keeps incident retrieval in the existing Incident Service API client while making the assignment feature responsible for selecting eligible incidents.
export async function getAssignableIncidents(): Promise<CreatedIncident[]> {
  const [incidentsResponse, assignedIncidentIds] = await Promise.all([
    getIncidents({ limit: 100, offset: 0 }),
    getIncidentsWithActiveAssignments(),
  ]);

  const assignedIncidentIdSet = new Set(assignedIncidentIds);

  return incidentsResponse.data.filter(
    (incident) =>
      incident.status !== 'RESOLVED' &&
      incident.status !== 'CANCELLED' &&
      !assignedIncidentIdSet.has(incident.id),
  );
}

export async function getIncidentsWithActiveAssignments(): Promise<string[]> {
  const response = await api.get<{
    count: number;
    incidentIds: string[];
  }>('/assignments/active-incidents');

  return response.data.incidentIds;
}

export async function getResponderWorkload(): Promise<ResponderWorkload[]> {
  const response = await api.get<{
    count: number;
    responders: ResponderWorkload[];
  }>('/assignments/responders/workload');

  return response.data.responders;
}

export async function getResponderRecommendations(
  incidentId: string,
): Promise<ResponderRecommendationsResponse> {
  const response = await api.get<ResponderRecommendationsResponse>(
    `/assignments/incidents/${incidentId}/recommendations`,
  );

  return response.data;
}