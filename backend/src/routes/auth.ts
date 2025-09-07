import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../validation/schemas';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.emailExists(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await UserModel.create({ email, password });

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register user'
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // authenticateToken populates req.user
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Fetch fresh user data from database
    const userData = await UserModel.findById(user.id);
    if (!userData) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user information'
    });
  }
});

export default router;
