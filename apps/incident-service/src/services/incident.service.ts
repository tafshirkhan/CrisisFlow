// createIncident() generates the incident reference and delegates persistence to the repository.
// listIncidents() delegates incident retrieval to the repository.
// The service doesn't know about HTTP status codes or Fastify's request and reply objects.

import { randomUUID } from 'node:crypto';

import {
  createIncident as createIncidentRecord,
  listIncidents as listIncidentRecords,
  findIncidentById as findIncidentRecordById,
} from '../repositories/incident.repository.js';

import type {
  CreateIncidentBody,
  ListIncidentsQuery,
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
  return listIncidentRecords(query);
};

export const getIncidentById = async (id: string) => {
  return findIncidentRecordById(id);
};
