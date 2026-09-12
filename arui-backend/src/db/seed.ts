import { query, pool } from './index.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_DIR = path.join(__dirname, '../methodology/registry');

export async function seed() {
  console.log('Seeding ARUI Methodology Registry and Initial Data into PostgreSQL...');

  // 1. Create or get Methodology Version 'v4.0'
  const mvRes = await query(
    `INSERT INTO methodology_versions (version, name, is_active)
     VALUES ($1, $2, $3)
     ON CONFLICT (version) DO UPDATE SET is_active = true
     RETURNING id`,
    ['v4.0', 'ARUI Master v4.0 - Exhaustive 11 Domains & 143 Metrics', true]
  );
  const versionId = mvRes.rows[0].id;

  // 2. Read registry JSON files
  const domains = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'domains.json'), 'utf8'));
  const capabilities = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'capabilities.json'), 'utf8'));
  const metrics = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'metrics.json'), 'utf8'));
  const anchors = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'anchors.json'), 'utf8'));
  const instData = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'institutional_data_items.json'), 'utf8'));
  const cards = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'cards.json'), 'utf8'));
  const questions = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'question_bank.json'), 'utf8'));
  const antiGaming = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'anti_gaming_rules.json'), 'utf8'));
  const crossDomain = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'cross_domain_rules.json'), 'utf8'));

  // Insert Domains
  for (let i = 0; i < domains.length; i++) {
    const d = domains[i];
    await query(
      `INSERT INTO domains (methodology_version_id, code, name, purpose, provisional_weight, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (methodology_version_id, code) DO UPDATE SET
         name = EXCLUDED.name,
         purpose = EXCLUDED.purpose,
         provisional_weight = EXCLUDED.provisional_weight`,
      [versionId, d.code, d.name, d.purpose, d.provisionalWeight, i + 1]
    );
  }
  console.log(`Seeded ${domains.length} domains.`);

  // Insert Capabilities
  for (let i = 0; i < capabilities.length; i++) {
    const c = capabilities[i];
    await query(
      `INSERT INTO capabilities (methodology_version_id, domain_code, code, full_code, name, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (methodology_version_id, full_code) DO UPDATE SET
         name = EXCLUDED.name`,
      [versionId, c.domainCode, c.code, c.fullCode, c.name, i + 1]
    );
  }
  console.log(`Seeded ${capabilities.length} capabilities.`);

  // Insert Metrics
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    await query(
      `INSERT INTO metrics (methodology_version_id, domain_code, code, full_code, name, what_measured, measurement_method, exposure, weight, has_outcome, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (methodology_version_id, full_code) DO UPDATE SET
         name = EXCLUDED.name,
         what_measured = EXCLUDED.what_measured,
         measurement_method = EXCLUDED.measurement_method,
         exposure = EXCLUDED.exposure,
         weight = EXCLUDED.weight`,
      [versionId, m.domainCode, m.code, m.fullCode, m.name, m.whatMeasured, m.measurementMethod, m.exposure, m.weight, m.hasOutcome, i + 1]
    );
  }
  console.log(`Seeded ${metrics.length} metrics.`);

  // Insert Anchors
  await query(`DELETE FROM metric_anchors WHERE methodology_version_id = $1`, [versionId]);
  for (const a of anchors) {
    await query(
      `INSERT INTO metric_anchors (methodology_version_id, scope, level, label, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [versionId, a.scope, a.level, a.label, a.description]
    );
  }
  console.log(`Seeded ${anchors.length} anchors.`);

  // Insert Assessment Cards
  await query(`DELETE FROM assessment_cards WHERE methodology_version_id = $1`, [versionId]);
  for (const card of cards) {
    await query(
      `INSERT INTO assessment_cards (methodology_version_id, domain_code, code, name, format, respondent_action, metric_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, card.domainCode, card.code, card.name, card.format, card.respondentAction, card.metricLink]
    );
  }
  console.log(`Seeded ${cards.length} assessment cards.`);

  // Insert Questions
  await query(`DELETE FROM questions WHERE methodology_version_id = $1`, [versionId]);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    let presKind = 'single_choice';
    if (q.inputType && q.inputType.toLowerCase().includes('multi')) presKind = 'multi_choice';
    if (q.inputType && q.inputType.toLowerCase().includes('matrix')) presKind = 'matrix_likert';
    if (q.inputType && q.inputType.toLowerCase().includes('scale')) presKind = 'scale_5';
    if (q.inputType && q.inputType.toLowerCase().includes('band')) presKind = 'band_select';

    await query(
      `INSERT INTO questions (methodology_version_id, domain_code, code, card_code, prompt, input_type, presentation_kind, role, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [versionId, q.domainCode, q.code, q.cardCode, q.prompt, q.inputType, presKind, q.role, i + 1]
    );
  }
  console.log(`Seeded ${questions.length} questions in bank.`);

  // Insert Institutional Data definitions
  await query(`DELETE FROM institutional_data_definitions WHERE methodology_version_id = $1`, [versionId]);
  for (let i = 0; i < instData.length; i++) {
    const item = instData[i];
    await query(
      `INSERT INTO institutional_data_definitions (methodology_version_id, domain_code, code, label, input_type, requirement, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, item.domainCode, item.code, item.label, item.inputType, item.requirement, i + 1]
    );
  }
  console.log(`Seeded ${instData.length} institutional data items.`);

  // Insert Anti-Gaming rules
  await query(`DELETE FROM anti_gaming_rules WHERE methodology_version_id = $1`, [versionId]);
  for (const ag of antiGaming) {
    await query(
      `INSERT INTO anti_gaming_rules (methodology_version_id, code, risk_pattern, detection_logic, evidence_signal, action, scoring_protection)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, ag.code, ag.riskPattern, ag.detectionLogic, ag.evidenceSignal, ag.action, ag.scoringProtection]
    );
  }
  console.log(`Seeded ${antiGaming.length} anti-gaming rules.`);

  // Insert Cross-Domain rules
  await query(`DELETE FROM cross_domain_rules WHERE methodology_version_id = $1`, [versionId]);
  for (const cd of crossDomain) {
    await query(
      `INSERT INTO cross_domain_rules (methodology_version_id, rule_id, from_metric, to_metric, from_score_threshold, to_score_threshold, from_required_r)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, cd.ruleId, cd.fromMetric, cd.toMetric, cd.fromScoreThreshold, cd.toScoreThreshold, cd.fromRequiredR]
    );
  }
  console.log(`Seeded ${crossDomain.length} cross-domain rules.`);

  // 3. Seed Demo Institution & Users
  const instRes = await query(
    `INSERT INTO institutions (name, slug, country, state, district)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['Apex National University', 'apex-national-university', 'India', 'Karnataka', 'Bengaluru Urban']
  );
  const instId = instRes.rows[0].id;

  const passwordHash = await bcrypt.hash('arui@2026', 10);

  // Institution Admin / Lead Assessor
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
    [instId, 'lead@apex.edu', passwordHash, 'Dr. Aris Thorne (Institutional Lead)', 'INSTITUTION_ADMIN']
  );

  // External Assessor
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
    [null, 'assessor@arui.org', passwordHash, 'Prof. Elizabeth Vance (Lead Assessor)', 'ASSESSOR']
  );

  // User Sahil Khan (Institution Admin)
  const sahilPasswordHash = await bcrypt.hash('123456', 10);
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [instId, 'sahilkh3014@gmail.com', sahilPasswordHash, 'Sahil Khan', 'INSTITUTION_ADMIN']
  );

  console.log('Seeded demo users (sahilkh3014@gmail.com, lead@apex.edu, assessor@arui.org, admin@arui.org).');

  // 4. Seed initial Assessment for Apex National University
  const asmRes = await query(
    `INSERT INTO assessments (institution_id, methodology_version_id, title, status, stage, current_domain)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [instId, versionId, 'Institutional AI Resilience Assessment (2026 Baseline)', 'DRAFT', 'profile', 'D01']
  );
  const assessmentId = asmRes.rows[0].id;

  // Seed exhaustive 25-field profile matching Excel Institution_Profile sheet
  const profileValues = {
    IP01: 'Apex National University',
    IP02: 'Comprehensive University',
    IP03: 'State Private / Autonomous',
    IP04: 'Karnataka',
    IP05: 'Bengaluru Urban',
    IP06: 'Urban / Metro',
    IP07: 2008,
    IP08: 24500,
    IP09: 1150,
    IP10: 84,
    IP11: 48,
    IP12: 36,
    IP13: 18,
    IP14: ['Engineering & Technology', 'Computer Science & AI', 'Management & Business', 'Life Sciences', 'Law & Public Policy'],
    IP15: 'High Research Intensity (Tier 1)',
    IP16: 'INR 250 Cr – 500 Cr',
    IP17: 'INR 25 Cr – 50 Cr',
    IP18: 'INR 30 Cr – 60 Cr',
    IP19: 'High / Embedded industry co-design & corporate labs',
    IP20: 'Established Technology Business Incubator (TBI) & AI Center of Excellence',
    IP21: ['National', 'Regional', 'International'],
    IP22: ['Residential', 'Day Scholar', 'Hybrid'],
    IP23: ['Research Excellence', 'Industry Employability', 'Regional Development', 'Global Competitiveness'],
    IP24: 'Co-educational Residential Campus',
    IP25: 'Global Collaborations with Top 100 QS Institutions',
    // Legacy field aliases for backwards compatibility
    IP01_INST_NAME: 'Apex National University',
    IP02_INST_TYPE: 'comprehensive',
    IP03_MANDATE: 'balanced',
    IP04_STATE: 'Karnataka',
    IP05_DISTRICT: 'Bengaluru Urban',
    IP08_STUDENT_ENROLLMENT: '24500',
    IP10_AI_EXPOSURE: 'High',
    IP11_DISCIPLINARY_CONSEQUENCE: 'High',
  };

  await query(
    `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json, completeness_score)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (institution_id, assessment_id) DO UPDATE SET values_json = EXCLUDED.values_json, completeness_score = 100.0`,
    [instId, assessmentId, 'complete', JSON.stringify(profileValues), 100.0]
  );

  // Seed sample responses for Pulse & D01-D11 so the entire dashboard is live
  const sampleResponses = [
    { prompt_id: 'Q01', state: 'answered', val: { choice: 'formal-institutional-priority' } },
    { prompt_id: 'Q02', state: 'answered', val: { choice: 'formal-institutional-priority' } },
    { prompt_id: 'Q03', state: 'answered', val: { selected: ['governance_framework', 'faculty_development', 'assessment_security'] } },
    { prompt_id: 'Q04', state: 'answered', val: { choice: 'emerging-school-faculty' } },
    { prompt_id: 'Q05', state: 'answered', val: { choice: 'formal-institutional-priority' } },
    { prompt_id: 'D01-Q01', state: 'answered', val: { choice: 'formal-institutional-priority' } },
    { prompt_id: 'D01-Q02', state: 'answered', val: { choice: 'formal-institutional-priority' } },
    { prompt_id: 'D02-Q01', state: 'answered', val: { choice: 'formal-institutional-priority' } },
    { prompt_id: 'D03-Q01', state: 'answered', val: { choice: 'emerging-school-faculty' } },
    { prompt_id: 'D07-Q01', state: 'answered', val: { choice: 'formal-institutional-priority' } },
  ];

  for (const resp of sampleResponses) {
    await query(
      `INSERT INTO assessment_responses (assessment_id, prompt_id, state, response_value_json, answered_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (assessment_id, prompt_id) DO UPDATE SET state = EXCLUDED.state, response_value_json = EXCLUDED.response_value_json`,
      [assessmentId, resp.prompt_id, resp.state, JSON.stringify(resp.val)]
    );
  }

  // Seed baseline evidence items
  await query(`DELETE FROM evidence_items WHERE assessment_id = $1`, [assessmentId]);
  const ev1 = await query(
    `INSERT INTO evidence_items (assessment_id, title, file_name, file_path, file_size, mime_type, period_covered, description, source_origin, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
    [
      assessmentId,
      'Institutional AI Governance & Ethics Policy Framework (2025–2028)',
      'AI_Governance_Ethics_Framework_Apex.pdf',
      '/uploads/AI_Governance_Ethics_Framework_Apex.pdf',
      2457600,
      'application/pdf',
      '2025-01 – 2028-12',
      'Approved academic senate policy defining approved GenAI use, ethical guidelines, and risk controls across all faculties.',
      'policy_or_governance',
      'SUBMITTED',
    ]
  );
  const ev1Id = ev1.rows[0].id;
  await query(`INSERT INTO evidence_metric_links (evidence_id, metric_full_code, is_primary) VALUES ($1, 'D01-I01', true), ($1, 'D02-I01', false) ON CONFLICT DO NOTHING`, [ev1Id]);

  const ev2 = await query(
    `INSERT INTO evidence_items (assessment_id, title, file_name, file_path, file_size, mime_type, period_covered, description, source_origin, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
    [
      assessmentId,
      'Academic Council Minutes — Authentic Assessment Redesign Mandate',
      'Academic_Council_Assessment_Resolution_2025.pdf',
      '/uploads/Academic_Council_Assessment_Resolution_2025.pdf',
      1843200,
      'application/pdf',
      '2025-06 – 2026-06',
      'Mandate requiring undergraduate modules to incorporate oral defense, process evaluation, and AI-resilient assessment rubrics.',
      'committee_minutes_or_deliberation',
      'SUBMITTED',
    ]
  );
  const ev2Id = ev2.rows[0].id;
  await query(`INSERT INTO evidence_metric_links (evidence_id, metric_full_code, is_primary) VALUES ($1, 'D07-I01', true), ($1, 'D07-I02', false) ON CONFLICT DO NOTHING`, [ev2Id]);

  console.log(`Created baseline assessment ${assessmentId} with full 25-field profile and live response data for Apex National University.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().then(() => {
    console.log('Database seeding finished successfully.');
    process.exit(0);
  }).catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
