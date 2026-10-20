
export type IncidentType =
  | 'MEDICAL_EMERGENCY'
  | 'FIRE'
  | 'ROAD_ACCIDENT'
  | 'PUBLIC_SAFETY'
  | 'FLOOD'
  | 'HAZARDOUS_MATERIAL'
  | 'MISSING_PERSON'
  | 'INFRASTRUCTURE_EMERGENCY'
  | 'OTHER';

export type IncidentSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type ReportStep = 1 | 2 | 3;

export interface IncidentLocation {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export interface IncidentEvidence {
  id: string;
  file: File;
  previewUrl: string;
}

export interface IncidentReportForm {
  type: IncidentType;
  description: string;
  priority: IncidentSeverity;
  peopleAffected: number;
  additionalInformation: string;
  location: IncidentLocation;
  evidence: IncidentEvidence[];
}

export interface IncidentReportErrors {
  type?: string;
  description?: string;
  priority?: string;
  peopleAffected?: string;
  address?: string;
  location?: string;
  evidence?: string;
}
