import { Pool } from 'mysql2/promise';
import { databaseConfig } from '../config/db';
import { User } from '../models/userModel';
import bcrypt from 'bcrypt';

export class AuthRepository {
  private pool: Pool = databaseConfig;

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const [rows]: any = await this.pool.query(
        `SELECT * FROM users WHERE email = ? AND is_active = TRUE`,
        [email]
      );

      if (rows && rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const [rows]: any = await this.pool.query(
        `SELECT * FROM users WHERE username = ? AND is_active = TRUE`,
        [username]
      );

      if (rows && rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const [rows]: any = await this.pool.query(
        `SELECT * FROM users WHERE id = ? AND is_active = TRUE`,
        [id]
      );

      if (rows && rows.length > 0) {
        return rows[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }

  async createUser(
    email: string,
    username: string,
    name: string,
    password: string,
    role: 'ADMIN' | 'EMPLOYEE' | 'DRIVER'
  ): Promise<User> {
    try {
      // Check if email already exists
      const existingEmail = await this.getUserByEmail(email);
      if (existingEmail) {
        throw new Error('Email already exists');
      }

      // Check if username already exists
      const existingUsername = await this.getUserByUsername(username);
      if (existingUsername) {
        throw new Error('Username already exists');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Insert user
      const [result]: any = await this.pool.query(
        `INSERT INTO users (email, username, name, password_hash, role, must_reset_password, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, username, name, passwordHash, role, false, true]
      );

      // Fetch and return created user
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Failed to create user');
      }

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(newPassword);

      await this.pool.query(
        `UPDATE users SET password_hash = ?, must_reset_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [hashedPassword, userId]
      );
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}
