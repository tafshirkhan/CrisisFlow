
import {
  INCIDENT_PRIORITIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
} from '../constants/incident.constants.js';

export const incidentIdValidationParamsSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
  },
} as const;

export const updateIncidentValidationStatusBodySchema = {
  type: 'object',
  required: ['status'],
  additionalProperties: false,
  properties: {
    status: {
      type: 'string',
      enum: [...INCIDENT_STATUSES],
    },
  },
} as const;

export const createIncidentValidationBodySchema = {
  type: 'object',
  required: ['type', 'description'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
      enum: [...INCIDENT_TYPES],
    },
    description: {
      type: 'string',
      minLength: 10,
      maxLength: 5000,
    },
    latitude: {
      type: 'number',
      minimum: -90,
      maximum: 90,
    },
    longitude: {
      type: 'number',
      minimum: -180,
      maximum: 180,
    },
    address: {
      type: 'string',
      maxLength: 1000,
    },
    reportedBy: {
      type: 'string',
      maxLength: 100,
    },
  },
} as const;

export const listIncidentsValidationQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    status: {
      type: 'string',
      enum: [...INCIDENT_STATUSES],
    },
    priority: {
      type: 'string',
      enum: [...INCIDENT_PRIORITIES],
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 20,
    },
    offset: {
      type: 'integer',
      minimum: 0,
      default: 0,
    },
  },
} as const;
