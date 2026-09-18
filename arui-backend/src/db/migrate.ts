import { query, pool } from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function migrate() {
  console.log('Running PostgreSQL migrations for ARUI Production Database...');

  const sql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Products Master (ARUI, ECRI, and future Higher Education methodologies)
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      tagline VARCHAR(255),
      description TEXT,
      category VARCHAR(100) DEFAULT 'Higher Education',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Methodology Versions (Immutable Registry Releases)
    CREATE TABLE IF NOT EXISTS methodology_versions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) DEFAULT 'arui',
      version VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 11 Dimensions / Domains
    CREATE TABLE IF NOT EXISTS domains (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      code VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      purpose TEXT,
      provisional_weight NUMERIC(5,4) DEFAULT 0.0900,
      sort_order INT DEFAULT 0,
      UNIQUE(methodology_version_id, code)
    );

    -- Capability Areas (C01..C09 per domain)
    CREATE TABLE IF NOT EXISTS capabilities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      domain_code VARCHAR(10) NOT NULL,
      code VARCHAR(10) NOT NULL,
      full_code VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      sort_order INT DEFAULT 0,
      UNIQUE(methodology_version_id, full_code)
    );

    -- Canonical Metrics (143 for ARUI, 132 for ECRI)
    CREATE TABLE IF NOT EXISTS metrics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      domain_code VARCHAR(10) NOT NULL,
      code VARCHAR(10) NOT NULL,
      full_code VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      what_measured TEXT,
      measurement_method TEXT,
      exposure VARCHAR(50) DEFAULT 'Medium',
      weight NUMERIC(5,2) DEFAULT 1.0,
      has_outcome BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      UNIQUE(methodology_version_id, full_code)
    );

    -- Maturity Anchors (0=Absent, 1=Reactive, 2=Emerging, 3=Structured, 4=Integrated, 5=Adaptive)
    CREATE TABLE IF NOT EXISTS metric_anchors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      scope VARCHAR(50) DEFAULT 'All',
      level INT NOT NULL,
      label VARCHAR(100) NOT NULL,
      description TEXT NOT NULL
    );

    -- Assessment Cards
    CREATE TABLE IF NOT EXISTS assessment_cards (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      domain_code VARCHAR(10) NOT NULL,
      code VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      format VARCHAR(100),
      respondent_action TEXT,
      metric_link VARCHAR(100)
    );

    -- Question Bank
    CREATE TABLE IF NOT EXISTS questions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      domain_code VARCHAR(50) NOT NULL,
      code VARCHAR(100) NOT NULL,
      card_code VARCHAR(100),
      prompt TEXT NOT NULL,
      input_type VARCHAR(100) DEFAULT 'single',
      presentation_kind VARCHAR(100) DEFAULT 'single_choice',
      role VARCHAR(100) DEFAULT 'Diagnostic',
      options_json JSONB DEFAULT '[]',
      metadata_json JSONB DEFAULT '{}',
      sort_order INT DEFAULT 0
    );

    -- Institutional Data Items
    CREATE TABLE IF NOT EXISTS institutional_data_definitions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      domain_code VARCHAR(10) NOT NULL,
      code VARCHAR(50) NOT NULL,
      label TEXT NOT NULL,
      input_type VARCHAR(50) DEFAULT 'number',
      requirement VARCHAR(50) DEFAULT 'Required',
      sort_order INT DEFAULT 0
    );

    -- Evidence Requirements Definition
    CREATE TABLE IF NOT EXISTS evidence_requirements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      domain_code VARCHAR(10) NOT NULL,
      code VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      quantity VARCHAR(100),
      requirement VARCHAR(100),
      metric_link VARCHAR(100)
    );

    -- Cross-Domain & Contradiction Rules
    CREATE TABLE IF NOT EXISTS cross_domain_rules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      rule_id VARCHAR(50) NOT NULL,
      from_metric VARCHAR(50),
      to_metric VARCHAR(50),
      from_score_threshold NUMERIC(5,2),
      to_score_threshold NUMERIC(5,2),
      from_required_r INT
    );

    -- Anti-Gaming Rules
    CREATE TABLE IF NOT EXISTS anti_gaming_rules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      code VARCHAR(20) NOT NULL,
      risk_pattern TEXT NOT NULL,
      detection_logic TEXT NOT NULL,
      evidence_signal TEXT,
      action TEXT NOT NULL,
      scoring_protection TEXT NOT NULL
    );

    -- Assessor Calibration & Adjudication Rules
    CREATE TABLE IF NOT EXISTS calibration_rules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      methodology_version_id UUID REFERENCES methodology_versions(id) ON DELETE CASCADE,
      rule_code VARCHAR(50) NOT NULL,
      domain_code VARCHAR(10),
      metric_full_code VARCHAR(50),
      category VARCHAR(50) DEFAULT 'CALIBRATION',
      decision_test TEXT NOT NULL,
      guidance_text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Generic Badge Definitions Engine
    CREATE TABLE IF NOT EXISTS badge_definitions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      meaning TEXT NOT NULL,
      difficulty VARCHAR(50) DEFAULT 'Gold',
      criteria_json JSONB DEFAULT '{}',
      requirements_json JSONB DEFAULT '{}',
      award_rule TEXT,
      validity_months INT DEFAULT 12,
      icon VARCHAR(100) DEFAULT 'award',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(product_code, code)
    );

    -- Dynamic Report Branding Configuration (Admin Controlled)
    

    -- Dynamic Pricing (Admin / Backend Controlled)
    CREATE TABLE IF NOT EXISTS product_pricing (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      tier_name VARCHAR(100) DEFAULT 'Standard Institutional Assessment',
      currency VARCHAR(10) DEFAULT 'USD',
      amount NUMERIC(10,2) NOT NULL DEFAULT 4999.00,
      features_json JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Dynamic Call-To-Action (Admin Controlled)
    CREATE TABLE IF NOT EXISTS cta_configs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      cta_text VARCHAR(255) NOT NULL DEFAULT 'Request Institutional Assessment',
      cta_link TEXT DEFAULT '/contact',
      cta_visibility BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Institutional Enquiries Capture
    CREATE TABLE IF NOT EXISTS enquiries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      institution_name VARCHAR(255) NOT NULL,
      designation VARCHAR(255),
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(100),
      whatsapp VARCHAR(100),
      message TEXT,
      status VARCHAR(50) DEFAULT 'NEW',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Institutions Master
    CREATE TABLE IF NOT EXISTS institutions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      country VARCHAR(100) DEFAULT 'India',
      state VARCHAR(100),
      district VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS brand_configs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
      logo_url TEXT,
      header_text TEXT,
      footer_text TEXT,
      contact_email VARCHAR(255),
      contact_phone VARCHAR(100),
      contact_whatsapp VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Users & RBAC (INSTITUTION_ADMIN, ASSESSOR, LEAD_AUDITOR, SUPER_ADMIN)
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'INSTITUTION_ADMIN',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Assessments Lifecycle State Machine
    CREATE TABLE IF NOT EXISTS assessments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) DEFAULT 'arui',
      institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PROFILE, PULSE, ASSESSMENT, EVIDENCE, ASSESSOR_REVIEW, CALIBRATION, LOCKED, REPORT_PUBLISHED
      stage VARCHAR(50) DEFAULT 'profile',
      scope_domains_json JSONB DEFAULT '["D01","D02","D03","D04","D05","D06","D07","D08","D09","D10","D11"]',
      current_domain VARCHAR(10) DEFAULT 'D01',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Alter table safely if product_code column is not yet present on existing tables
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='product_code') THEN
        ALTER TABLE assessments ADD COLUMN product_code VARCHAR(50) DEFAULT 'arui';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='methodology_versions' AND column_name='product_code') THEN
        ALTER TABLE methodology_versions ADD COLUMN product_code VARCHAR(50) DEFAULT 'arui';
      END IF;
    END $$;

    -- 25-Field Institution Profile (P0-4 context engine inputs)
    CREATE TABLE IF NOT EXISTS institution_profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'in_progress',
      values_json JSONB NOT NULL DEFAULT '{}',
      completeness_score NUMERIC(5,2) DEFAULT 0,
      is_locked BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(institution_id, assessment_id)
    );

    -- Assessment Question Responses (4 distinct states: answered, not_sure, not_applicable_requested, not_answered)
    CREATE TABLE IF NOT EXISTS assessment_responses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      prompt_id VARCHAR(50) NOT NULL,
      state VARCHAR(50) NOT NULL DEFAULT 'not_answered', -- answered, not_sure, not_applicable_requested, not_answered
      response_value_json JSONB,
      answered_by UUID REFERENCES users(id) ON DELETE SET NULL,
      answered_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(assessment_id, prompt_id)
    );

    -- Institutional Data Values
    CREATE TABLE IF NOT EXISTS assessment_institutional_data (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      item_code VARCHAR(50) NOT NULL,
      domain_code VARCHAR(10) NOT NULL,
      state VARCHAR(50) DEFAULT 'not_provided', -- provided, not_provided, not_sure, na
      value NUMERIC(15,4),
      notes TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(assessment_id, item_code)
    );

    -- Evidence Items & Repository
    CREATE TABLE IF NOT EXISTS evidence_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size BIGINT DEFAULT 0,
      mime_type VARCHAR(100) DEFAULT 'application/pdf',
      file_hash VARCHAR(128),
      evidence_level VARCHAR(10) DEFAULT 'E1', -- E0, E1, E2, E3, E4
      status VARCHAR(50) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, REVIEWED, REJECTED, CORROBORATED
      period_covered VARCHAR(100),
      source_origin VARCHAR(100),
      uploader_id UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Evidence to Metric Links (Multi-domain linkage & primary-owner rule)
    CREATE TABLE IF NOT EXISTS evidence_metric_links (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      evidence_id UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
      metric_full_code VARCHAR(20) NOT NULL,
      is_primary BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(evidence_id, metric_full_code)
    );

    -- Evidence Reviews by Assessors
    CREATE TABLE IF NOT EXISTS evidence_reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      evidence_id UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
      assessor_id UUID NOT NULL REFERENCES users(id),
      level VARCHAR(10) NOT NULL,
      authenticity_status VARCHAR(50) DEFAULT 'verified',
      temporal_validity_status VARCHAR(50) DEFAULT 'valid', -- valid, expired, out_of_window
      comments TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Assessor M/I/O Scoring (Strict Formula: 100 * (0.45M + 0.30I + 0.25O)/5 or 100 * (0.60M + 0.40I)/5)
    CREATE TABLE IF NOT EXISTS metric_assessments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      metric_full_code VARCHAR(20) NOT NULL,
      domain_code VARCHAR(10) NOT NULL,
      maturity INT CHECK (maturity BETWEEN 0 AND 5),
      implementation INT CHECK (implementation BETWEEN 0 AND 5),
      outcomes INT CHECK (outcomes IS NULL OR outcomes BETWEEN 0 AND 5),
      is_na BOOLEAN DEFAULT false,
      na_reason TEXT,
      assessor_id UUID REFERENCES users(id),
      score NUMERIC(5,2), -- Calculated server-side only
      rationale TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(assessment_id, metric_full_code)
    );

    -- Cross-Domain Findings (Diagnostic only, 0 score effect)
    CREATE TABLE IF NOT EXISTS cross_domain_findings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      rule_id VARCHAR(50) NOT NULL,
      severity VARCHAR(20) DEFAULT 'FLAG', -- FLAG, WARNING, CONTRADICTION, BOTTLENECK
      message TEXT NOT NULL,
      from_metric VARCHAR(50),
      to_metric VARCHAR(50),
      details_json JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Anti-Gaming Flags
    CREATE TABLE IF NOT EXISTS anti_gaming_flags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      rule_code VARCHAR(20) NOT NULL,
      severity VARCHAR(20) DEFAULT 'WARNING',
      message TEXT NOT NULL,
      evidence_id UUID REFERENCES evidence_items(id) ON DELETE CASCADE,
      metric_full_code VARCHAR(20),
      is_resolved BOOLEAN DEFAULT false,
      resolution_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Immutable Score Runs (Versioned calculation freeze)
    CREATE TABLE IF NOT EXISTS score_runs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      methodology_version_id UUID NOT NULL REFERENCES methodology_versions(id),
      run_number INT NOT NULL,
      is_locked BOOLEAN DEFAULT false,
      locked_at TIMESTAMP WITH TIME ZONE,
      input_hash VARCHAR(128) NOT NULL,
      overall_score NUMERIC(5,2),
      domain_results_json JSONB NOT NULL,
      metric_results_json JSONB NOT NULL,
      context_results_json JSONB NOT NULL,
      cross_domain_results_json JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Canonical Reports (Payload + Generated PDF)
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      score_run_id UUID REFERENCES score_runs(id) ON DELETE SET NULL,
      report_type VARCHAR(50) DEFAULT 'EXECUTIVE_REPORT',
      version VARCHAR(50) DEFAULT 'canonical_v1',
      payload_json JSONB NOT NULL,
      pdf_path TEXT,
      generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Execution & Audit Log
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID,
      assessment_id UUID,
      user_id UUID,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100),
      details_json JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- =========================================================================
    -- BENCHMARKING & COMPARATIVE INTELLIGENCE ARCHITECTURE (Instructions #40-55)
    -- =========================================================================

    -- Institutional Data Participation & Governance Consents
    CREATE TABLE IF NOT EXISTS benchmark_consents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      product_code VARCHAR(50) NOT NULL,
      participation_level VARCHAR(50) DEFAULT 'ANONYMOUS_BENCHMARK', -- OPT_OUT, ANONYMOUS_BENCHMARK, CONFIDENTIAL_PEER, PUBLIC_DISCLOSURE
      is_consented BOOLEAN DEFAULT true,
      governance_contact_email VARCHAR(255),
      consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(institution_id, product_code)
    );

    -- Configurable Peer Groups
    CREATE TABLE IF NOT EXISTS peer_groups (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) DEFAULT 'Institutional Type',
      min_sample_threshold INT DEFAULT 10,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(product_code, code)
    );

    -- Configurable Peer Group Rules (Multi-dimensional criteria)
    CREATE TABLE IF NOT EXISTS peer_group_rules (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      peer_group_id UUID NOT NULL REFERENCES peer_groups(id) ON DELETE CASCADE,
      dimension_name VARCHAR(100) NOT NULL,
      operator VARCHAR(20) DEFAULT 'IN',
      rule_value_json JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Structured Anonymised / Governed Institutional Benchmark Snapshots
    CREATE TABLE IF NOT EXISTS benchmark_dataset_snapshots (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
      institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      methodology_version VARCHAR(50) NOT NULL,
      assessment_date TIMESTAMP WITH TIME ZONE NOT NULL,
      anonymized_id VARCHAR(64) NOT NULL,
      context_profile_json JSONB NOT NULL,
      overall_score NUMERIC(5,2) NOT NULL,
      maturity_band INT NOT NULL,
      dimension_scores_json JSONB NOT NULL,
      metric_scores_json JSONB NOT NULL,
      is_verified_audit BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Benchmark Statistical Distributions (Precalculated when N >= N_min)
    CREATE TABLE IF NOT EXISTS benchmark_distributions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      product_code VARCHAR(50) NOT NULL,
      peer_group_id UUID REFERENCES peer_groups(id) ON DELETE CASCADE,
      level VARCHAR(50) NOT NULL, -- SECTOR_ALL, PEER_GROUP, COHORT
      sample_size INT NOT NULL,
      is_statistically_valid BOOLEAN DEFAULT false,
      overall_distribution_json JSONB NOT NULL,
      dimension_distributions_json JSONB NOT NULL,
      metric_distributions_json JSONB DEFAULT '{}',
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Platform Engine Entitlements (Instructions #56-#80)
    CREATE TABLE IF NOT EXISTS engine_entitlements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      product_code VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'NOT_PURCHASED', -- NOT_PURCHASED, PAYMENT_PENDING, ACTIVE, SUSPENDED, EXPIRED
      cycle VARCHAR(50) DEFAULT '2026-2027',
      payment_id UUID,
      activated_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(institution_id, product_code, cycle)
    );

    -- Platform Payments & Transactions (Instructions #58, #64, #73)
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      product_code VARCHAR(50) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      payment_method VARCHAR(50) DEFAULT 'CARD', -- CARD, WIRE_TRANSFER, INVOICE, SIMULATED
      transaction_reference VARCHAR(100) UNIQUE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- PENDING, SUCCESS, FAILED, REFUNDED
      invoice_number VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add phone & designation to users if not present
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(100);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='designation') THEN
        ALTER TABLE users ADD COLUMN designation VARCHAR(255);
      END IF;
    END $$;

    ALTER TABLE benchmark_dataset_snapshots DROP CONSTRAINT IF EXISTS benchmark_dataset_snapshots_assessment_id_fkey;
    ALTER TABLE benchmark_dataset_snapshots ALTER COLUMN assessment_id DROP NOT NULL;
  `;

  await query(sql);
  console.log('PostgreSQL schema migrations successfully applied.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  migrate().then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  }).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
