
import { authenticate } from '../services/authenticate.js';
import { findUserById } from '../repositories/user.repository.js';
import type { FastifyPluginAsync } from 'fastify';
import {
  AuthError,
  loginCitizen,
  registerCitizen,
} from '../services/auth.service.js';
import { loginSchema } from '../validation-schemas/login.schema.js';
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

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        message: 'Invalid login details.',
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    try {
      const user = await loginCitizen(
        parsed.data.email,
        parsed.data.password,
      );

      const accessToken = app.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return reply.code(200).send({
        message: 'Login successful.',
        user,
        accessToken,
        tokenType: 'Bearer',
        expiresIn: 900,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return reply.code(error.statusCode).send({
          message: error.message,
        });
      }

      request.log.error(error);

      return reply.code(500).send({
        message: 'Unable to log in.',
      });
    }
  });

  //This route obtains the user ID from the verified token, rather than trusting an ID supplied by the client.
  app.get(
    '/me',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = request.user.sub;

      const user = await findUserById(userId);

      if (!user || !user.is_active) {
        return reply.code(401).send({
          message: 'User account is unavailable.',
        });
      }

      return reply.code(200).send({
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        },
      });
    },
  );

};
