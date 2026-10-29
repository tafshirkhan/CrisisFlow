//Axios is a JavaScript library used to send HTTP requests to a backend API.
import axios from 'axios';
import type {
  CreateIncidentRequest,
  CreateIncidentResponse,
  CreatedIncident,
  IncidentAttachment,
  ListIncidentAttachmentsResponse,
  GetIncidentByReferenceResponse,
  IncidentStatusHistoryResponse,
  ListIncidentsResponse,
} from '../types/incidentApi.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  'http://127.0.0.1:3001/api/v1';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('crisisflow_access_token');

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

export async function createIncident(
  incident: CreateIncidentRequest,
): Promise<CreatedIncident> {
  const response = await api.post<CreateIncidentResponse>(
    '/incidents',
    incident,
  );

  return response.data.incident;
}

export async function uploadIncidentAttachment(
  incidentId: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  await api.post(
    `/incidents/${incidentId}/attachments`,
    formData,
  );
}

export function getIncidentAttachmentUrl(
  incidentId: string,
  attachmentId: string,
): string {
  return `${API_BASE_URL}/incidents/${incidentId}/attachments/${attachmentId}`;
}


//This function uses your existing api instance, so the Authorization: Bearer ... header is added automatically.
export async function fetchIncidentAttachment(
  incidentId: string,
  attachmentId: string,
): Promise<Blob> {
  const response = await api.get<Blob>(
    `/incidents/${encodeURIComponent(incidentId)}/attachments/${encodeURIComponent(attachmentId)}`,
    {
      responseType: 'blob',
    },
  );
  return response.data;
}


export async function listIncidentAttachments(
  incidentId: string,
): Promise<IncidentAttachment[]> {
  const response = await api.get<ListIncidentAttachmentsResponse>(
    `/incidents/${incidentId}/attachments`,
  );

  return response.data.attachments;
}


export async function getIncidentByReferenceNumber(
  referenceNumber: string,
): Promise<CreatedIncident> {
  const response = await api.get<GetIncidentByReferenceResponse>(
    `/incidents/reference/${encodeURIComponent(referenceNumber.trim())}`,
  );

  return response.data.data;
}


export async function cancelIncident(
  incidentId: string,
): Promise<void> {
  await api.post(`/incidents/${encodeURIComponent(incidentId)}/cancel`);
}


export async function getIncidentStatusHistory(
  incidentId: string,
): Promise<IncidentStatusHistoryResponse> {
  const response = await api.get<IncidentStatusHistoryResponse>(
    `/incidents/${encodeURIComponent(incidentId)}/status-history`,
  );

  return response.data;
}


export interface GetIncidentsParams {
  limit?: number;
  offset?: number;
  priority?: string;
}

export async function getIncidents({
  limit = 10,
  offset = 0,
  priority,
}: GetIncidentsParams = {}): Promise<ListIncidentsResponse> {
  const response = await api.get<ListIncidentsResponse>(
    '/incidents',
    {
      params: {
        limit,
        offset,
        ...(priority ? { priority: priority.toUpperCase() } : {}),
      },
    },
  );

  return response.data;
}


