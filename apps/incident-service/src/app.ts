
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { incidentRoutes } from './routes/incident.routes.js';

export const buildApp = () => {
  const app = Fastify({
    logger: false,
  });
  // Enable multipart file uploads.
  app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB per file
      files: 1, // One file per request
    },
  });

  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'incident-service',
      message: 'CrisisFlow Incident Service is perfectly running!!!!',
    };
  });

  app.register(incidentRoutes, {
    prefix: '/api/v1/incidents',
  });

  return app;
};
