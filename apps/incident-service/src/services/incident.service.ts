// createIncident() generates the incident reference and delegates persistence to the repository.
// listIncidents()  incident retrieval to the repository.
// The service doesn't know about HTTP status codes or Fastify's request and reply objects.

import { randomUUID } from 'node:crypto';

import {
  createIncident as createIncidentRecord,
  listIncidents as listIncidentRecords,
  findIncidentById as findIncidentRecordById,
  findIncidentByReferenceNumber as findIncidentRecordByReferenceNumber,
  updateIncidentStatus as updateIncidentStatusRecord,
  listIncidentStatusHistory as listIncidentStatusHistoryRecords,
  findIncidentByIdForReporter as findIncidentByIdForReporters,
} from '../repositories/incident.repository.js';

import { INCIDENT_STATUS_TRANSITIONS } from '../constants/incident-transitions.constants.js';

import type {
  CreateIncidentBody,
  ListIncidentsQuery,
  IncidentStatus,
} from '../types/incident.types.js';

export const createIncident = async (
  incident: CreateIncidentBody,
) => {
  const referenceNumber =
    `CF-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;

  return createIncidentRecord(referenceNumber, incident);
};

export const listIncidents = async (
  query: ListIncidentsQuery,
) => {
  const { reporterId, ...filters } = query;
  return listIncidentRecords(filters, reporterId);
};

export const getIncidentById = async (id: string, reporterId?: string,) => {
  return findIncidentRecordById(id, reporterId);
};

export const getIncidentByIdForReporter = async (
  id: string,
  reporterId: string,
) => {
  return findIncidentByIdForReporters(id, reporterId);
};

export const getIncidentByReferenceNumber = async (
  referenceNumber: string,
  reporterId?: string,
) => {
  return findIncidentRecordByReferenceNumber(referenceNumber, reporterId,);
};

export class IncidentNotFoundError extends Error {
  constructor() {
    super('Incident not found');
    this.name = 'IncidentNotFoundError';
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(
    public readonly currentStatus: IncidentStatus,
    public readonly requestedStatus: IncidentStatus,
  ) {
    super(
      `Cannot transition incident from ${currentStatus} to ${requestedStatus}`,
    );
    this.name = 'InvalidStatusTransitionError';
  }
}

export class IncidentStatusConflictError extends Error {
  constructor() {
    super('Incident status changed concurrently. Please retry.');
    this.name = 'IncidentStatusConflictError';
  }
}

export const updateIncidentStatus = async (
  id: string,
  requestedStatus: IncidentStatus,
) => {
  const incident = await findIncidentRecordById(id);

  if (!incident) {
    throw new IncidentNotFoundError();
  }

  const currentStatus = incident.status as IncidentStatus;

  // Treat a request for the current status
  if (currentStatus === requestedStatus) {
    return incident;
  }

  const allowedTransitions =
    INCIDENT_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(requestedStatus)) {
    throw new InvalidStatusTransitionError(
      currentStatus,
      requestedStatus,
    );
  }

  const updatedIncident = await updateIncidentStatusRecord(
    id,
    currentStatus,
    requestedStatus,
  );

  if (!updatedIncident) {
    throw new IncidentStatusConflictError();
  }

  return updatedIncident;
};

export const getIncidentStatusHistory = async (
  incidentId: string,
) => {
  return listIncidentStatusHistoryRecords(incidentId);
};