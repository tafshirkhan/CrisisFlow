
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.routes.js';

export const buildApp = () => {
  const app = Fastify({
    logger: false,
  });

  app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });

  app.register(authRoutes, {
    prefix: '/api/v1/auth',
  });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'identity-service',
    message: 'CrisisFlow Identity Service is running',
  }));

  return app;
};
