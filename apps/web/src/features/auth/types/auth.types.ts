
export type UserRole =
  | 'CITIZEN'
  | 'DISPATCHER'
  | 'RESPONDER'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}

export interface LoginResponse extends AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
