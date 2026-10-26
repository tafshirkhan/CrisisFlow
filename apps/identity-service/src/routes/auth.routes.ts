
import type { FastifyPluginAsync } from 'fastify';
import { AuthError, registerCitizen } from '../services/auth.service.js';
import { registerSchema } from '../validation-schemas/register.schema.js';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        message: 'Invalid registration details.',
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    try {
      const user = await registerCitizen(parsed.data);

      return reply.code(201).send({
        message: 'Citizen account created successfully.',
        user,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return reply.code(error.statusCode).send({
          message: error.message,
        });
      }

      request.log.error(error);

      return reply.code(500).send({
        message: 'Unable to create the account.',
      });
    }
  });
};
