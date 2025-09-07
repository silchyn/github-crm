import { pool } from '../config/database';
import bcrypt from 'bcryptjs';

/**
 * User model interface
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * User creation interface
 */
export interface CreateUser {
  email: string;
  password: string;
}

/**
 * User model class with database operations
 */
export class UserModel {
  /**
   * Create a new user
   */
  static async create(userData: CreateUser): Promise<User> {
    const { email, password } = userData;

    // Hash the password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, password_hash, created_at, updated_at
    `;

    const values = [email, password_hash];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Verify user password
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Check if email already exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM users WHERE email = $1
    `;

    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}
