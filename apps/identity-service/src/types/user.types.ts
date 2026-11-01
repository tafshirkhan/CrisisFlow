export type UserRole =
  | 'CITIZEN'
  | 'DISPATCHER'
  | 'RESPONDER'
  | 'ADMIN';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

export interface ResponderRecord {
  id: string;
  full_name: string;
}