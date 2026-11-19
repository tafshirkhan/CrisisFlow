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

export interface ResponderProfile {
  latitude: number | null;
  longitude: number | null;
  is_available: boolean;
}

export interface ResponderRecord {
  id: string;
  full_name: string;
  profile: ResponderProfile;
  skills: string[];
}