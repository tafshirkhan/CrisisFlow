import {
  createAssignment as createAssignmentRecord,
  findAssignmentsByIncidentId,
  findAssignmentById,
  completeAssignment as completeAssignmentRecord,
  reassignAssignment as reassignAssignmentRecord,
  findResponderWorkload
} from '../repositories/assignment.repository.js';

import { findIncidentById } from './incident-client.service.js';
import { isEligibleResponder, findActiveResponders  } from './identity-client.service.js';

import type {
  Assignment,
  CreateAssignmentInput,
  ReassignAssignmentInput,
  ResponderWorkload
} from '../types/assignment.types.js';

export const createAssignment = async (
  input: CreateAssignmentInput,
  accessToken: string,
): Promise<Assignment> => {
  const incident = await findIncidentById(input.incidentId, accessToken);

  if (!incident) {
    throw new Error('Incident not found.');
  }

  const isEligible = await isEligibleResponder(input.responderId);

  if (!isEligible) {
    throw new Error('Selected user is not an eligible responder.');
  }

  const existingAssignments = await findAssignmentsByIncidentId(
    input.incidentId,
  );

  const hasActiveAssignment = existingAssignments.some(
    (assignment) => assignment.status === 'ACTIVE',
  );

  if (hasActiveAssignment) {
    throw new Error('Incident already has an active assignment.');
  }

  return createAssignmentRecord(input);
};

export const completeAssignment = async (
  assignmentId: string,
): Promise<Assignment> => {
  const assignment = await completeAssignmentRecord(assignmentId);

  if (!assignment) {
    throw new Error(
      'Assignment not found or is not currently active.',
    );
  }

  return assignment;
};

export const reassignAssignment = async (
  input: ReassignAssignmentInput,
): Promise<Assignment> => {
  //gives us the current responder so we can prevent reassignment to the same person
  const currentAssignment = await findAssignmentById(
    input.assignmentId,
  );

  if (!currentAssignment || currentAssignment.status !== 'ACTIVE') {
    throw new Error(
      'Assignment not found or is not currently active.',
    );
  }

  if (currentAssignment.responder_id === input.newResponderId) {
    throw new Error(
      'New responder must be different from the current responder.',
    );
  }

  const isEligible = await isEligibleResponder(input.newResponderId);

  if (!isEligible) {
    throw new Error('Selected user is not an eligible responder.');
  }

  const assignment = await reassignAssignmentRecord(input);

  if (!assignment) {
    throw new Error(
      'Assignment not found or is not currently active.',
    );
  }

  return assignment;
};

export const getResponderWorkload = async (): Promise<
  ResponderWorkload[]
> => {
  const [responders, workloads] = await Promise.all([
    findActiveResponders(),
    findResponderWorkload(),
  ]);

  const workloadByResponderId = new Map(
    workloads.map((workload) => [
      workload.responder_id,
      workload.active_assignments,
    ]),
  );

  return responders.map((responder) => ({
    responder_id: responder.id,
    active_assignments:
      workloadByResponderId.get(responder.id) ?? 0,
  }));
};