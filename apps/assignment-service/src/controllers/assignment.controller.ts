import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import { createAssignment, completeAssignment, reassignAssignment, getResponderWorkload } from '../services/assignment.service.js';
import { createAssignmentSchema } from '../validation-schemas/assignment.schema.js';
import { findAssignmentsByIncidentId, findAssignmentById } from '../repositories/assignment.repository.js';
import { reassignAssignmentSchema } from '../validation-schemas/reassignment.schema.js';


export const createAssignmentController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const parsed = createAssignmentSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      message: 'Invalid assignment request.',
      errors: parsed.error.issues,
    });
  }

  try {
    const assignment = await createAssignment(
        {
        ...parsed.data,
        assignedBy: request.user.sub,
        },
          request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '',
    );

    return reply.code(201).send({
      message: 'Responder assigned successfully.',
      assignment,
    });
  } catch (error) {
    //request.log.error(error);
    console.error('Create assignment failed:', error);

    if (error instanceof Error) {
      if (error.message === 'Incident not found.') {
        return reply.code(404).send({ message: error.message });
      }

      if (
        error.message ===
        'Selected user is not an eligible responder.'
      ) {
        return reply.code(400).send({ message: error.message });
      }

      if (
        error.message ===
        'Incident already has an active assignment.'
      ) {
        return reply.code(409).send({ message: error.message });
      }
    }

    return reply.code(500).send({
      message: 'Unable to create assignment.',
    });
  }
};

export const getAssignmentsByIncidentIdController = async (
  request: FastifyRequest<{
    Params: {
      incidentId: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const { incidentId } = request.params;

  try {
    const assignments = await findAssignmentsByIncidentId(incidentId);

    return reply.code(200).send({
      incidentId,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error('Get assignments by incident failed:', error);

    return reply.code(500).send({
      message: 'Unable to retrieve assignments.',
    });
  }
};

export const getAssignmentByIdController = async (
  request: FastifyRequest<{
    Params: {
      assignmentId: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const { assignmentId } = request.params;

  try {
    const assignment = await findAssignmentById(assignmentId);

    if (!assignment) {
      return reply.code(404).send({
        message: 'Assignment not found.',
      });
    }

    return reply.code(200).send({
      assignment,
    });
  } catch (error) {
    console.error('Get assignment by ID failed:', error);

    return reply.code(500).send({
      message: 'Unable to retrieve assignment.',
    });
  }
};

export const completeAssignmentController = async (
  request: FastifyRequest<{
    Params: {
      assignmentId: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const { assignmentId } = request.params;

  try {
    const assignment = await completeAssignment(assignmentId);

    return reply.code(200).send({
      message: 'Assignment completed successfully.',
      assignment,
    });
  } catch (error) {
    console.error('Complete assignment failed:', error);

    if (
      error instanceof Error &&
      error.message ===
        'Assignment not found or is not currently active.'
    ) {
      return reply.code(404).send({
        message: error.message,
      });
    }

    return reply.code(500).send({
      message: 'Unable to complete assignment.',
    });
  }
};

export const reassignAssignmentController = async (
  request: FastifyRequest<{
    Params: {
      assignmentId: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const { assignmentId } = request.params;

  const parsed = reassignAssignmentSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      message: 'Invalid reassignment request.',
      errors: parsed.error.issues,
    });
  }

  try {
    const assignment = await reassignAssignment({
      assignmentId,
      newResponderId: parsed.data.newResponderId,
      reassignedBy: request.user.sub,
    });

    return reply.code(200).send({
      message: 'Assignment reassigned successfully.',
      assignment,
    });
  } catch (error) {
    console.error('Reassign assignment failed:', error);

    if (error instanceof Error) {
      if (
        error.message ===
        'Assignment not found or is not currently active.'
      ) {
        return reply.code(404).send({
          message: error.message,
        });
      }

      if (
        error.message ===
        'New responder must be different from the current responder.'
      ) {
        return reply.code(400).send({
          message: error.message,
        });
      }

      if (
        error.message ===
        'Selected user is not an eligible responder.'
      ) {
        return reply.code(400).send({
          message: error.message,
        });
      }
    }

    return reply.code(500).send({
      message: 'Unable to reassign assignment.',
    });
  }
};

export const getResponderWorkloadController = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const responders = await getResponderWorkload();

    return reply.code(200).send({
      count: responders.length,
      responders,
    });
  } catch (error) {
    console.error('Get responder workload failed:', error);

    return reply.code(500).send({
      message: 'Unable to retrieve responder workload.',
    });
  }
};