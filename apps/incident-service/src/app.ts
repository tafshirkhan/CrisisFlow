
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';

import { incidentRoutes } from './routes/incident.routes.js';

export const buildApp = () => {
  const app = Fastify({
    logger: false,
  });

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be configured with at least 32 characters.',
    );
  }

  //CORS Allow requests from the React frontend.
  app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });

  // Verify JWT tokens issued by the Identity Service.
  app.register(jwt, {
    secret: jwtSecret,
    verify: {
      allowedIss: undefined,
    },
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
      message:
        'CrisisFlow Incident Service is perfectly running!!!!',
    };
  });

  app.register(incidentRoutes, {
    prefix: '/api/v1/incidents',
  });

  return app;
};
