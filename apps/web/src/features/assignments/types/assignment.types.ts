import type { CreatedIncident } from '../../incidents/types/incidentApi.types';

export interface AssignableIncident extends CreatedIncident {}


export interface CreateAssignmentInput {
  incidentId: string;
  responderId: string;
}

export interface Assignment {
  id: string;
  incident_id: string;
  responder_id: string;
  assigned_by: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REASSIGNED';
  assigned_at: string;
  completed_at: string | null;
}

export interface CreateAssignmentResponse {
  message: string;
  assignment: Assignment;
}

export interface AssignableIncidentsResponse {
  incidents: AssignableIncident[];
}

export interface ResponderWorkload {
  responder_id: string;
  responder_name: string;
  active_assignments: number;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
  skills: string[];
}

export interface ResponderRecommendation {
  responder_id: string;
  responder_name: string;
  total_score: number;
  recommendation_reason: string;
  score_breakdown: {
    skill_match: number;
    incident_priority: number;
    workload: number;
    proximity: number;
  };
  distance_km: number | null;
  active_assignments: number;
  skills: string[];
  is_available: boolean;
}

export interface ResponderRecommendationsResponse {
  incidentId: string;
  count: number;
  responders: ResponderRecommendation[];
}