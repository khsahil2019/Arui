import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/index.js';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment');
    }
    return 'arui_dev_secret_key_change_in_production_min32chars';
  }
  return secret;
}

export type UserRole = 'INSTITUTION_ADMIN' | 'ASSESSOR' | 'LEAD_AUDITOR' | 'SUPER_ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId: string | null;
  assessmentId?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: missing or invalid Bearer token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as any;
    
    // Normalize role
    const normalizedRole = (decoded.role?.toUpperCase() || 'INSTITUTION_ADMIN') as UserRole;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: normalizedRole,
      institutionId: decoded.institutionId || null,
      assessmentId: decoded.assessmentId || null,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token', message: err.message });
  }
};

export const requireRole = (allowedRoles: (UserRole | string)[]) => {
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!normalizedAllowed.includes(req.user.role.toUpperCase())) {
      return res.status(403).json({ error: `Forbidden: Insufficient privileges. Required one of: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

/**
 * Server-side Multi-tenant Institution Isolation
 * Ensures an institution admin can ONLY access resources belonging to their own institution.
 * Assessors, Lead Auditors, and Super Admins can access any institution for review.
 */
export const requireInstitutionAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const role = req.user.role;
  if (['SUPER_ADMIN', 'LEAD_AUDITOR', 'ASSESSOR'].includes(role)) {
    return next();
  }

  // For INSTITUTION_ADMIN, determine target institution
  let targetInstitutionId: string | null = null;
  const assessmentId = req.params.assessmentId || req.params.id || req.body.assessmentId || (req.query.assessmentId as string);
  const institutionId = req.params.institutionId || req.body.institutionId || (req.query.institutionId as string);

  if (institutionId) {
    targetInstitutionId = institutionId;
  } else if (assessmentId) {
    try {
      const aRes = await query(`SELECT institution_id FROM assessments WHERE id = $1`, [assessmentId]);
      if (aRes.rows.length > 0) {
        targetInstitutionId = aRes.rows[0].institution_id;
      }
    } catch (e) {
      console.error('Failed to verify assessment institution:', e);
    }
  }

  if (targetInstitutionId && req.user.institutionId && targetInstitutionId !== req.user.institutionId) {
    return res.status(403).json({ error: 'Forbidden: You do not have access to this institution data.' });
  }

  next();
};
