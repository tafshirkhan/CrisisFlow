
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
} from '../controllers/incident.controller.js';
import {
  uploadIncidentAttachmentHandler,
} from '../controllers/incident-attachment.controller.js';

import {
  incidentIdValidationParamsSchema,
  updateIncidentValidationStatusBodySchema,
  createIncidentValidationBodySchema,
  listIncidentsValidationQuerySchema,
} from '../validation-schemas/incident-validation.schema.js';

export const incidentRoutes = async (
  app: FastifyInstance,
): Promise<void> => {

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
    // app.get(
    // '/:id',
    // {
    // schema: {
    //     params: {
    //     type: 'object',
    //     required: ['id'],
    //     additionalProperties: false,
    //     properties: {
    //         id: {
    //         type: 'string',
    //         format: 'uuid',
    //         },
    //     },
    //     },
    // },
    // },
    // getIncidentByIdHandler,
    // );

    app.get(
    '/:id',
    {
    schema: {
        params: incidentIdValidationParamsSchema,
    },
    },
    getIncidentByIdHandler,
    );
  // app.get(
  //   '/',
  //   {
  //     schema: {
  //       querystring: {
  //         type: 'object',
  //         additionalProperties: false,
  //         properties: {
  //           status: {
  //             type: 'string',
  //             enum: [...INCIDENT_STATUSES],
  //           },
  //           priority: {
  //             type: 'string',
  //             enum: [...INCIDENT_PRIORITIES],
  //           },
  //           limit: {
  //             type: 'integer',
  //             minimum: 1,
  //             maximum: 100,
  //             default: 20,
  //           },
  //           offset: {
  //             type: 'integer',
  //             minimum: 0,
  //             default: 0,
  //           },
  //         },
  //       },
  //     },
  //   },
  //   listIncidentsHandler,
  // );
  app.get(
    '/',
    {
      schema: {
        querystring: listIncidentsValidationQuerySchema,
      },
    },
    listIncidentsHandler,
  );
  // app.post(
  //   '/',
  //   {
  //     schema: {
  //       body: {
  //         type: 'object',
  //         additionalProperties: false,
  //         required: ['type', 'description'],
  //         properties: {
  //           type: {
  //             type: 'string',
  //             enum: [...INCIDENT_TYPES],
  //           },
  //           description: {
  //             type: 'string',
  //             minLength: 10,
  //             maxLength: 5000,
  //           },
  //           latitude: {
  //             type: 'number',
  //             minimum: -90,
  //             maximum: 90,
  //           },
  //           longitude: {
  //             type: 'number',
  //             minimum: -180,
  //             maximum: 180,
  //           },
  //           address: {
  //             type: 'string',
  //             maxLength: 1000,
  //           },
  //           reportedBy: {
  //             type: 'string',
  //             maxLength: 100,
  //           },
  //         },
  //       },
  //     },
  //   },
  //   createIncidentHandler,
  // );
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
