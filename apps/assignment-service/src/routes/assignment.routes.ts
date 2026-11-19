import type { FastifyInstance } from 'fastify';

import { createAssignmentController, 
         getAssignmentsByIncidentIdController, 
         getAssignmentByIdController,
         completeAssignmentController,
        reassignAssignmentController,
        getResponderWorkloadController,
        getActiveAssignmentsByResponderIdController,
        getIncidentsWithActiveAssignmentsController,
        getResponderRecommendationsController, } from '../controllers/assignment.controller.js';

import { authenticate } from '../services/authenticate.js';
import { authorize } from '../services/authorize.js';

export const assignmentRoutes = async (
  app: FastifyInstance,
): Promise<void> => {

  //This creates a protected POST / route. Only authenticated users with the DISPATCHER or ADMIN role can create assignments.
  app.post(
    '/',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    createAssignmentController,
  );

  // Retrieve assignments for an incident.
  // Only authenticated DISPATCHER or ADMIN users can access this route.
  app.get<{Params: { incidentId: string; };}>
  (
    '/incident/:incidentId',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    getAssignmentsByIncidentIdController,
  );

  // Retrieve active assignment counts for responders.
  ///api/v1/assignments/responders/workload
  app.get(
    '/responders/workload',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    getResponderWorkloadController,
  );

   // Retrieve weighted responder recommendations for a specific incident.
  // Only authenticated DISPATCHER or ADMIN users can access this route.
 // GET /api/v1/assignments/incidents/:incidentId/recommendations
  app.get<{ Params: { incidentId: string } }>(
    '/incidents/:incidentId/recommendations',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    getResponderRecommendationsController,
  );

  // Retrieve active assignments for a specific responder.
  // Only authenticated DISPATCHER or ADMIN users can access this route.
  app.get<{ Params: { responderId: string } }>(
    '/responders/:responderId/active',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    getActiveAssignmentsByResponderIdController,
  );

  // Retrieve incident IDs that already have active assignments.
  app.get(
    '/active-incidents',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    getIncidentsWithActiveAssignmentsController,
  );

  app.get<{Params: {assignmentId: string;};}>
  (
    '/:assignmentId',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    getAssignmentByIdController,
  );

  // Complete an active assignment.
  ///api/v1/assignments/:assignmentId/complete
  app.patch<{Params: { assignmentId: string;};}>
  (
    '/:assignmentId/complete',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    completeAssignmentController,
  );

  // Reassign an active assignment to another eligible responder.
  ///api/v1/assignments/:assignmentId/reassign
  app.patch<{Params: {assignmentId: string;};}>
  (
    '/:assignmentId/reassign',
    {
      preHandler: [
        authenticate,
        authorize('DISPATCHER', 'ADMIN'),
      ],
    },
    reassignAssignmentController,
  );

};