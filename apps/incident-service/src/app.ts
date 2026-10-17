
import Fastify from 'fastify';
import { incidentRoutes } from './routes/incident.routes.js';

export const buildApp = () => {
  const app = Fastify({
    logger: false,
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
