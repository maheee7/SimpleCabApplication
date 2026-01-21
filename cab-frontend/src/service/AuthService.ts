import { clientservice } from '../client/client';

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'DRIVER';
}

export interface AuthResponse {
  message: string;
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

export interface TokenRefreshResponse {
  message: string;
  accessToken: string;
}

// Login with email or username
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await clientservice('POST', '/auth/login', credentials);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Signup with email, username, name, password and role
export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  try {
    const response = await clientservice('POST', '/auth/signup', credentials);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<TokenRefreshResponse> {
  try {
    const response = await clientservice('POST', '/auth/refresh-token', {
      refreshToken,
    });
    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}

// Verify token
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyToken(accessToken: string): Promise<{ message: string; user: any }> {
  try {
    const response = await clientservice('GET', '/auth/verify-token', {}, {
      Authorization: `Bearer ${accessToken}`,
    });
    return response;
  } catch (error) {
    console.error('Token verification error:', error);
    throw error;
  }
}

// Reset password
export async function resetPassword(newPassword: string, confirmPassword: string, email?: string): Promise<{ message: string }> {
  try {
    const body: any = { newPassword, confirmPassword };
    if (email) body.email = email;
    const response = await clientservice('POST', '/auth/reset-password', body);
    return response;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

// Logout
export async function logout(): Promise<{ message: string }> {
  try {
    const response = await clientservice('POST', '/auth/logout', {});
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Get stored user info
export function getStoredUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
}

// Get stored access token
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Get stored refresh token
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}
