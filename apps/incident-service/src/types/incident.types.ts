import type {
  INCIDENT_PRIORITIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
} from '../constants/incident.constants.js';

export type IncidentType = (typeof INCIDENT_TYPES)[number];

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export type IncidentPriority = (typeof INCIDENT_PRIORITIES)[number];

export interface CreateIncidentBody {
  type: IncidentType;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  reportedBy?: string;
  peopleAffected?: number;
  additionalInformation?: string;
}

export interface ListIncidentsQuery {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  limit?: number;
  offset?: number;
}


export interface UpdateIncidentStatusBody {
  status: IncidentStatus;
}