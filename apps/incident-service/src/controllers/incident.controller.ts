
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
  createIncident,
  listIncidents,
  getIncidentById,
  updateIncidentStatus,
  IncidentNotFoundError,
  InvalidStatusTransitionError,
  IncidentStatusConflictError,
} from '../services/incident.service.js';

import type {
  CreateIncidentBody,
  ListIncidentsQuery,
  UpdateIncidentStatusBody,
} from '../types/incident.types.js';

//POST
export const createIncidentHandler = async (
  request: FastifyRequest<{ Body: CreateIncidentBody }>,
  reply: FastifyReply,
) => {
  try {
    const incident = await createIncident(request.body);

    return reply.code(201).send({
      message: 'Incident created successfully',
      incident,
    });
  } catch (error) {
    request.log.error(error, 'Failed to create incident');

    return reply.code(500).send({
      message: 'Unable to create incident',
    });
  }
};

//GETALL
export const listIncidentsHandler = async (
  request: FastifyRequest<{ Querystring: ListIncidentsQuery }>,
  reply: FastifyReply,
) => {
  try {
    const result = await listIncidents(request.query);

    return reply.code(200).send(result);
  } catch (error) {
    request.log.error(error, 'Failed to retrieve incidents');

    return reply.code(500).send({
      message: 'Unable to retrieve incidents',
    });
  }
};


//GETBYID
export const getIncidentByIdHandler = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const incident = await getIncidentById(request.params.id);

    if (!incident) {
      return reply.code(404).send({
        message: 'Oppsss, Incident deatails not found try again with accurate  information!!!',
      });
    }

    return reply.code(200).send({
      data: incident,
    });
  } catch (error) {
    request.log.error(error, 'Failed to retrieve incident data, please try again or check your information details!!!');

    return reply.code(500).send({
      message: 'Sorry, unable to retrieve incident try again in few mintues!!!',
    });
  }
};

//PATCH
export const updateIncidentStatusHandler = async (
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateIncidentStatusBody;
  }>,
  reply: FastifyReply,
) => {
  try {
    const incident = await updateIncidentStatus(
      request.params.id,
      request.body.status,
    );

    return reply.code(200).send({
      message: 'Incident status updated successfully',
      data: incident,
    });
  } catch (error) {
    if (error instanceof IncidentNotFoundError) {
      return reply.code(404).send({
        message: 'Incident not found',
      });
    }

    if (error instanceof InvalidStatusTransitionError) {
      return reply.code(422).send({
        message: error.message,
        currentStatus: error.currentStatus,
        requestedStatus: error.requestedStatus,
      });
    }

    if (error instanceof IncidentStatusConflictError) {
      return reply.code(409).send({
        message: error.message,
      });
    }

    request.log.error(error, 'Failed to update incident status');

    return reply.code(500).send({
      message: 'Unable to update incident status',
    });
  }
};