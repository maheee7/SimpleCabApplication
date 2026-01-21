import jwt from 'jsonwebtoken';
import { AuthRepository } from '../repository/auth.repository';
import { LoginRequest, SignupRequest, AuthResponse, TokenPayload, User } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'oJBpjyICNsMQPdw4H28Q69toyYUjjob1Z7VrxWR9525';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'mpnG03uGZBqUdck2ygkeHkw3xNDEdU8eWC3hYDaR0xD';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository) {
    this.repository = repository;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email or username
      let user: User | null = null;

      if (credentials.email) {
        user = await this.repository.getUserByEmail(credentials.email);
      } else if (credentials.username) {
        user = await this.repository.getUserByUsername(credentials.username);
      }

      if (!user) {
        throw new Error('Invalid credentials: User not found');
      }

      // Verify password
      const isPasswordValid = await this.repository.verifyPassword(
        credentials.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        throw new Error('Invalid credentials: Incorrect password');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      const refreshToken = jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid or expired token');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as TokenPayload;

      const user = await this.repository.getUserById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      return { accessToken };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  async signup(signupData: SignupRequest): Promise<AuthResponse> {
    try {
      // Validate input
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (signupData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create user
      const user = await this.repository.createUser(
        signupData.email,
        signupData.username,
        signupData.name,
        signupData.password,
        signupData.role
      );

      // Generate tokens
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      const refreshToken = jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async resetPassword(userId: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      await this.repository.updatePassword(userId, newPassword);

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
}
