
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.routes.js';
import { internalRoutes } from './routes/internal.routes.js';

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

  app.register(authRoutes, {
    prefix: '/api/v1/auth',
  });
  
  app.register(internalRoutes, {
    prefix: '/api/v1/internal',
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'identity-service',
    message: 'CrisisFlow Identity Service is running',
  }));

  return app;
};
