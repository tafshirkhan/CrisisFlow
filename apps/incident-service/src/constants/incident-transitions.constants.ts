
import type { IncidentStatus } from '../types/incident.types.js';

export const INCIDENT_STATUS_TRANSITIONS: Record<
  IncidentStatus,
  readonly IncidentStatus[]
> = {
  REPORTED: ['RECEIVED', 'UNDER_REVIEW', 'CANCELLED'],
  RECEIVED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED', 'DUPLICATE'],
  VERIFIED: ['PRIORITISED'],
  REJECTED: [],
  PRIORITISED: ['DISPATCHING'],
  DISPATCHING: ['ASSIGNED'],
  ASSIGNED: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
  DUPLICATE: [],
};
