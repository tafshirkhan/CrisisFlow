
import axios from 'axios';

import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/auth.types';

const IDENTITY_API_URL =
  import.meta.env.VITE_IDENTITY_API_URL ??
  'http://127.0.0.1:3002/api/v1/auth';

export const authApi = axios.create({
  baseURL: IDENTITY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function register(
  input: RegisterRequest,
): Promise<AuthResponse> {
  const response = await authApi.post<AuthResponse>(
    '/register',
    input,
  );

  return response.data;
}

export async function login(
  input: LoginRequest,
): Promise<LoginResponse> {
  const response = await authApi.post<LoginResponse>(
    '/login',
    input,
  );

  return response.data;
}

export async function getCurrentUser(
  accessToken: string,
): Promise<AuthUser> {
  const response = await authApi.get<{ user: AuthUser }>(
    '/me',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return response.data.user;
}
