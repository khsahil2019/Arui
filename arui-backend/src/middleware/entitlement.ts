import type { Request, Response, NextFunction } from 'express';
import { EntitlementService } from '../modules/entitlements/service.js';

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
