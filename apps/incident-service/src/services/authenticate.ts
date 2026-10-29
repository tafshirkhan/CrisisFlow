
import type {
  FastifyReply,
  FastifyRequest,
  preHandlerHookHandler,
} from 'fastify';

export type UserRole =
  | 'CITIZEN'
  | 'DISPATCHER'
  | 'RESPONDER'
  | 'ADMIN';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}

const allowedRoles: UserRole[] = [
  'CITIZEN',
  'DISPATCHER',
  'RESPONDER',
  'ADMIN',
];

export const authenticate: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    await request.jwtVerify();

    const user = request.user;

    if (
      !user.sub ||
      !user.email ||
      !allowedRoles.includes(user.role)
    ) {
      return reply.code(401).send({
        message: 'Access token contains invalid user information.',
      });
    }
  } catch {
    return reply.code(401).send({
      message: 'Authentication required or access token is invalid.',
    });
  }
};
