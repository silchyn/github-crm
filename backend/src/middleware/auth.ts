import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { createSecretKey } from 'crypto';

/**
 * Extended Request interface to include user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user data to request
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Verify user still exists in database
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'Invalid token - user not found' });
      return;
    }

    // Add user data to request
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else {
      console.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
};

/**
 * Generate JWT token for user
 * @param userId - User ID
 * @param email - User email
 * @returns JWT token
 */
export const generateToken = (userId: number, email: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = Number(process.env.JWT_EXPIRES_IN) || 604800;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't return error if no token
 * Used for endpoints that work with or without authentication
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await UserModel.findById(decoded.userId);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user data
    next();
  }
};
