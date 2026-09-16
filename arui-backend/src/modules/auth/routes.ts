import { Router } from 'express';
import { query } from '../../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate, getJwtSecret } from '../../middleware/auth.js';

const router = Router();

// Production User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const uRes = await query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
    if (uRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userRow = uRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get institution if associated
    let institution = null;
    if (userRow.institution_id) {
      const instRes = await query(`SELECT id, name, slug FROM institutions WHERE id = $1`, [userRow.institution_id]);
      if (instRes.rows.length > 0) {
        institution = instRes.rows[0];
      }
    }

    const productCode = (req.body.productCode || req.body.engine || 'arui').toLowerCase();

    // Get latest assessment for institution and product
    let assessmentId = null;
    if (userRow.institution_id) {
      const aRes = await query(
        `SELECT id FROM assessments WHERE institution_id = $1 AND product_code = $2 ORDER BY created_at DESC LIMIT 1`,
        [userRow.institution_id, productCode]
      );
      if (aRes.rows.length > 0) {
        assessmentId = aRes.rows[0].id;
      } else {
        // Fallback to any assessment for this institution
        const anyRes = await query(
          `SELECT id FROM assessments WHERE institution_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [userRow.institution_id]
        );
        if (anyRes.rows.length > 0) {
          assessmentId = anyRes.rows[0].id;
        } else {
          const mvRes = await query(`SELECT id FROM methodology_versions WHERE product_code = $1 AND is_active = true LIMIT 1`, [productCode]);
          const versionId = mvRes.rows[0]?.id;
          const insRes = await query(
            `INSERT INTO assessments (product_code, institution_id, methodology_version_id, title, status, stage, current_domain)
             VALUES ($1, $2, $3, 'Institutional Assessment (2026 Baseline)', 'DRAFT', 'profile', 'D01')
             RETURNING id`,
            [productCode, userRow.institution_id, versionId]
          );
          if (insRes.rows.length > 0) {
            assessmentId = insRes.rows[0].id;
          }
        }
      }
    } else {
      const aRes = await query(
        `SELECT id FROM assessments WHERE product_code = $1 ORDER BY created_at DESC LIMIT 1`,
        [productCode]
      );
      if (aRes.rows.length > 0) {
        assessmentId = aRes.rows[0].id;
      } else {
        const fallbackRes = await query(`SELECT id FROM assessments ORDER BY created_at DESC LIMIT 1`);
        if (fallbackRes.rows.length > 0) assessmentId = fallbackRes.rows[0].id;
      }
    }

    const roleUpper = userRow.role?.toUpperCase() || 'INSTITUTION_ADMIN';
    const roleForClient = roleUpper.toLowerCase();

    const payload = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      role: roleUpper,
      institutionId: userRow.institution_id,
      assessmentId,
    };

    const secret = getJwtSecret();
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return res.json({
      token,
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: roleForClient,
      },
      institution: institution ? { id: institution.id, name: institution.name } : null,
      assessmentId,
      expiresAt,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Current User info
router.get('/me', authenticate, async (req, res) => {
  try {
    const uRes = await query(`SELECT id, email, name, role, institution_id FROM users WHERE id = $1`, [req.user?.id]);
    if (uRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userRow = uRes.rows[0];
    let institution = null;
    if (userRow.institution_id) {
      const instRes = await query(`SELECT id, name FROM institutions WHERE id = $1`, [userRow.institution_id]);
      if (instRes.rows.length > 0) institution = instRes.rows[0];
    }

    let assessmentId = req.user?.assessmentId || null;
    if (!assessmentId && userRow.institution_id) {
      const aRes = await query(
        `SELECT id FROM assessments WHERE institution_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userRow.institution_id]
      );
      if (aRes.rows.length > 0) assessmentId = aRes.rows[0].id;
    }

    const roleForClient = (userRow.role || 'INSTITUTION_ADMIN').toLowerCase();

    return res.json({
      token: req.headers.authorization?.split(' ')[1] || '',
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        role: roleForClient,
      },
      institution: institution ? { id: institution.id, name: institution.name } : null,
      assessmentId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
