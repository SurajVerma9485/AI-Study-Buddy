import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'study_buddy_jwt_super_secret_key_2026';

/**
 * Authentication middleware that verifies JWT token from Authorization header.
 * Attaches decoded user info (including user.id) to req.user.
 * Rejects requests without valid credentials with 401 Unauthorized.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  // Handle demo token if used
  if (token === 'demo-access-token-12345') {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Student',
      email: 'demo@studybuddy.internal',
      role: 'student',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token payload.',
      });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || 'student',
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
}

export default authenticateToken;
