import type { Request, Response, NextFunction } from 'express';
import { EntitlementService } from '../modules/entitlements/service.js';
import { query } from '../db/index.js';

/**
 * Server-Side Independent Verification of Engine Entitlement (Instructions #73, #74, #75)
 * Protects assessment endpoints so users cannot access unpurchased engines.
 */
export function requireEngineEntitlement(specifiedProductCode?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Assessors, Lead Auditors, and Super Admins bypass institutional entitlement checks
    const role = req.user?.role;
    if (role === 'ASSESSOR' || role === 'LEAD_AUDITOR' || role === 'SUPER_ADMIN') {
      return next();
    }

    const institutionId = req.user?.institutionId;
    if (!institutionId) {
      return res.status(403).json({
        error: 'INSTITUTION_REQUIRED',
        message: 'User is not bound to a valid institution account',
      });
    }

    const productCode = (specifiedProductCode || (req.params.productCode as string) || (req.body?.productCode as string) || 'arui').toLowerCase();

    try {
      const check = await EntitlementService.checkEngineAccess(institutionId, productCode);
      if (!check.isAllowed) {
        return res.status(403).json({
          error: 'ENGINE_NOT_PURCHASED',
          productCode,
          status: check.status,
          message: check.reason || `${productCode.toUpperCase()} assessment access has not been activated for this institution.`,
          engagementUrl: `/assessment/${productCode}/engagement`,
        });
      }
      next();
    } catch (err: any) {
      return res.status(500).json({ error: 'Entitlement verification failed', message: err.message });
    }
  };
}


/**
 * Resolve the product from the assessment itself and then enforce entitlement.
 * This prevents an ARUI/ECRI session from crossing engine boundaries and avoids
 * trusting productCode supplied by the browser for assessment-scoped operations.
 */
export function requireAssessmentEngineAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Institution-scoped profile endpoints are not assessment-scoped.
    if (String(req.path).includes('/institutions/')) return next();
    const assessmentId = (req.params.id || req.params.assessmentId) as string | undefined;
    const role = req.user?.role;
    if (role === 'ASSESSOR' || role === 'LEAD_AUDITOR' || role === 'SUPER_ADMIN') return next();
    if (!assessmentId) return res.status(400).json({ error: 'ASSESSMENT_ID_REQUIRED' });
    const institutionId = req.user?.institutionId;
    if (!institutionId) return res.status(403).json({ error: 'INSTITUTION_REQUIRED' });

    try {
      const assessmentRes = await query(`
        SELECT product_code, institution_id
        FROM assessments
        WHERE id = $1
      `, [assessmentId]);
      if (assessmentRes.rows.length === 0) return res.status(404).json({ error: 'ASSESSMENT_NOT_FOUND' });
      const assessment = assessmentRes.rows[0];
      if (assessment.institution_id !== institutionId) return res.status(403).json({ error: 'FORBIDDEN' });
      const productCode = String(assessment.product_code || '').toLowerCase();
      if (!productCode) return res.status(409).json({ error: 'ASSESSMENT_PRODUCT_UNDEFINED' });

      const check = await EntitlementService.checkEngineAccess(institutionId, productCode);
      if (!check.isAllowed) {
        return res.status(403).json({
          error: 'ENGINE_NOT_PURCHASED',
          productCode,
          status: check.status,
          message: check.reason || `${productCode.toUpperCase()} assessment access is not active.`,
          engagementUrl: `/ecri/engagement`,
        });
      }
      return next();
    } catch (err: any) {
      return res.status(500).json({ error: 'Entitlement verification failed', message: err.message });
    }
  };
}
