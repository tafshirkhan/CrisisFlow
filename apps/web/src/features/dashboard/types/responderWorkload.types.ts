
export interface ResponderWorkload {
  responder_id: string;
  responder_name: string;
  active_assignments: number;
}

export interface ResponderIncident {
  id: string;
  reference_number: string;
  type: string;
  description: string;
  priority: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
  people_affected: number;
  created_at: string;
}

export interface ResponderAssignment {
  id: string;
  incident_id: string;
  responder_id: string;
  status: string;
  assigned_at: string;
  completed_at: string | null;
  incident: {
    data: ResponderIncident;
  };
}

export interface ResponderAssignmentsResponse {
  responderId: string;
  count: number;
  assignments: ResponderAssignment[];
}

export interface ResponderWorkloadResponse {
  count: number;
  responders: ResponderWorkload[];
}
