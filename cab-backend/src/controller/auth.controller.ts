import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { AuthRepository } from '../repository/auth.repository';
import { LoginRequest, SignupRequest } from '../models/userModel';

const authService = new AuthService(new AuthRepository());
const authRepository = new AuthRepository();

export const login = async (req: Request, res: Response) => {
  try {
    const credentials: LoginRequest = req.body;

    // Validate input
    if (!credentials.password) {
      res.status(400).json({ message: 'Password is required' });
      return;
    }

    if (!credentials.email && !credentials.username) {
      res.status(400).json({ message: 'Email or username is required' });
      return;
    }

    console.log('Login attempt with:', { email: credentials.email, username: credentials.username });

    const result = await authService.login(credentials);

    // Set refresh token in httpOnly cookie (optional but recommended)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(401).json({ message: errorMessage });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    const result = await authService.refreshAccessToken(token);

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(401).json({ message: errorMessage });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(400).json({ message: 'Authorization header with Bearer token is required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = await authService.verifyAccessToken(token);

    res.status(200).json({
      message: 'Token is valid',
      user: decoded,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(401).json({ message: errorMessage });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const signupData: SignupRequest = req.body;

    // Validate input
    if (!signupData.email || !signupData.username || !signupData.name || !signupData.password || !signupData.role) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    if (signupData.password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    console.log('Signup attempt with:', { email: signupData.email, username: signupData.username });

    const result = await authService.signup(signupData);

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'Signup successful',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const statusCode = errorMessage.includes('already exists') ? 409 : 400;
    res.status(statusCode).json({ message: errorMessage });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const { newPassword, confirmPassword, email } = req.body;

    if (!newPassword || !confirmPassword) {
      res.status(400).json({ message: 'New password and confirmation are required' });
      return;
    }

    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = await authService.verifyAccessToken(token);
      userId = decoded.id;
    } else if (email) {
      const user = await authRepository.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ message: 'User with provided email not found' });
        return;
      }
      userId = user.id;
    } else {
      res.status(400).json({ message: 'Authorization token or email is required to reset password' });
      return;
    }

    await authService.resetPassword(userId, newPassword, confirmPassword);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    res.status(400).json({ message: errorMessage });
  }
};
