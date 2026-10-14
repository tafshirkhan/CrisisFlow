import Fastify from 'fastify';
import { pool } from './config/database.js';
import { incidentRoutes } from './routes/incident.routes.js';

const app = Fastify({
  logger: true,
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

const start = async (): Promise<void> => {
  try {
    await app.listen({
      port: Number(process.env.PORT ?? 3001),
      host: '127.0.0.1',
    });

    app.log.info('Incident Service is running');
  } catch (error) {
    app.log.error(error);
    await pool.end();
    process.exit(1);
  }
};

void start();
