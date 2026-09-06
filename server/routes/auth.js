import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'study_buddy_jwt_super_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'study_buddy_refresh_secret_key_2026';

// Email validation helper
const isValidEmail = (email) => {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Helper: Generate JWT tokens
 */
const generateTokens = (student) => {
  const payload = {
    id: student.id,
    name: student.name,
    email: student.email,
    role: student.role || 'student',
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

/**
 * 1. STUDENT REGISTRATION
 * POST /api/v1/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid full name (at least 2 characters).',
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check whether the email is already registered
    const existingUser = await pool.query(
      'SELECT id FROM students WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already registered.',
      });
    }

    // 3. Hash password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert new student into registration table
    const result = await pool.query(
      `INSERT INTO students (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, name, email, role, created_at AS "createdAt"`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    const newStudent = result.rows[0];
    const { accessToken, refreshToken } = generateTokens(newStudent);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        role: newStudent.role,
        createdAt: newStudent.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
    });
  }
});

/**
 * 2. STUDENT LOGIN AUTHENTICATION
 * POST /api/v1/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check whether the email exists in the student registration table
    const userResult = await pool.query(
      'SELECT id, name, email, password_hash, role, created_at AS "createdAt" FROM students WHERE LOWER(email) = LOWER($1)',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not registered. Please register first.',
      });
    }

    const student = userResult.rows[0];

    // 3. Verify entered password against stored hashed password
    const isPasswordValid = await bcrypt.compare(password, student.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password.',
      });
    }

    // 4. Generate JWT tokens on successful authentication
    const { accessToken, refreshToken } = generateTokens(student);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role,
        createdAt: student.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
    });
  }
});

/**
 * 3. TOKEN REFRESH
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM students WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const student = userResult.rows[0];
    const tokens = generateTokens(student);

    return res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
});

/**
 * 4. LOGOUT
 * POST /api/v1/auth/logout
 */
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * 5. CURRENT USER (PROTECTED)
 * GET /api/v1/auth/me
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await pool.query(
      'SELECT id, name, email, role, created_at AS "createdAt" FROM students WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: userResult.rows[0],
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

export default router;
