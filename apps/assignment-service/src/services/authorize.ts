import type {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from 'fastify';

import type { UserRole } from '../types/auth.types.js';

export const authorize = (
  ...allowedRoles: UserRole[]
): preHandlerHookHandler => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        message: 'You do not have permission to access this resource.',
      });
    }
  };
};