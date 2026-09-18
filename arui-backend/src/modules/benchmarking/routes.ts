import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireAssessmentEngineAccess } from '../../middleware/entitlement.js';
import { query } from '../../db/index.js';
import { BenchmarkingService } from './service.js';

const router = Router();

// 1. Get Benchmark & Comparative Summary for an assessment
router.get('/:productCode/assessments/:assessmentId/summary', authenticate, requireAssessmentEngineAccess(), async (req, res) => {
  const assessmentId = req.params.assessmentId as string;
  try {
    const summary = await BenchmarkingService.getBenchmarkSummary(assessmentId);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve benchmark summary', message: err.message });
  }
});

// 2. Get Configured Peer Groups for a product
router.get('/:productCode/peer-groups', authenticate, async (req, res) => {
  const productCode = (req.params.productCode as string) || 'ecri';
  try {
    const pgRes = await query(
      `SELECT pg.*, 
              json_agg(pgr.*) FILTER (WHERE pgr.id IS NOT NULL) AS rules
       FROM peer_groups pg
       LEFT JOIN peer_group_rules pgr ON pg.id = pgr.peer_group_id
       WHERE pg.product_code = $1 AND pg.is_active = true
       GROUP BY pg.id
       ORDER BY pg.created_at ASC`,
      [productCode.toLowerCase()]
    );
    res.json(pgRes.rows);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve peer groups', message: err.message });
  }
});

// 3. Record/Update Assessment Benchmark Snapshot
router.post('/:productCode/assessments/:assessmentId/snapshot', authenticate, requireAssessmentEngineAccess(), async (req, res) => {
  const assessmentId = req.params.assessmentId as string;
  try {
    const snapshot = await BenchmarkingService.recordAssessmentSnapshot(assessmentId);
    if (!snapshot) {
      return res.status(400).json({
        error: 'Assessment is not eligible for snapshot (incomplete scoring or opted-out)',
      });
    }
    res.json({ message: 'Snapshot recorded successfully', snapshot });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record snapshot', message: err.message });
  }
});

// 4. Admin: Create or Configure Peer Group
router.post('/admin/peer-groups', authenticate, async (req, res) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin privileges required' });
  }
  const { productCode, code, name, description, category, minSampleThreshold, rules } = req.body;
  if (!productCode || !code || !name) {
    return res.status(400).json({ error: 'Missing required peer group fields' });
  }

  try {
    const insertPg = await query(
      `INSERT INTO peer_groups (product_code, code, name, description, category, min_sample_threshold)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_code, code) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         min_sample_threshold = EXCLUDED.min_sample_threshold
       RETURNING *`,
      [
        productCode.toLowerCase(),
        code.toUpperCase(),
        name,
        description || '',
        category || 'Institutional Type',
        minSampleThreshold || 10,
      ]
    );
    const pg = insertPg.rows[0];

    // Insert rules if provided
    if (Array.isArray(rules)) {
      await query(`DELETE FROM peer_group_rules WHERE peer_group_id = $1`, [pg.id]);
      for (const r of rules) {
        await query(
          `INSERT INTO peer_group_rules (peer_group_id, dimension_name, operator, rule_value_json)
           VALUES ($1, $2, $3, $4)`,
          [pg.id, r.dimensionName, r.operator || 'IN', JSON.stringify(r.ruleValueJson)]
        );
      }
    }

    res.json({ message: 'Peer group configured successfully', peerGroup: pg });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to configure peer group', message: err.message });
  }
});

// 5. Admin: Dataset Telemetry & Growth Metrics
router.get('/admin/stats', authenticate, async (req, res) => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Super Admin privileges required' });
  }

  try {
    const snapshotsCountRes = await query(
      `SELECT product_code, COUNT(*) AS count, AVG(overall_score) AS avg_score
       FROM benchmark_dataset_snapshots
       GROUP BY product_code`
    );
    const peerGroupsCountRes = await query(
      `SELECT product_code, COUNT(*) AS count FROM peer_groups GROUP BY product_code`
    );
    const consentsCountRes = await query(
      `SELECT participation_level, COUNT(*) AS count FROM benchmark_consents GROUP BY participation_level`
    );

    res.json({
      snapshots: snapshotsCountRes.rows,
      peerGroups: peerGroupsCountRes.rows,
      consents: consentsCountRes.rows,
      governanceStatus: 'SECURE_AND_ANONYMIZED',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve benchmarking stats', message: err.message });
  }
});

export default router;
