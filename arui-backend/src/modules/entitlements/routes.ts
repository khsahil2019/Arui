import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { query } from '../../db/index.js';
import { EntitlementService } from './service.js';

const router = Router();

// 1. Get Full Institutional Assessment Portfolio (Instruction #60, #78)
router.get('/portfolio', authenticate, async (req, res) => {
  const institutionId = req.user?.institutionId;
  if (!institutionId) {
    return res.status(400).json({ error: 'User is not associated with an institution' });
  }

  try {
    const portfolio = await EntitlementService.getInstitutionPortfolio(institutionId);
    res.json(portfolio);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve portfolio', message: err.message });
  }
});

// 2. Check Entitlement for a Specific Engine (Instruction #74)
router.get('/:productCode/check', authenticate, async (req, res) => {
  const institutionId = req.user?.institutionId;
  const productCode = (req.params.productCode as string) || 'ecri';

  if (!institutionId) {
    return res.status(400).json({ error: 'User is not associated with an institution' });
  }

  try {
    const check = await EntitlementService.checkEngineAccess(institutionId, productCode);
    res.json(check);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify engine access', message: err.message });
  }
});

// 3. Purchase & Activate Engine Entitlement (Instructions #58, #64, #70)
router.post('/:productCode/purchase', authenticate, async (req, res) => {
  const institutionId = req.user?.institutionId;
  const userId = req.user?.id;
  const productCode = (req.params.productCode as string) || 'ecri';

  if (!institutionId) {
    return res.status(400).json({ error: 'User is not associated with an institution' });
  }

  try {
    const result = await EntitlementService.processEnginePayment(institutionId, userId, {
      productCode,
      ...req.body,
    });
    res.json({
      message: `${productCode.toUpperCase()} assessment engagement activated successfully`,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Payment and activation failed', message: err.message });
  }
});

// 4. Institutional Payment History
router.get('/transactions', authenticate, async (req, res) => {
  const institutionId = req.user?.institutionId;
  if (!institutionId) {
    return res.status(400).json({ error: 'User is not associated with an institution' });
  }

  try {
    const payRes = await query(
      `SELECT p.*, u.name AS user_name, u.email AS user_email 
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.institution_id = $1
       ORDER BY p.created_at DESC`,
      [institutionId]
    );
    res.json(payRes.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve transactions', message: err.message });
  }
});

export default router;
