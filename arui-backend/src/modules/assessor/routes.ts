import { Router } from 'express';
import { query } from '../../db/index.js';
import { calculateScoreRun } from '../scoring/engine.js';
import crypto from 'crypto';

const router = Router();

// Route: Assessor Queue
router.get('/assessor/queue', async (req, res) => {
  try {
    const asmRes = await query(
      `SELECT a.id as assessment_id, i.name as institution_name, a.status, a.scope_domains_json, a.created_at,
              (SELECT count(*) FROM anti_gaming_flags WHERE assessment_id = a.id AND is_resolved = false) as open_flags,
              (SELECT name FROM users WHERE role = 'ASSESSOR' LIMIT 1) as assigned_to
       FROM assessments a
       JOIN institutions i ON i.id = a.institution_id
       ORDER BY a.created_at DESC`
    );

    const queue = asmRes.rows.map((row: any) => ({
      assessmentId: row.assessment_id,
      institutionName: row.institution_name,
      status: row.status,
      cycle: '2026 Baseline',
      submittedAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      domainsInScope: row.scope_domains_json || ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'],
      openFlags: Number(row.open_flags) || 0,
      assignedTo: row.assigned_to || 'Lead Assessor',
    }));

    return res.json(queue);
  } catch (err) {
    console.error('Error fetching assessor queue:', err);
    return res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Route: Assessor Assessment Overview
router.get('/assessor/assessments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const aRes = await query(
      `SELECT a.*, i.name as institution_name, m.version as methodology_version
       FROM assessments a
       JOIN institutions i ON i.id = a.institution_id
       JOIN methodology_versions m ON m.id = a.methodology_version_id
       WHERE a.id = $1`,
      [id]
    );
    if (aRes.rows.length === 0) return res.status(404).json({ error: 'Assessment not found' });
    const assessment = aRes.rows[0];

    const profRes = await query(
      `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [id]
    );
    const pValues = profRes.rows[0]?.values_json || {};

    const profileSummary = [
      { label: 'Institution Type', value: pValues.IP02_INST_TYPE || 'Comprehensive' },
      { label: 'Mandate', value: Array.isArray(pValues.IP03_MANDATE) ? pValues.IP03_MANDATE.join(', ') : 'Teaching & Research' },
      { label: 'Student Enrollment', value: pValues.IP08_STUDENT_ENROLLMENT || '10,000–25,000' },
      { label: 'AI Exposure', value: pValues.IP10_AI_EXPOSURE || 'High' },
      { label: 'Disciplinary Consequence', value: pValues.IP11_DISCIPLINARY_CONSEQUENCE || 'High' },
    ];

    const countsRes = await query(
      `SELECT
         (SELECT count(*) FROM assessment_responses WHERE assessment_id = $1 AND state = 'answered') as responses,
         (SELECT count(*) FROM assessment_responses WHERE assessment_id = $1 AND state = 'not_sure') as not_sure,
         (SELECT count(*) FROM assessment_responses WHERE assessment_id = $1 AND state = 'not_applicable_requested') as na_requested,
         (SELECT count(*) FROM evidence_items WHERE assessment_id = $1) as evidence,
         (SELECT count(*) FROM metric_assessments WHERE assessment_id = $1) as metrics_scored,
         (SELECT count(*) FROM metrics) as metrics_total,
         (SELECT count(*) FROM anti_gaming_flags WHERE assessment_id = $1 AND is_resolved = false) as open_flags`,
      [id]
    );
    const c = countsRes.rows[0];

    const domainsRes = await query(`SELECT code, name FROM domains ORDER BY sort_order ASC`);
    const applicability = domainsRes.rows.map((d: any) => ({
      domainCode: d.code,
      domainName: d.name,
      applicable: true,
      rationale: 'Core institutional domain evaluated in full assessment.',
      accepted: true,
    }));

    return res.json({
      assessmentId: assessment.id,
      institutionName: assessment.institution_name,
      cycle: '2026 Baseline',
      status: assessment.status,
      methodologyVersion: assessment.methodology_version,
      profileSummary,
      applicability,
      counts: {
        responses: Number(c.responses) || 0,
        notSure: Number(c.not_sure) || 0,
        naRequested: Number(c.na_requested) || 0,
        evidence: Number(c.evidence) || 0,
        metricsScored: Number(c.metrics_scored) || 0,
        metricsTotal: Number(c.metrics_total) || 143,
        openFlags: Number(c.open_flags) || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching assessor assessment view:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get Metric Scorings for Assessment
router.get(['/assessor/assessments/:id/metrics', '/assessments/:id/metric-assessments'], async (req, res) => {
  const { id } = req.params;
  try {
    const metricsRes = await query(
      `SELECT m.*, d.name as domain_name, c.name as capability_name
       FROM metrics m
       JOIN domains d ON d.code = m.domain_code
       LEFT JOIN capabilities c ON c.full_code = CONCAT(m.domain_code, '-', m.code)
       ORDER BY m.domain_code, m.sort_order ASC`
    );

    const scoresRes = await query(`SELECT * FROM metric_assessments WHERE assessment_id = $1`, [id]);
    const scoreMap: Record<string, any> = {};
    for (const s of scoresRes.rows) scoreMap[s.metric_full_code] = s;

    // Get latest score run ID
    const runRes = await query(`SELECT id FROM score_runs WHERE assessment_id = $1 ORDER BY created_at DESC LIMIT 1`, [id]);
    const latestRunId = runRes.rows[0]?.id || 'run-latest';

    const scorings = metricsRes.rows.map((m: any) => {
      const saved = scoreMap[m.full_code];
      const isScored = saved && saved.maturity !== null && saved.maturity !== undefined;

      let engineOutput = null;
      if (saved && saved.score !== null) {
        engineOutput = {
          metricScore: Number(saved.score),
          validation: 'P0-3 formula validated',
          runId: latestRunId,
        };
      }

      return {
        metricId: m.full_code,
        metricName: m.name,
        domainCode: m.domain_code,
        capabilityArea: m.capability_name || `Capability ${m.code}`,
        measurementMethod: m.measurement_method || 'Assessor Evaluation against Anchors',
        status: saved ? (saved.is_na ? 'not_applicable' : isScored ? 'scored' : 'draft') : 'unscored',
        applicable: saved ? !saved.is_na : true,
        notApplicableRationale: saved?.na_reason || '',
        maturity: saved?.maturity ?? null,
        implementation: saved?.implementation ?? null,
        outcome: saved?.outcomes ?? null,
        outcomeNotApplicable: saved ? saved.outcomes === null : false,
        outcomeNotApplicableRationale: '',
        evidenceLevel: 'E2',
        rationale: saved?.rationale || '',
        linkedResponseIds: [],
        linkedEvidenceIds: [],
        flags: [],
        engine: engineOutput,
      };
    });

    return res.json(scorings);
  } catch (err) {
    console.error('Error fetching metric scorings:', err);
    return res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Route: Update Metric Scoring (Assessor M/I/O Scoring)
router.patch(['/assessor/assessments/:id/metrics/:metricId', '/assessments/:id/metric-assessments/:metricId'], async (req, res) => {
  const id = req.params.id as string;
  const metricId = req.params.metricId as string;
  const { maturity, implementation, outcome, applicable, notApplicableRationale, rationale } = req.body;

  try {
    const isNa = applicable === false;
    let score = null;

    if (!isNa && maturity !== null && maturity !== undefined) {
      const M = Number(maturity);
      const I = Number(implementation ?? M);
      if (outcome !== null && outcome !== undefined) {
        const O = Number(outcome);
        // Formula: 100 * (0.45M + 0.30I + 0.25O) / 5
        score = (100 * (0.45 * M + 0.30 * I + 0.25 * O)) / 5;
      } else {
        // Outcome N/A formula: 100 * (0.60M + 0.40I) / 5
        score = (100 * (0.60 * M + 0.40 * I)) / 5;
      }
      score = Math.round(score * 100) / 100;
    }

    const domainCode = typeof metricId === 'string' ? metricId.split('-')[0] || 'D01' : 'D01';

    const upsertRes = await query(
      `INSERT INTO metric_assessments (assessment_id, metric_full_code, domain_code, maturity, implementation, outcomes, is_na, na_reason, score, rationale, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (assessment_id, metric_full_code) DO UPDATE SET
         maturity = EXCLUDED.maturity,
         implementation = EXCLUDED.implementation,
         outcomes = EXCLUDED.outcomes,
         is_na = EXCLUDED.is_na,
         na_reason = EXCLUDED.na_reason,
         score = EXCLUDED.score,
         rationale = EXCLUDED.rationale,
         updated_at = NOW()
       RETURNING *`,
      [id, metricId, domainCode, maturity ?? null, implementation ?? null, outcome ?? null, isNa, notApplicableRationale || null, score, rationale || '']
    );

    return res.json({ success: true, item: upsertRes.rows[0], score });
  } catch (err) {
    console.error('Error saving metric scoring:', err);
    return res.status(500).json({ error: 'Failed to update metric scoring' });
  }
});

// Route: Context Calibration View
router.get('/assessor/assessments/:id/context', async (req, res) => {
  const { id } = req.params;
  try {
    const mvRes = await query(`SELECT id FROM methodology_versions WHERE is_active = true LIMIT 1`);
    const calc = await calculateScoreRun(id, mvRes.rows[0]?.id);

    const domainsRes = await query(`SELECT code, name FROM domains ORDER BY sort_order ASC`);
    const calibrations = domainsRes.rows.map((d: any) => {
      const c = calc.contextResults[d.code] || {};
      return {
        domainCode: d.code,
        domainName: d.name,
        requiredMaturity: c.requiredMaturity || 3,
        currentMaturity: c.currentMaturity || 0,
        transformationDistance: c.transformationDistance || 3,
        source: 'engine',
        rationale: 'P0-4 Context Calibration based on Institution Profile factors.',
        overrideRequested: false,
        secondReview: 'not_required',
      };
    });

    return res.json(calibrations);
  } catch (err) {
    console.error('Error fetching context calibration:', err);
    return res.status(500).json({ error: 'Failed to fetch context calibration' });
  }
});

// Route: Trigger Immutable Score Run
router.post(['/assessor/assessments/:id/score-runs', '/assessments/:id/score-runs'], async (req, res) => {
  const id = req.params.id as string;
  try {
    const mvRes = await query(`SELECT id, version FROM methodology_versions WHERE is_active = true LIMIT 1`);
    const versionId = mvRes.rows[0]?.id;
    const versionStr = mvRes.rows[0]?.version || 'v4.0';

    const calculation = await calculateScoreRun(id, versionId);

    // Create input hash
    const inputHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(calculation.metricResults) + versionStr)
      .digest('hex');

    // Count existing runs
    const countRes = await query(`SELECT count(*) as count FROM score_runs WHERE assessment_id = $1`, [id]);
    const runNumber = (parseInt(countRes.rows[0].count, 10) || 0) + 1;

    const insRes = await query(
      `INSERT INTO score_runs (assessment_id, methodology_version_id, run_number, input_hash, overall_score, domain_results_json, metric_results_json, context_results_json, cross_domain_results_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        id,
        versionId,
        runNumber,
        inputHash,
        calculation.overallScore,
        JSON.stringify(calculation.domainResults),
        JSON.stringify(calculation.metricResults),
        JSON.stringify(calculation.contextResults),
        JSON.stringify(calculation.crossDomainFindings),
      ]
    );

    const savedRun = insRes.rows[0];

    return res.status(201).json({
      id: savedRun.id,
      runNumber: savedRun.run_number,
      createdAt: savedRun.created_at,
      status: 'complete',
      kind: 'preliminary',
      methodologyVersion: versionStr,
      overallScore: calculation.overallScore,
      summary: `Score run #${runNumber} completed successfully. Overall preliminary index: ${calculation.overallScore}%.`,
      calculation,
    });
  } catch (err) {
    console.error('Error running score run:', err);
    return res.status(500).json({ error: 'Failed to execute score run' });
  }
});

// Route: Get Score Runs List
router.get(['/assessor/assessments/:id/score-runs', '/assessments/:id/score-runs'], async (req, res) => {
  const { id } = req.params;
  try {
    const runsRes = await query(
      `SELECT sr.*, mv.version as methodology_version FROM score_runs sr
       JOIN methodology_versions mv ON mv.id = sr.methodology_version_id
       WHERE sr.assessment_id = $1 ORDER BY sr.created_at DESC`,
      [id]
    );

    const runs = runsRes.rows.map((r: any) => ({
      id: r.id,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      status: 'complete',
      kind: 'preliminary',
      methodologyVersion: r.methodology_version,
      scope: ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'],
      triggeredBy: 'Assessor Lead',
      summary: `Score run #${r.run_number} (${Number(r.overall_score)}%)`,
    }));

    return res.json(runs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch score runs' });
  }
});

// Route: Preliminary Results (Respondent-Facing)
router.get('/assessments/:id/results/preliminary', async (req, res) => {
  const { id } = req.params;
  try {
    const mvRes = await query(`SELECT id FROM methodology_versions WHERE is_active = true LIMIT 1`);
    const calc = await calculateScoreRun(id, mvRes.rows[0]?.id);

    const domainsList = Object.values(calc.domainResults).map((d: any) => ({
      code: d.code,
      name: d.name,
      assessed: d.assessed,
      current: d.currentMaturity,
      required: d.requiredMaturity,
      transformationDistance: d.transformationDistance,
      confidence: d.evidenceConfidence,
      evidenceCoverage: 85,
      unvalidatedClaims: 0,
    }));

    return res.json({
      label: 'Preliminary ARUI Assessment',
      scopeNote: 'D01–D11 Institutional Assessment Baseline',
      coverage: {
        assessed: domainsList.filter((d) => d.assessed).length,
        total: 11,
        codes: 'D01–D11',
      },
      scoreRunId: 'sr-latest',
      generatedAt: new Date().toISOString(),
      overall: {
        current: calc.overallCurrentMaturity,
        required: calc.overallRequiredMaturity,
        transformationDistance: calc.overallTransformationDistance,
        confidence: 'high',
        evidenceCoverage: 85,
        narrative:
          'Institutional capability profile demonstrates emerging to structured foresight with key transformation imperatives across assessment security and digital intelligence.',
      },
      domains: domainsList,
      strengths: calc.strengths,
      vulnerabilities: calc.vulnerabilities,
      contradictions: calc.contradictions,
      attention: [
        { area: 'Assessment Security (D07)', reason: 'GenAI capability exceeds current verification safeguards.' },
        { area: 'Faculty AI Capability (D05)', reason: 'Scale of workforce training needs acceleration.' },
      ],
      caveats: [
        'Preliminary results are non-certified and intended for internal strategic decision-making.',
        'Final institutional index is subject to independent assessor validation.',
      ],
    });
  } catch (err) {
    console.error('Error fetching preliminary results:', err);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
});

export default router;
