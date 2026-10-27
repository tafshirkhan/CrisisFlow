
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '../types/auth.types.js';

export function authorize(...allowedRoles: UserRole[]) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    // Verify the JWT before checking the user's role.
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({
        message: 'Authentication required or access token is invalid.',
      });
    }

    // Authentication has succeeded; now check authorization.
    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        message: 'You do not have permission to access this resource.',
      });
    }
  };
}

// 01 Unauthorized: The request has no valid access token.
// 403 Forbidden: The user is authenticated but their role isn't permitted.
// Allowed role: The request continues to the route handler.