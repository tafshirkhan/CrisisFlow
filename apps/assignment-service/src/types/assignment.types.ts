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
  active_assignments: number;
}