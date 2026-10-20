import { buildApp } from './app.js';
import { pool } from './config/database.js';

const app = buildApp();

const start = async (): Promise<void> => {
  try {
    const address = await app.listen({
      port: Number(process.env.PORT ?? 3001),
      host: '127.0.0.1',
    });

    app.log.info(`Incident Service is running at ${address}`);
  } catch (error) {
    app.log.error(error);
    await app.close();
    await pool.end();
    process.exitCode = 1;
  }
};

void start();
////---------------------------------------------------------------------------------------------------------------------------------
// import Fastify from 'fastify';
// import { pool } from './config/database.js';
// import { incidentRoutes } from './routes/incident.routes.js';

// const app = Fastify({
//   logger: true,
// });

// app.get('/health', async () => {
//   return {
//     status: 'ok',
//     service: 'incident-service',
//     message: 'CrisisFlow Incident Service is perfectly running!!!!',
//   };
// });

// app.register(incidentRoutes, {
//   prefix: '/api/v1/incidents',
// });

// const start = async (): Promise<void> => {
//   try {
//     await app.listen({
//       port: Number(process.env.PORT ?? 3001),
//       host: '127.0.0.1',
//     });

//     app.log.info('Incident Service is running');
//   } catch (error) {
//     app.log.error(error);
//     await pool.end();
//     process.exit(1);
//   }
// };

// void start();
