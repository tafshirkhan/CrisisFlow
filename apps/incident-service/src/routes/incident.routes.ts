
import type { FastifyInstance } from 'fastify';

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
  app.get(
    '/:id/attachments',
    {
      schema: {
        params: incidentIdValidationParamsSchema,
      },
    },
    listIncidentAttachmentsHandler,
  );

  // Retrieve an attachment belonging to an incident
  app.get(
    '/:id/attachments/:attachmentId',
    {
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
  app.post(
    '/:id/attachments',
    {
      schema: {
        params: incidentIdValidationParamsSchema,
      },
    },
    uploadIncidentAttachmentHandler,
  );
  //Status Update
  app.patch(
    '/:id/status',
    {
      schema: {
        params: incidentIdValidationParamsSchema,
        body: updateIncidentValidationStatusBodySchema,
      },
    },
    updateIncidentStatusHandler,
  );
 //Cancel 
 app.post(
  '/:id/cancel',
  {
    schema:{
      params: incidentIdValidationParamsSchema,
    },
  },
  cancelIncidentHandler,
 );

 
app.get(
  '/:id/status-history',
  {
    schema: {
      params: incidentIdValidationParamsSchema,
    },
  },
  getIncidentStatusHistoryHandler,
);


  app.get(
  '/:id',
  {
  schema: {
      params: incidentIdValidationParamsSchema,
  },
  },
  getIncidentByIdHandler,
  );

  //Get by reference number
  app.get(
    '/reference/:referenceNumber',
    {
      schema: {
        params: incidentReferenceValidationParamsSchema,
      },
    },
    getIncidentByReferenceNumberHandler,
  );
 
  app.get(
    '/',
    {
      schema: {
        querystring: listIncidentsValidationQuerySchema,
      },
    },
    listIncidentsHandler,
  );
  
  app.post(
    '/',
    {
      schema: {
        body: createIncidentValidationBodySchema,
      },
    },
    createIncidentHandler,
  );
};
