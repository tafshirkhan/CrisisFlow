
import type { FastifyPluginAsync } from 'fastify';
import { timingSafeEqual } from 'node:crypto';
import { findUserById } from '../repositories/user.repository.js';

export const internalRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { userId: string } }>(
    '/users/:userId/assignment-eligibility',
    async (request, reply) => {
      const configuredKey = process.env.IDENTITY_SERVICE_API_KEY;
      const providedKey = request.headers['x-internal-api-key'];

      if (!configuredKey) {
        return reply.code(503).send({
          message: 'Internal service authentication is not configured.',
        });
      }

      if (
        typeof providedKey !== 'string' ||
        Buffer.byteLength(providedKey) !== Buffer.byteLength(configuredKey) ||
        !timingSafeEqual(
          Buffer.from(providedKey),
          Buffer.from(configuredKey),
        )
      ) {
        return reply.code(401).send({
          message: 'Internal service authentication failed.',
        });
      }

      const { userId } = request.params;

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(userId)) {
        return reply.code(400).send({
          message: 'Invalid user ID.',
        });
      }

      try {
        const user = await findUserById(userId);

        if (!user) {
          return reply.code(404).send({
            message: 'User not found.',
          });
        }

        return reply.code(200).send({
          user: {
            id: user.id,
            role: user.role,
            isActive: user.is_active,
            isEligible:
              user.role === 'RESPONDER' && user.is_active,
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to validate responder');

        return reply.code(500).send({
          message: 'Unable to validate responder.',
        });
      }
    },
  );
};
