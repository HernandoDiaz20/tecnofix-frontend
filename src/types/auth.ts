export const ROLES = {
  CLIENTE: 'cliente',
  TECNICO: 'tecnico',
  ADMINISTRADOR: 'administrador',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  phone?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
