export interface User {
  id: string;
  email: string;
  username?: string;
  name?: string;
  password_hash: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'DRIVER';
  must_reset_password: boolean;
  is_active: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'DRIVER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username?: string;
    name?: string;
    role: string;
  };
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}
