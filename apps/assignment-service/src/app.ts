import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { assignmentRoutes } from './routes/assignment.routes.js';
import { createHash } from 'node:crypto';

export const buildApp = () => {
  const app = Fastify({
    logger: false,
  });

  const jwtSecret = process.env.JWT_SECRET;
 console.log(
  'JWT_SECRET fingerprint:',
  createHash('sha256')
    .update(jwtSecret ?? '')
    .digest('hex')
    .slice(0, 12),
);

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be configured with at least 32 characters.',
    );
  }

  app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });

  app.register(jwt, {
    secret: jwtSecret,
    sign: {
      expiresIn: '15m',
    },
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'assignment-service',
    message: 'CrisisFlow Assignment Service is running',
  }));

  //http://localhost:3003/api/v1/assignments
  app.register(assignmentRoutes, {
    prefix: '/api/v1/assignments',
  });

  return app;
};