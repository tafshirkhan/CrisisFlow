import {
  createAssignment as createAssignmentRecord,
  findAssignmentsByIncidentId,
  findAssignmentById,
  completeAssignment as completeAssignmentRecord,
  reassignAssignment as reassignAssignmentRecord,
  findResponderWorkload,
  findActiveAssignmentsByResponderId,
  findIncidentIdsWithActiveAssignments
} from '../repositories/assignment.repository.js';

import { findIncidentById } from './incident-client.service.js';
import { isEligibleResponder, findActiveResponders  } from './identity-client.service.js';
import { calculateRecommendationScore } from '../utils/recommendation.utils.js';


import type {
  Assignment,
  CreateAssignmentInput,
  ReassignAssignmentInput,
  ResponderWorkload,
  ResponderRecommendation
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
    responder_name: responder.full_name,
    active_assignments:
      workloadByResponderId.get(responder.id) ?? 0,
    is_available: responder.profile.is_available,
    latitude: responder.profile.latitude,
    longitude: responder.profile.longitude,
    skills: responder.skills,
  }));
};

//Retrieves the selected incident.
//Fetches responder profiles, skills and workloads.
//Removes unavailable responders.
//Calculates the weighted score for each remaining responder.
//Sorts responders by their total score.
export const getResponderRecommendations = async (
  incidentId: string,
  accessToken: string,
): Promise<ResponderRecommendation[]> => {
  const incident = await findIncidentById(incidentId, accessToken);

  if (!incident) {
    throw new Error('Incident not found.');
  }

  const responders = await getResponderWorkload();

  const availableResponders = responders.filter(
    (responder) => responder.is_available,
  );

  const recommendations = availableResponders.map((responder) => {
    const score = calculateRecommendationScore({
      incident: {
        type: incident.type,
        priority: incident.priority,
        latitude: incident.latitude,
        longitude: incident.longitude,
      },
      responder: {
        skills: responder.skills,
        active_assignments: responder.active_assignments,
        latitude: responder.latitude,
        longitude: responder.longitude,
      },
    });

    return {
      responder_id: responder.responder_id,
      responder_name: responder.responder_name,
      total_score: score.total_score,
      recommendation_reason: [
        score.score_breakdown.skill_match > 0
          ? `Matches the ${incident.type} incident skill`
          : 'No direct incident skill match',

        responder.active_assignments === 0
          ? 'No active assignments'
          : responder.active_assignments === 1
            ? 'Only one active assignment'
            : `${responder.active_assignments} active assignments`,

        score.distance_km !== null
          ? `${score.distance_km} km from the incident`
          : 'Location information unavailable',
      ].join(', '),
      score_breakdown: score.score_breakdown,
      distance_km: score.distance_km,
      active_assignments: responder.active_assignments,
      skills: responder.skills,
      is_available: responder.is_available,
    };
  });

  return recommendations.sort(
    (a, b) => b.total_score - a.total_score,
  );
};

//This retrieves the active assignments and get each one with its corresponding incident details.
export const getActiveAssignmentsByResponderId = async (
  responderId: string,
  accessToken: string,
) => {
  const assignments =
    await findActiveAssignmentsByResponderId(responderId);

  const assignmentsWithIncidents = await Promise.all(
    assignments.map(async (assignment) => {
      const incident = await findIncidentById(
        assignment.incident_id,
        accessToken,
      );

      return {
        ...assignment,
        incident,
      };
    }),
  );

  return assignmentsWithIncidents;
};

export const getIncidentsWithActiveAssignments = async (): Promise<string[]> => {
  return await findIncidentIdsWithActiveAssignments();
};