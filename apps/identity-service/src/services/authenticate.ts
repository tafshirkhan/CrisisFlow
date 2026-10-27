
import type { FastifyReply, FastifyRequest } from 'fastify';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    return reply.code(401).send({
      message: 'Authentication required or access token is invalid.',
    });
  }
}

//This hook verifies the JWT signature and expiry. If the token is missing, invalid, or expired, the request receives HTTP 401 Unauthorized.