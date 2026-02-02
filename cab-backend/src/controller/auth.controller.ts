import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthRepository } from '../repository/auth.repository';
import { LoginRequest, SignupRequest } from '../models/userModel';

export class AuthController {
  private authService: AuthService;
  private authRepository: AuthRepository;

  constructor(authService: AuthService, authRepository: AuthRepository) {
    this.authService = authService;
    this.authRepository = authRepository;
  }

  async login(req: Request, res: Response) {
    try {
      const credentials: LoginRequest = req.body;

      if (!credentials.password) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_PASSWORD', message: 'Password is required' }
        });
        return;
      }

      if (!credentials.email && !credentials.username) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_CREDENTIALS', message: 'Email or username is required' }
        });
        return;
      }

      const result = await this.authService.login(credentials);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      res.status(401).json({
        status: 'error',
        errors: { code: 'UNAUTHORIZED', message: errorMessage }
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const token = req.body.refreshToken || req.cookies.refreshToken;

      if (!token) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_TOKEN', message: 'Refresh token is required' }
        });
        return;
      }

      const result = await this.authService.refreshAccessToken(token);

      res.status(200).json({
        status: 'success',
        data: { accessToken: result.accessToken },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      res.status(401).json({
        status: 'error',
        errors: { code: 'UNAUTHORIZED', message: errorMessage }
      });
    }
  }

  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_AUTH_HEADER', message: 'Authorization header with Bearer token is required' }
        });
        return;
      }

      const token = authHeader.substring(7);
      const decoded = await this.authService.verifyAccessToken(token);

      res.status(200).json({
        status: 'success',
        data: { user: decoded },
        message: 'Token is valid'
      });
    } catch (error) {
      console.error('Token verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      res.status(401).json({
        status: 'error',
        errors: { code: 'UNAUTHORIZED', message: errorMessage }
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie('refreshToken');
      res.status(200).json({
        status: 'success',
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async signup(req: Request, res: Response) {
    try {
      const signupData: SignupRequest = req.body;

      if (!signupData.email || !signupData.username || !signupData.name || !signupData.password || !signupData.role) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'INCOMPLETE_DATA', message: 'All fields are required' }
        });
        return;
      }

      if (signupData.password !== signupData.confirmPassword) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' }
        });
        return;
      }

      const result = await this.authService.signup(signupData);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        status: 'success',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
        message: 'Signup successful'
      });
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      const statusCode = errorMessage.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        status: 'error',
        errors: { code: statusCode === 409 ? 'USER_EXISTS' : 'SIGNUP_FAILED', message: errorMessage }
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const { newPassword, confirmPassword, email } = req.body;

      if (!newPassword || !confirmPassword) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_PASSWORD', message: 'New password and confirmation are required' }
        });
        return;
      }

      let userId: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = await this.authService.verifyAccessToken(token);
        userId = decoded.id;
      } else if (email) {
        const user = await this.authRepository.getUserByEmail(email);
        if (!user) {
          res.status(400).json({
            status: 'error',
            errors: { code: 'USER_NOT_FOUND', message: 'User with provided email not found' }
          });
          return;
        }
        userId = user.id;
      } else {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_IDENTIFIER', message: 'Authorization token or email is required' }
        });
        return;
      }

      await this.authService.resetPassword(userId, newPassword, confirmPassword);

      res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      res.status(400).json({
        status: 'error',
        errors: { code: 'RESET_FAILED', message: errorMessage }
      });
    }
  }
}
