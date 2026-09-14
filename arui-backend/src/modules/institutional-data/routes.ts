import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate, requireInstitutionAccess } from '../../middleware/auth.js';

const router = Router();

// Route: Get Institutional Data for a Domain
router.get('/assessments/:id/institutional-data/:domainCode', authenticate, requireInstitutionAccess, async (req, res) => {
  const { id, domainCode } = req.params;

  try {
    const defsRes = await query(
      `SELECT * FROM institutional_data_definitions WHERE domain_code = $1 ORDER BY sort_order ASC`,
      [domainCode]
    );

    const valsRes = await query(
      `SELECT * FROM assessment_institutional_data WHERE assessment_id = $1 AND domain_code = $2`,
      [id, domainCode]
    );
    const valMap: Record<string, any> = {};
    for (const v of valsRes.rows) {
      valMap[v.item_code] = v;
    }

    const items = defsRes.rows.map((def: any) => {
      const saved = valMap[def.code] || {};
      return {
        id: def.code,
        domainCode: def.domain_code,
        label: def.label,
        inputType: def.input_type,
        requirement: def.requirement,
        state: saved.state || 'not_provided', // provided, not_provided, not_sure, na
        value: saved.value !== undefined ? Number(saved.value) : null,
        notes: saved.notes || null,
        updatedAt: saved.updated_at || null,
      };
    });

    return res.json({ domainCode, items });
  } catch (err) {
    console.error('Error fetching institutional data:', err);
    return res.status(500).json({ error: 'Failed to fetch institutional data' });
  }
});

// Route: Update Institutional Data for a Domain
router.put('/assessments/:id/institutional-data/:domainCode', authenticate, requireInstitutionAccess, async (req, res) => {
  const { id, domainCode } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  try {
    for (const item of items) {
      await query(
        `INSERT INTO assessment_institutional_data (assessment_id, item_code, domain_code, state, value, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (assessment_id, item_code) DO UPDATE SET
           state = EXCLUDED.state,
           value = EXCLUDED.value,
           notes = EXCLUDED.notes,
           updated_at = NOW()`,
        [id, item.id || item.code, domainCode, item.state || 'provided', item.value !== undefined && item.value !== null ? item.value : null, item.notes || null]
      );
    }

    return res.json({ success: true, count: items.length });
  } catch (err) {
    console.error('Error saving institutional data:', err);
    return res.status(500).json({ error: 'Failed to save institutional data' });
  }
});

export default router;
