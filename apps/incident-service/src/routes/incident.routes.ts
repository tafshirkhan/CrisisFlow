import type { CreateIncidentBody, UpdateIncidentStatusBody, ListIncidentsQuery } from '../types/incident.types.js';
import type { FastifyInstance } from 'fastify';
import { authenticate } from '../services/authenticate.js';
import {
  INCIDENT_PRIORITIES,
  INCIDENT_STATUSES,
  INCIDENT_TYPES,
} from '../constants/incident.constants.js';

import {
  createIncidentHandler,
  listIncidentsHandler,
  getIncidentByIdHandler,
  updateIncidentStatusHandler,
  cancelIncidentHandler,
  getIncidentByReferenceNumberHandler,
  getIncidentStatusHistoryHandler,
} from '../controllers/incident.controller.js';
import {
  uploadIncidentAttachmentHandler,
  getIncidentAttachmentHandler,
  listIncidentAttachmentsHandler,
} from '../controllers/incident-attachment.controller.js';

import {
  incidentIdValidationParamsSchema,
  updateIncidentValidationStatusBodySchema,
  createIncidentValidationBodySchema,
  listIncidentsValidationQuerySchema,
  incidentReferenceValidationParamsSchema,
} from '../validation-schemas/incident-validation.schema.js';

export const incidentRoutes = async (
  app: FastifyInstance,
): Promise<void> => {

  // List all attachments belonging to an incident
  app.get<{ Params: { id: string } }>(
    '/:id/attachments',
    {
      preHandler: authenticate,
      schema: {
        params: incidentIdValidationParamsSchema,
      },
    },
    listIncidentAttachmentsHandler,
  );

  // Retrieve an attachment belonging to an incident
  app.get<{ Params: { id: string; attachmentId: string } }>(
    '/:id/attachments/:attachmentId',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['id', 'attachmentId'],
          additionalProperties: false,
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            attachmentId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      },
    },
    getIncidentAttachmentHandler,
  );

  // Upload an attachment to an incident
  app.post<{Params: {id: string}}>(
    '/:id/attachments',
    {
      preHandler: authenticate,
      schema: {
        params: incidentIdValidationParamsSchema,
      },
    },
    uploadIncidentAttachmentHandler,
  );

//Status Update
app.patch<{ Params: { id: string }; Body: UpdateIncidentStatusBody }>(
    '/:id/status',
    {
      preHandler: authenticate,
      schema: {
        params: incidentIdValidationParamsSchema,
        body: updateIncidentValidationStatusBodySchema,
      },
    },
    updateIncidentStatusHandler,
);

 //Cancel 
 app.post<{ Params: { id: string } }>(
  '/:id/cancel',
  {
    preHandler: authenticate,
    schema:{
      params: incidentIdValidationParamsSchema,
    },
  },
  cancelIncidentHandler,
 );

 
app.get<{ Params: { id: string } }>(
  '/:id/status-history',
  {
    preHandler: authenticate,
    schema: {
      params: incidentIdValidationParamsSchema,
    },
  },
  getIncidentStatusHistoryHandler,
);


app.get<{ Params: { id: string } }>(
  '/:id',
  {
    preHandler: authenticate,
    schema: {
        params: incidentIdValidationParamsSchema,
    },
    },
    getIncidentByIdHandler,
);

//Get by reference number
app.get<{ Params: { referenceNumber: string } }>(
    '/reference/:referenceNumber',
    {
      preHandler: authenticate,
      schema: {
        params: incidentReferenceValidationParamsSchema,
      },
    },
    getIncidentByReferenceNumberHandler,
);
 
app.get<{ Querystring: ListIncidentsQuery }>(
    '/',
    {
      preHandler: authenticate,
      schema: {
        querystring: listIncidentsValidationQuerySchema,
      },
    },
    listIncidentsHandler,
);
  
app.post<{Body: CreateIncidentBody}>(
    '/',
    {
      preHandler: authenticate,
      schema: {
        body: createIncidentValidationBodySchema,
      },
    },
    createIncidentHandler,
  );
};
