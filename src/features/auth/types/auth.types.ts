import type { Role, ProfileStatus } from "../../../core/auth/types";

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface MeUserDTO {
  id: string;
  nombre?: string;
  email?: string;
  role: Role;
  profileStatus: ProfileStatus;
  emailVerifiedAt?: string | null;
  activo?: boolean;
}

export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresAt?: string;
}

export interface LoginResponse {
  user: MeUserDTO;
  tokens: TokensDTO;
  session?: { id: string };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  tokens: TokensDTO;
  session?: { id: string };
}

export interface VerifyEmailRequest {
  email: string;
}

export interface VerifyEmailConfirmRequest {
  email: string;
  code: string;
}

export interface VerifyEmailConfirmResponse {
  message: string;
}

export type MeResponse = MeUserDTO;
