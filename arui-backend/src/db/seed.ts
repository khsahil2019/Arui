import { query, pool } from './index.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REGISTRY_DIR = path.join(__dirname, '../methodology/registry');
const ECRI_REGISTRY_DIR = path.join(__dirname, '../methodology/ecri_registry');

export async function seed() {
  console.log('Seeding Multi-Product Assessment Platform & Methodologies into PostgreSQL...');

  // 1. Seed Products Master (ARUI and ECRI)
  await query(
    `INSERT INTO products (code, name, tagline, description, category, is_active)
     VALUES 
       ($1, $2, $3, $4, $5, $6),
       ($7, $8, $9, $10, $11, $12)
     ON CONFLICT (code) DO UPDATE SET
       name = EXCLUDED.name,
       tagline = EXCLUDED.tagline,
       description = EXCLUDED.description,
       is_active = EXCLUDED.is_active`,
    [
      'arui',
      'AI-Resilient University Index (ARUI)',
      'Institutional Benchmark for AI Resilience, Governance & Transformation',
      'An exhaustive, evidence-backed evaluation framework assessing higher education institutions across 11 critical domains of artificial intelligence readiness, academic integrity, pedagogical adaptation, and administrative transformation.',
      'Higher Education',
      true,
      'ecri',
      'Employability & Career Readiness Index (ECRI)',
      'Comprehensive Institutional Benchmark for Graduate Employability, Industry Alignment & Career Readiness',
      'An exhaustive, evidence-backed evaluation framework assessing higher education institutions across 11 critical dimensions of employability, curriculum co-design, experiential learning, and labor market integration.',
      'Higher Education',
      true
    ]
  );
  console.log('Seeded Products Master (ARUI & ECRI).');

  // Seed Product Pricing
  await query(
    `INSERT INTO product_pricing (product_code, tier_name, currency, amount, is_active, features_json)
     VALUES 
       ('arui', 'Comprehensive Institutional AI Resilience Assessment', 'USD', 4999.00, true, '["11 Domains Evaluation", "143 Metrics Deep Dive", "Executive PDF Report", "Scoreboard & Traceability", "Actionable Transformation Roadmap"]'),
       ('ecri', 'Comprehensive Employability & Career Readiness Assessment', 'USD', 4999.00, true, '["11 Dimensions Evaluation", "132 Canonical Metrics", "Executive Assessment Report (PDF)", "Interactive Institutional Scoreboard", "Detailed Gap Analysis & Transformation Roadmap", "Evidence Traceability & Public Profile"]')
     ON CONFLICT DO NOTHING`
  );

  // Seed Dynamic CTA Configurations
  await query(
    `INSERT INTO cta_configs (product_code, cta_text, cta_link, cta_visibility)
     VALUES 
       ('arui', 'Begin Institutional AI Assessment', '/assessment/arui', true),
       ('ecri', 'Begin Institutional ECRI Assessment', '/assessment/ecri', true)
     ON CONFLICT DO NOTHING`
  );

  // Seed Brand Configs
  await query(
    `INSERT INTO brand_configs (product_code, header_text, footer_text, contact_email, contact_phone)
     VALUES 
       ('arui', 'AI-Resilient University Index — Global Assessment Framework', 'Confidential & Proprietary © ARUI Global Higher Education Advisory', 'evaluations@arui.org', '+1 (800) 555-ARUI'),
       ('ecri', 'Employability & Career Readiness Index — Institutional Assessment Framework', 'Confidential & Proprietary © ECRI Global Higher Education Benchmark', 'evaluations@ecri.org', '+1 (800) 555-ECRI')
     ON CONFLICT DO NOTHING`
  );

  // 2. Seed ARUI Methodology Version 'v4.0'
  const mvRes = await query(
    `INSERT INTO methodology_versions (product_code, version, name, is_active)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (version) DO UPDATE SET is_active = true, product_code = EXCLUDED.product_code
     RETURNING id`,
    ['arui', 'v4.0', 'ARUI Master v4.0 - Exhaustive 11 Domains & 143 Metrics', true]
  );
  const versionId = mvRes.rows[0].id;

  // Read ARUI registry JSON files
  const domains = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'domains.json'), 'utf8'));
  const capabilities = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'capabilities.json'), 'utf8'));
  const metrics = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'metrics.json'), 'utf8'));
  const anchors = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'anchors.json'), 'utf8'));
  const instData = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'institutional_data_items.json'), 'utf8'));
  const cards = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'cards.json'), 'utf8'));
  const questions = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'question_bank.json'), 'utf8'));
  const antiGaming = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'anti_gaming_rules.json'), 'utf8'));
  const crossDomain = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'cross_domain_rules.json'), 'utf8'));

  // Insert ARUI Domains
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

  // Insert ARUI Capabilities
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

  // Insert ARUI Metrics
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

  // Insert ARUI Anchors
  await query(`DELETE FROM metric_anchors WHERE methodology_version_id = $1`, [versionId]);
  for (const a of anchors) {
    await query(
      `INSERT INTO metric_anchors (methodology_version_id, scope, level, label, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [versionId, a.scope, a.level, a.label, a.description]
    );
  }

  // Insert ARUI Assessment Cards
  await query(`DELETE FROM assessment_cards WHERE methodology_version_id = $1`, [versionId]);
  for (const card of cards) {
    await query(
      `INSERT INTO assessment_cards (methodology_version_id, domain_code, code, name, format, respondent_action, metric_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, card.domainCode, card.code, card.name, card.format, card.respondentAction, card.metricLink]
    );
  }

  // Insert ARUI Questions
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

  // Insert ARUI Institutional Data definitions
  await query(`DELETE FROM institutional_data_definitions WHERE methodology_version_id = $1`, [versionId]);
  for (let i = 0; i < instData.length; i++) {
    const item = instData[i];
    await query(
      `INSERT INTO institutional_data_definitions (methodology_version_id, domain_code, code, label, input_type, requirement, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, item.domainCode, item.code, item.label, item.inputType, item.requirement, i + 1]
    );
  }

  // Insert ARUI Anti-Gaming rules
  await query(`DELETE FROM anti_gaming_rules WHERE methodology_version_id = $1`, [versionId]);
  for (const ag of antiGaming) {
    await query(
      `INSERT INTO anti_gaming_rules (methodology_version_id, code, risk_pattern, detection_logic, evidence_signal, action, scoring_protection)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, ag.code, ag.riskPattern, ag.detectionLogic, ag.evidenceSignal, ag.action, ag.scoringProtection]
    );
  }

  // Insert ARUI Cross-Domain rules
  await query(`DELETE FROM cross_domain_rules WHERE methodology_version_id = $1`, [versionId]);
  for (const cd of crossDomain) {
    await query(
      `INSERT INTO cross_domain_rules (methodology_version_id, rule_id, from_metric, to_metric, from_score_threshold, to_score_threshold, from_required_r)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [versionId, cd.ruleId, cd.fromMetric, cd.toMetric, cd.fromScoreThreshold, cd.toScoreThreshold, cd.fromRequiredR]
    );
  }
  console.log(`Seeded ARUI Methodology Registry (11 Domains, 143 Metrics).`);

  // 3. Seed ECRI Methodology Version 'ecri-v6.0'
  const ecriMvRes = await query(
    `INSERT INTO methodology_versions (product_code, version, name, is_active)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (version) DO UPDATE SET is_active = true, product_code = EXCLUDED.product_code
     RETURNING id`,
    ['ecri', 'ecri-v6.0', 'ECRI Master v6.0 - Calibrated & Repaired (11 Dimensions & 132 Canonical Metrics)', true]
  );
  const ecriVersionId = ecriMvRes.rows[0].id;

  // Read ECRI registry JSON files
  const ecriDomains = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'dimensions.json'), 'utf8'));
  const ecriCapabilities = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'capabilities.json'), 'utf8'));
  const ecriMetrics = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'metrics.json'), 'utf8'));
  const ecriAnchors = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'anchors.json'), 'utf8'));
  const ecriCards = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'cards.json'), 'utf8'));
  const ecriQuestions = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'question_bank.json'), 'utf8'));
  const ecriEvidence = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'evidence_requirements.json'), 'utf8'));
  const ecriAntiGaming = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'anti_gaming_rules.json'), 'utf8'));
  const ecriCrossDomain = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'cross_domain_rules.json'), 'utf8'));
  const ecriCalibration = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'calibration_rules.json'), 'utf8'));
  const ecriBadges = JSON.parse(fs.readFileSync(path.join(ECRI_REGISTRY_DIR, 'badge_definitions.json'), 'utf8'));

  // Insert ECRI Dimensions
  for (let i = 0; i < ecriDomains.length; i++) {
    const d = ecriDomains[i];
    await query(
      `INSERT INTO domains (methodology_version_id, code, name, purpose, provisional_weight, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (methodology_version_id, code) DO UPDATE SET
         name = EXCLUDED.name,
         purpose = EXCLUDED.purpose,
         provisional_weight = EXCLUDED.provisional_weight`,
      [ecriVersionId, d.code, d.name, d.purpose, d.provisionalWeight, i + 1]
    );
  }

  // Insert ECRI Capabilities
  await query(`DELETE FROM capabilities WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (let i = 0; i < ecriCapabilities.length; i++) {
    const c = ecriCapabilities[i];
    await query(
      `INSERT INTO capabilities (methodology_version_id, domain_code, code, full_code, name, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (methodology_version_id, full_code) DO UPDATE SET
         name = EXCLUDED.name`,
      [ecriVersionId, c.domainCode, c.code, c.fullCode, c.name, i + 1]
    );
  }

  // Insert ECRI 132 Metrics
  await query(`DELETE FROM metrics WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (let i = 0; i < ecriMetrics.length; i++) {
    const m = ecriMetrics[i];
    await query(
      `INSERT INTO metrics (methodology_version_id, domain_code, code, full_code, name, what_measured, measurement_method, exposure, weight, has_outcome, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (methodology_version_id, full_code) DO UPDATE SET
         name = EXCLUDED.name,
         what_measured = EXCLUDED.what_measured,
         measurement_method = EXCLUDED.measurement_method,
         exposure = EXCLUDED.exposure,
         weight = EXCLUDED.weight`,
      [ecriVersionId, m.domainCode, m.code, m.fullCode, m.name, m.whatMeasured, m.measurementMethod, m.exposure, m.weight, m.hasOutcome, i + 1]
    );
  }

  // Insert ECRI Anchors
  await query(`DELETE FROM metric_anchors WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (const a of ecriAnchors) {
    await query(
      `INSERT INTO metric_anchors (methodology_version_id, scope, level, label, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [ecriVersionId, a.scope, a.level, a.label, a.description]
    );
  }

  // Insert ECRI Cards
  await query(`DELETE FROM assessment_cards WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (const card of ecriCards) {
    await query(
      `INSERT INTO assessment_cards (methodology_version_id, domain_code, code, name, format, respondent_action, metric_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ecriVersionId, card.domainCode, card.code, card.name, card.format, card.respondentAction, card.metricLink]
    );
  }

  // Insert ECRI Questions
  await query(`DELETE FROM questions WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (let i = 0; i < ecriQuestions.length; i++) {
    const q = ecriQuestions[i];
    await query(
      `INSERT INTO questions (methodology_version_id, domain_code, code, card_code, prompt, input_type, presentation_kind, role, options_json, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [ecriVersionId, q.domainCode, q.code, q.cardCode, q.prompt, q.inputType, q.presentationKind, q.role, JSON.stringify(q.options || []), i + 1]
    );
  }

  // Insert ECRI Evidence Requirements
  await query(`DELETE FROM evidence_requirements WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (const ev of ecriEvidence) {
    await query(
      `INSERT INTO evidence_requirements (methodology_version_id, domain_code, code, title, quantity, requirement, metric_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ecriVersionId, ev.domainCode, ev.code, ev.title, ev.quantity, ev.requirement, ev.metricLink]
    );
  }

  // Insert ECRI Anti-Gaming
  await query(`DELETE FROM anti_gaming_rules WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (const ag of ecriAntiGaming) {
    await query(
      `INSERT INTO anti_gaming_rules (methodology_version_id, code, risk_pattern, detection_logic, evidence_signal, action, scoring_protection)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ecriVersionId, ag.code, ag.riskPattern, ag.detectionLogic, ag.evidenceSignal, ag.action, ag.scoringProtection]
    );
  }

  // Insert ECRI Cross-Domain
  await query(`DELETE FROM cross_domain_rules WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (const cd of ecriCrossDomain) {
    await query(
      `INSERT INTO cross_domain_rules (methodology_version_id, rule_id, from_metric, to_metric, from_score_threshold, to_score_threshold, from_required_r)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ecriVersionId, cd.ruleId, cd.fromMetric, cd.toMetric, cd.fromScoreThreshold, cd.toScoreThreshold, cd.fromRequiredR]
    );
  }

  // Insert ECRI Calibration Rules
  await query(`DELETE FROM calibration_rules WHERE methodology_version_id = $1`, [ecriVersionId]);
  for (const cal of ecriCalibration) {
    await query(
      `INSERT INTO calibration_rules (methodology_version_id, rule_code, domain_code, metric_full_code, category, decision_test, guidance_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [ecriVersionId, cal.ruleCode, cal.domainCode, cal.metricFullCode, cal.category, cal.decisionTest, cal.guidanceText]
    );
  }

  // Insert Generic Badge Definitions
  for (const b of ecriBadges) {
    await query(
      `INSERT INTO badge_definitions (product_code, code, name, meaning, difficulty, criteria_json, requirements_json, award_rule, validity_months, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (product_code, code) DO UPDATE SET
         name = EXCLUDED.name,
         meaning = EXCLUDED.meaning,
         difficulty = EXCLUDED.difficulty,
         criteria_json = EXCLUDED.criteria_json,
         requirements_json = EXCLUDED.requirements_json`,
      [b.productCode, b.code, b.name, b.meaning, b.difficulty, JSON.stringify(b.criteriaJson), JSON.stringify(b.requirementsJson), b.awardRule, b.validityMonths, b.icon]
    );
  }
  console.log(`Seeded ECRI Methodology Registry (11 Dimensions, 132 Canonical Metrics, Badges & Calibration).`);

  // 4. Seed Demo Institutions & Distinct Users for ARUI and ECRI
  const instRes = await query(
    `INSERT INTO institutions (name, slug, country, state, district)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['Apex National University', 'apex-national-university', 'India', 'Karnataka', 'Bengaluru Urban']
  );
  const instId = instRes.rows[0].id;

  const horizonRes = await query(
    `INSERT INTO institutions (name, slug, country, state, district)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['Horizon State University', 'horizon-state-university', 'India', 'Maharashtra', 'Mumbai Suburban']
  );
  const horizonInstId = horizonRes.rows[0].id;

  // Hashes for Demo Credentials
  const apexPasswordHash = await bcrypt.hash('apex123', 10);
  const sahilPasswordHash = await bcrypt.hash('123456', 10);
  const aruiAssessorHash = await bcrypt.hash('assessor123', 10);
  const horizonPasswordHash = await bcrypt.hash('horizon123', 10);
  const ecriAssessorHash = await bcrypt.hash('assessor123', 10);

  // --- ARUI DEMO USERS ---
  // 1. Apex University Lead & Admin
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [instId, 'lead@apex.edu', apexPasswordHash, 'Dr. Aris Thorne (Institutional Lead)', 'INSTITUTION_ADMIN']
  );

  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [instId, 'admin@apex.edu', apexPasswordHash, 'Apex University Administrator', 'INSTITUTION_ADMIN']
  );

  // 2. Global Super Admin
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [null, 'sahilkh3014@gmail.com', sahilPasswordHash, 'Sahil Khan (Global Super Admin)', 'SUPER_ADMIN']
  );

  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [null, 'admin@arui.org', await bcrypt.hash('admin123', 10), 'Chief Platform Administrator', 'SUPER_ADMIN']
  );

  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [null, 'admin@ecri.org', await bcrypt.hash('admin123', 10), 'Chief ECRI Administrator', 'SUPER_ADMIN']
  );

  // 3. ARUI External Assessor
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [null, 'assessor@arui.org', aruiAssessorHash, 'Prof. Elizabeth Vance (Lead ARUI Assessor)', 'ASSESSOR']
  );

  // --- ECRI DEMO USERS ---
  // 4. Horizon University Career & Employability Lead & Admin
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [horizonInstId, 'lead@horizon.edu', horizonPasswordHash, 'Prof. Marcus Vance (Dean of Career & WIL)', 'INSTITUTION_ADMIN']
  );

  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [horizonInstId, 'admin@horizon.edu', horizonPasswordHash, 'Horizon University Administrator', 'INSTITUTION_ADMIN']
  );

  // 5. Horizon University Industry Relations & WIL Officer
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [horizonInstId, 'industry@horizon.edu', horizonPasswordHash, 'Sarah Jenkins (Director of Corporate Partnerships)', 'CONTRIBUTOR']
  );

  // 6. ECRI External Assessor / Adjudicator
  await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash`,
    [null, 'assessor@ecri.org', ecriAssessorHash, 'Dr. Robert Sterling (Lead ECRI Adjudicator)', 'ASSESSOR']
  );

  console.log('Seeded distinct demo users for ARUI (Apex) and ECRI (Horizon).');

  // 5. Seed baseline ARUI Assessment for Apex
  const asmRes = await query(
    `INSERT INTO assessments (product_code, institution_id, methodology_version_id, title, status, stage, current_domain)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    ['arui', instId, versionId, 'Institutional AI Resilience Assessment (2026 Baseline)', 'DRAFT', 'profile', 'D01']
  );
  const assessmentId = asmRes.rows[0].id;

  // Seed baseline ECRI Assessment for Horizon
  const ecriAsmRes = await query(
    `INSERT INTO assessments (product_code, institution_id, methodology_version_id, title, status, stage, current_domain)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    ['ecri', horizonInstId, ecriVersionId, 'ECRI Graduate Employability & Career Readiness Assessment (2026)', 'DRAFT', 'assessment', 'D01']
  );
  const ecriAssessmentId = ecriAsmRes.rows[0].id;

  // Seed profile
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
    // Legacy aliases
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

  await query(
    `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json, completeness_score)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (institution_id, assessment_id) DO UPDATE SET values_json = EXCLUDED.values_json, completeness_score = 100.0`,
    [instId, ecriAssessmentId, 'complete', JSON.stringify(profileValues), 100.0]
  );

  // Seed sample responses for ARUI
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

  // Seed sample responses for ECRI
  for (let d = 1; d <= 11; d++) {
    const dCode = `D${d.toString().padStart(2, '0')}`;
    for (let q = 1; q <= 6; q++) {
      const qCode = `${dCode}-Q0${q}`;
      await query(
        `INSERT INTO assessment_responses (assessment_id, prompt_id, state, response_value_json, answered_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (assessment_id, prompt_id) DO UPDATE SET state = EXCLUDED.state, response_value_json = EXCLUDED.response_value_json`,
        [ecriAssessmentId, qCode, 'answered', JSON.stringify({ choice: 'opt_4', maturityLevel: 4 })]
      );
    }
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

  // Seed ECRI Evidence
  await query(`DELETE FROM evidence_items WHERE assessment_id = $1`, [ecriAssessmentId]);
  const ecriEv1 = await query(
    `INSERT INTO evidence_items (assessment_id, title, file_name, file_path, file_size, mime_type, period_covered, description, source_origin, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
    [
      ecriAssessmentId,
      'ECRI Corporate Advisory Council & Industry Curriculum Review 2025–2026',
      'ECRI_Industry_Advisory_Curriculum_Minutes_2025.pdf',
      '/uploads/ECRI_Industry_Advisory_Curriculum_Minutes_2025.pdf',
      3145728,
      'application/pdf',
      '2025-01 – 2026-06',
      'Board of Studies minutes with Fortune 500 employer co-design feedback and mandatory 12-week internship credits.',
      'policy_or_governance',
      'SUBMITTED',
    ]
  );
  const ecriEv1Id = ecriEv1.rows[0].id;
  // Seed Benchmark Consents & Engine Entitlements
  for (const iId of [instId, horizonInstId]) {
    await query(
      `INSERT INTO benchmark_consents (institution_id, product_code, participation_level, is_consented)
       VALUES ($1, 'arui', 'ANONYMOUS_BENCHMARK', true), ($1, 'ecri', 'ANONYMOUS_BENCHMARK', true)
       ON CONFLICT (institution_id, product_code) DO NOTHING`,
      [iId]
    );
  }

  // Seed Multi-Engine Entitlements (Instructions #56-#80)
  // Apex Institute has both ARUI and ECRI active
  await query(
    `INSERT INTO engine_entitlements (institution_id, product_code, status, cycle, activated_at)
     VALUES 
       ($1, 'arui', 'ACTIVE', '2026-2027', NOW()),
       ($1, 'ecri', 'ACTIVE', '2026-2027', NOW())
     ON CONFLICT (institution_id, product_code, cycle) DO UPDATE SET status = 'ACTIVE'`,
    [instId]
  );

  // Horizon State University has ARUI active, ECRI not purchased
  await query(
    `INSERT INTO engine_entitlements (institution_id, product_code, status, cycle, activated_at)
     VALUES 
       ($1, 'arui', 'ACTIVE', '2026-2027', NOW()),
       ($1, 'ecri', 'NOT_PURCHASED', '2026-2027', NULL)
     ON CONFLICT (institution_id, product_code, cycle) DO UPDATE SET status = EXCLUDED.status`,
    [horizonInstId]
  );

  // Seed sample payments
  await query(
    `INSERT INTO payments (institution_id, product_code, amount, currency, payment_method, transaction_reference, status, invoice_number)
     VALUES 
       ($1, 'arui', 4999.00, 'USD', 'CARD', 'tx_arui_apex_2026', 'SUCCESS', 'INV-ARUI-2026-001'),
       ($1, 'ecri', 4999.00, 'USD', 'CARD', 'tx_ecri_apex_2026', 'SUCCESS', 'INV-ECRI-2026-001'),
       ($2, 'arui', 4999.00, 'USD', 'WIRE_TRANSFER', 'tx_arui_horizon_2026', 'SUCCESS', 'INV-ARUI-2026-002')
     ON CONFLICT (transaction_reference) DO NOTHING`,
    [instId, horizonInstId]
  );

  const defaultPeerGroups = [
    {
      productCode: 'ecri',
      code: 'PG-COMP',
      name: 'Comprehensive Multidisciplinary Universities',
      category: 'Institutional Type',
      description: 'Universities offering a broad range of humanities, sciences, commerce, and engineering programs.',
      minSampleThreshold: 10,
      rules: [{ dimensionName: 'institution_type', operator: 'IN', ruleValueJson: ['Comprehensive University', 'State University', 'Multidisciplinary'] }],
    },
    {
      productCode: 'ecri',
      code: 'PG-TECH',
      name: 'Technical, Engineering & Applied Science Institutes',
      category: 'Discipline Profile',
      description: 'Institutions with heavy concentration in engineering, computing, and technology programs.',
      minSampleThreshold: 10,
      rules: [{ dimensionName: 'discipline_profile', operator: 'IN', ruleValueJson: ['Technical', 'Engineering', 'STEM-focused'] }],
    },
    {
      productCode: 'ecri',
      code: 'PG-PRIV',
      name: 'Private Autonomous & Deemed Universities',
      category: 'Ownership & Scale',
      description: 'Autonomous institutions with flexible curriculum structures and agile industry advisory boards.',
      minSampleThreshold: 10,
      rules: [{ dimensionName: 'ownership', operator: 'IN', ruleValueJson: ['Private', 'Deemed', 'Autonomous'] }],
    },
    {
      productCode: 'arui',
      code: 'PG-ARUI-COMP',
      name: 'Comprehensive Research & Teaching Universities',
      category: 'Institutional Type',
      description: 'Whole-institution AI resilience benchmark for multidisciplinary universities.',
      minSampleThreshold: 10,
      rules: [{ dimensionName: 'institution_type', operator: 'IN', ruleValueJson: ['Comprehensive University', 'State University'] }],
    },
  ];

  for (const pg of defaultPeerGroups) {
    const pgRes = await query(
      `INSERT INTO peer_groups (product_code, code, name, description, category, min_sample_threshold)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (product_code, code) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         min_sample_threshold = EXCLUDED.min_sample_threshold
       RETURNING id`,
      [pg.productCode, pg.code, pg.name, pg.description, pg.category, pg.minSampleThreshold]
    );
    const pgId = pgRes.rows[0].id;
    await query(`DELETE FROM peer_group_rules WHERE peer_group_id = $1`, [pgId]);
    for (const r of pg.rules) {
      await query(
        `INSERT INTO peer_group_rules (peer_group_id, dimension_name, operator, rule_value_json)
         VALUES ($1, $2, $3, $4)`,
        [pgId, r.dimensionName, r.operator, JSON.stringify(r.ruleValueJson)]
      );
    }
  }

  console.log(`Database seeding completed successfully for both ARUI (Assessment: ${assessmentId}) and ECRI (Assessment: ${ecriAssessmentId}) with Benchmarking infrastructure.`);
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
