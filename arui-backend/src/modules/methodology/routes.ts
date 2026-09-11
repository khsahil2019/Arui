import { Router } from 'express';
import { query } from '../../db/index.js';

const router = Router();

router.get('/methodology/domains', async (req, res) => {
  try {
    const dRes = await query(`SELECT * FROM domains ORDER BY sort_order ASC`);
    return res.json(dRes.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

router.get('/methodology/metrics', async (req, res) => {
  try {
    const mRes = await query(`SELECT * FROM metrics ORDER BY domain_code, sort_order ASC`);
    return res.json(mRes.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/methodology/anchors', async (req, res) => {
  try {
    const aRes = await query(`SELECT * FROM metric_anchors ORDER BY level ASC`);
    return res.json(aRes.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch anchors' });
  }
});

export default router;
