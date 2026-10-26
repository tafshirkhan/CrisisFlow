
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

//This tells TypeScript that the JWT payload and the verified request.user contain sub, email, and role
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}