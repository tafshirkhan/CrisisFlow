export type AssignmentStatus =
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REASSIGNED';

export interface Assignment {
  id: string;
  incident_id: string;
  responder_id: string;
  assigned_by: string;
  status: AssignmentStatus;
  assigned_at: Date;
  completed_at: Date | null;
}

export interface CreateAssignmentInput {
  incidentId: string;
  responderId: string;
  assignedBy: string;
}

export interface ReassignAssignmentInput {
  assignmentId: string;
  newResponderId: string;
  reassignedBy: string;
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