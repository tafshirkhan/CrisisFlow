
export interface CreateIncidentRequest {
  type: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  peopleAffected: number;
  additionalInformation?: string;
}

export interface CreatedIncident {
  id: string;
  reference_number: string;
  type: string;
  description: string;
  priority: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  reported_by: string | null;
  people_affected: number;
  additional_information: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentResponse {
  message: string;
  incident: CreatedIncident;
}


export interface IncidentAttachment {
  id: string;
  incident_id: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_by: string | null;
  uploaded_at: string;
}

export interface ListIncidentAttachmentsResponse {
  message: string;
  count: number;
  attachments: IncidentAttachment[];
}


export interface GetIncidentByReferenceResponse {
  data: CreatedIncident;
}


export interface IncidentStatusHistoryEntry {
  id: string;
  incident_id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
}

export interface IncidentStatusHistoryResponse {
  count: number;
  history: IncidentStatusHistoryEntry[];
}
