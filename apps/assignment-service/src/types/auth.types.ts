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
