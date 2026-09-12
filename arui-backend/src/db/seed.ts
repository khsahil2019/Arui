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

  // Seed default 25-field profile
  const profileValues = {
    IP01_INST_NAME: 'Apex National University',
    IP02_INST_TYPE: 'comprehensive',
    IP03_MANDATE: 'balanced',
    IP04_STATE: 'Karnataka',
    IP05_DISTRICT: 'Bengaluru Urban',
    IP06_STUDENT_ENROLLMENT: '15000-30000',
    IP07_FACULTY_COUNT: '800-1500',
    IP08_ACCREDITATION: 'NAAC A++',
    IP09_RESEARCH_INTENSITY: 'moderate_high',
    IP10_AI_EXPOSURE_INDEX: 'high',
    IP11_DISCIPLINARY_CONSEQUENCE: 'high',
    IP12_RESOURCE_ENVELOPE: 'tier_1_private',
    IP13_LEAD_ASSESSOR_NAME: 'Dr. Aris Thorne',
    IP14_LEAD_ASSESSOR_TITLE: 'Vice-Chancellor / Provost',
    IP15_LEAD_ASSESSOR_EMAIL: 'lead@apex.edu'
  };

  await query(
    `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json, completeness_score)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (institution_id, assessment_id) DO UPDATE SET values_json = EXCLUDED.values_json`,
    [instId, assessmentId, 'in_progress', JSON.stringify(profileValues), 60.0]
  );

  console.log(`Created baseline assessment ${assessmentId} with demo profile for Apex National University.`);
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
