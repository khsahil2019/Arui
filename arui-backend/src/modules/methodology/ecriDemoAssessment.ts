import fs from 'fs';
import path from 'path';

export interface EcriDemoInstitution {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  governance: string;
  location: string;
  studentPopulation: number;
  programmePopulation: number;
  facultyPopulation: number;
  schoolsCount: number;
  mandate: string;
  disciplinaryConsequence: string;
  aiDigitalExposure: string;
  assessmentCycle: string;
  methodologyVersion: string;
  sampleBadge: string;
}

export interface EcriDemoMetric {
  code: string;
  fullCode: string;
  name: string;
  dimensionCode: string;
  dimensionName: string;
  whatMeasured: string;
  capabilityArea: string;
  constructOwner: string;
  score: number; // 0 - 100
  maturityLevel: number; // 1 - 5
  implementationScore: number; // 0 - 100
  outcomeScore?: number; // 0 - 100
  evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4';
  evidenceStatus: 'VERIFIED' | 'CORROBORATED' | 'UNDER_REVIEW' | 'FLAGGED';
  rationale: string;
  finding: string;
  gap: string;
  flag: string | null;
  applicability: 'CORE' | 'SPECIALIZED' | 'DIAGNOSTIC';
  assessorObservation: string;
  recommendedAction: string;
}

export interface EcriDemoDimension {
  code: string;
  name: string;
  weight: number;
  score: number;
  currentMaturity: number;
  requiredMaturity: number;
  transformationDistance: string;
  evidenceConfidence: number; // e.g. 88
  assessmentCoverage: number; // e.g. 100
  status: 'ESTABLISHED' | 'DEVELOPING' | 'INTEGRATED' | 'TRANSFORMATIVE';
  strengths: string[];
  gaps: string[];
  claimsAwaitingEvidence: number;
  assessorObservation: string;
  metrics: EcriDemoMetric[];
}

export interface EcriRoadmapAction {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  horizon: 'NOW_90_DAYS' | 'MONTHS_3_12' | 'MONTHS_12_24';
  horizonLabel: string;
  dimensionCode: string;
  dimensionName: string;
  currentMaturity: number;
  requiredMaturity: number;
  gap: string;
  action: string;
  owner: string;
  dependency: string;
  evidenceRequired: string;
  successMeasure: string;
  reviewDate: string;
}

export interface EcriDemoEvidenceItem {
  id: string;
  title: string;
  dimensionCode: string;
  metricCode: string;
  level: 'E0' | 'E1' | 'E2' | 'E3' | 'E4';
  status: 'VERIFIED' | 'CORROBORATED' | 'UNDER_REVIEW' | 'FLAGGED';
  verificationHash: string;
  sourceType: string;
  description: string;
  traceability: string;
}

export interface EcriDemoAssessment {
  product: 'ECRI';
  methodologyVersion: 'ECRI v6.0';
  isSample: true;
  isSynthetic: true;
  assessmentId: string;
  assessmentStatus: 'CERTIFIED_BASELINE';
  assessmentPeriod: '2026 Academic Baseline Cycle';
  certifiedAt: string;
  overallScore: number;
  overallMaturityLevel: number;
  overallMaturityLabel: string;
  overallBand: string;
  overallPercentile: string;
  institution: EcriDemoInstitution;
  dimensions: Record<string, EcriDemoDimension>;
  dimensionsList: EcriDemoDimension[];
  metricsList: EcriDemoMetric[];
  roadmap: EcriRoadmapAction[];
  evidenceDossier: EcriDemoEvidenceItem[];
  crossDomainIntelligence: {
    pathway: string;
    coherenceScore: number;
    observations: string[];
    breakingPoints: string[];
  };
  summaryInsights: {
    strategicStrengths: string[];
    transformationPriorities: string[];
    exposureVulnerabilities: string[];
  };
}

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load canonical dimensions and metrics from ecri_registry
function resolveEcriRegistryPath(): string {
  const candidatePaths = [
    path.resolve(__dirname, '../../methodology/ecri_registry'),
    path.resolve(__dirname, '../methodology/ecri_registry'),
    path.resolve(process.cwd(), 'arui-backend/src/methodology/ecri_registry'),
    path.resolve(process.cwd(), 'src/methodology/ecri_registry'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(path.join(p, 'dimensions.json'))) {
      return p;
    }
  }
  throw new Error(`Could not resolve ECRI registry path from candidate locations: ${candidatePaths.join(', ')}`);
}

const ecriRegistryPath = resolveEcriRegistryPath();
const rawDimensions = JSON.parse(fs.readFileSync(path.join(ecriRegistryPath, 'dimensions.json'), 'utf8'));
const rawMetrics = JSON.parse(fs.readFileSync(path.join(ecriRegistryPath, 'metrics.json'), 'utf8'));

const dimensionScores: Record<string, { score: number; weight: number; cur: number; req: number; status: EcriDemoDimension['status']; confidence: number }> = {
  D01: { score: 78.0, weight: 0.08, cur: 4, req: 3, status: 'DEVELOPING', confidence: 88 },
  D02: { score: 72.0, weight: 0.08, cur: 4, req: 3, status: 'DEVELOPING', confidence: 84 },
  D03: { score: 81.0, weight: 0.09, cur: 4, req: 4, status: 'INTEGRATED', confidence: 92 },
  D04: { score: 67.0, weight: 0.10, cur: 3, req: 4, status: 'DEVELOPING', confidence: 80 },
  D05: { score: 76.0, weight: 0.08, cur: 4, req: 3, status: 'ESTABLISHED', confidence: 86 },
  D06: { score: 74.0, weight: 0.09, cur: 4, req: 3, status: 'ESTABLISHED', confidence: 85 },
  D07: { score: 79.0, weight: 0.08, cur: 4, req: 3, status: 'DEVELOPING', confidence: 90 },
  D08: { score: 69.0, weight: 0.08, cur: 3, req: 3, status: 'DEVELOPING', confidence: 78 },
  D09: { score: 77.0, weight: 0.10, cur: 4, req: 4, status: 'ESTABLISHED', confidence: 88 },
  D10: { score: 73.0, weight: 0.12, cur: 3, req: 4, status: 'DEVELOPING', confidence: 82 },
  D11: { score: 77.7, weight: 0.10, cur: 3, req: 3, status: 'ESTABLISHED', confidence: 86 },
};

const dimensionObservations: Record<string, { observation: string; strengths: string[]; gaps: string[] }> = {
  D01: {
    observation: 'Strong employer engagement across regional technology and healthcare sectors, with room for real-time labour-market API telemetry integration.',
    strengths: ['Real-time occupational demand telemetry', 'Advisory council employer co-design feedback loop', 'Predictive labor data feeds in engineering'],
    gaps: ['SME regional employer participation is lagging behind multinational partners', 'Undergraduate humanities demand tracking needs formalization'],
  },
  D02: {
    observation: 'Employability taxonomy is mapped to national qualification framework with progressive micro-credential alignment.',
    strengths: ['Comprehensive 8-pillar capability rubric', 'Cross-faculty core competency baseline', 'Explicit learning outcome mapping'],
    gaps: ['Postgraduate research programmes lack explicit modular WIL competencies', 'Self-assessment rubrics need student calibration validation'],
  },
  D03: {
    observation: 'Industry co-designed curricula operational in 84% of accredited programmes with biennial review cycle.',
    strengths: ['Mandatory biennial industry advisory curriculum audits', 'Live problem briefs incorporated in capstone projects', 'Accredited STEM co-delivery modules'],
    gaps: ['Curriculum refresh velocity in generative AI tools is fragmented across non-STEM departments', 'Coursework credit for informal micro-internships requires policy update'],
  },
  D04: {
    observation: 'Practice-based learning active with 72% student participation; scaling placement supervision capacity is current focus.',
    strengths: ['Robust clinical and engineering co-op placement infrastructure', 'Credit-bearing internship pathways in 9 of 14 faculties', 'Dedicated industry liaison coordinators'],
    gaps: ['Work-Integrated Learning (WIL) stipend equity across socio-economic groups', 'Standardized assessment of remote practice-based projects'],
  },
  D05: {
    observation: 'Centralized Career Development Centre provides robust diagnostic guidance, mentoring, and employer recruitment conduits.',
    strengths: ['1:320 Career Counselor to Student ratio with proactive outreach', 'AI-assisted resume & interview simulation platform', 'Alumni mentorship network connecting 12,000+ active graduates'],
    gaps: ['First-generation student career readiness onboarding requires targeted outreach', 'Longitudinal tracking beyond 12-month post-graduation milestone'],
  },
  D06: {
    observation: 'Ethical reasoning, teamwork, and cross-cultural communication integrated systematically across foundational years.',
    strengths: ['Interdisciplinary collaboration modules across faculties', 'Formal emotional intelligence & communication rubrics', 'Student leadership and extracurricular credentialing'],
    gaps: ['Direct employer rubric evaluation of human capabilities in non-technical roles', 'Cross-cultural teamwork simulations need expansion in blended formats'],
  },
  D07: {
    observation: 'Digital fluency and AI productivity tools embedded in core curriculum with strict ethical governance.',
    strengths: ['Campus-wide AI literacy credential with 92% completion rate', 'Cloud-hosted collaborative development environments', 'Institutional AI usage and integrity standards'],
    gaps: ['Advanced generative AI tool workflows in administrative and creative disciplines', 'Hardware equity access for compute-intensive specialized training'],
  },
  D08: {
    observation: 'Digital portfolio and verified capability signalling platform piloted across 6 faculties.',
    strengths: ['W3C verifiable digital credentialing infrastructure', 'Artifact-backed skill badging for technical capstones', 'Employer-searchable talent portfolio directory'],
    gaps: ['Humanities and liberal arts portfolio standardization', 'Student engagement in maintaining post-graduation portfolio assets'],
  },
  D09: {
    observation: 'Strategic partnerships with 450+ vetted enterprise, SME, and public-sector employers.',
    strengths: ['Tier-1 strategic partner consortium with guaranteed interview pipelines', 'On-campus and virtual recruitment summits hosting 300+ firms annually', 'Joint R&D and student innovation challenge sponsorships'],
    gaps: ['Regional SME and startup recruitment engagement pathways', 'Structured feedback loops from non-hiring interviewed employers'],
  },
  D10: {
    observation: 'High graduate employment rate (89.2% at 6 months) with strong starting salary premiums in STEM and business.',
    strengths: ['89.2% overall full-time employment within 6 months of graduation', '14.8% starting salary premium compared to regional benchmark medians', 'High employer satisfaction rating (94.2% would hire again)'],
    gaps: ['Underemployment monitoring in creative and performing arts', 'Longitudinal salary growth telemetry at 3 and 5 year milestones'],
  },
  D11: {
    observation: 'Lifelong alumni career hub and modular upskilling entitlements established for all graduating cohorts.',
    strengths: ['Free 3-year alumni upskilling and career advisory entitlement', 'Micro-credential stackability into postgraduate qualifications', 'Annual employability intelligence and alumni destination surveys'],
    gaps: ['Mid-career alumni transition support services', 'Systematic integration of alumni career trajectory data into curriculum review'],
  },
};

const builtDimensions: Record<string, EcriDemoDimension> = {};
const builtMetricsList: EcriDemoMetric[] = [];

for (const rawD of rawDimensions) {
  const code = rawD.code;
  const meta = dimensionScores[code] || { score: 75.0, weight: 0.09, cur: 3, req: 3, status: 'ESTABLISHED', confidence: 85 };
  const obs = dimensionObservations[code] || { observation: 'Robust institutional performance with established compliance.', strengths: ['Standardized policy'], gaps: ['Scaling capacity'] };

  const dimMetrics: EcriDemoMetric[] = rawMetrics
    .filter((m: any) => m.domainCode === code)
    .map((m: any, idx: number) => {
      const metricScore = Math.min(95, Math.max(58, Math.round(meta.score + (idx % 5 - 2) * 3)));
      const matLevel = metricScore >= 85 ? 5 : metricScore >= 75 ? 4 : metricScore >= 65 ? 3 : 2;
      const implScore = Math.min(100, Math.round(metricScore * 1.02));
      const outScore = m.hasOutcome ? Math.round(metricScore * 0.98) : undefined;
      const eLevel = matLevel >= 4 ? 'E3' : matLevel === 3 ? 'E2' : 'E1';

      const metricObj: EcriDemoMetric = {
        code: m.code,
        fullCode: m.fullCode || `${code}-${m.code}`,
        name: m.name,
        dimensionCode: code,
        dimensionName: rawD.name,
        whatMeasured: m.whatMeasured || `Observable institutional condition for ${m.name.toLowerCase()} within ${rawD.name}.`,
        capabilityArea: m.capabilityArea || 'Institutional Operations',
        constructOwner: m.constructOwner || 'Academic Affairs / Career Services',
        score: metricScore,
        maturityLevel: matLevel,
        implementationScore: implScore,
        outcomeScore: outScore,
        evidenceLevel: eLevel as any,
        evidenceStatus: 'VERIFIED',
        rationale: `Verified via corroborating institutional artifacts, curriculum audit records, and employer partnership agreements.`,
        finding: `Metropolitan Apex University demonstrates ${matLevel >= 4 ? 'comprehensive institutionalized' : 'structured developing'} capability in ${m.name.toLowerCase()}.`,
        gap: matLevel >= 4 ? 'Maintain continuous refinement and data recency telemetry.' : `Formalize cross-faculty consistency and automate verification logging for ${m.name.toLowerCase()}.`,
        flag: null,
        applicability: 'CORE',
        assessorObservation: `Assessor review confirms operational effectiveness with verified evidence corroboration at ${eLevel}.`,
        recommendedAction: `Incorporate ${m.name.toLowerCase()} into annual faculty performance metrics and student-facing dashboards.`,
      };
      builtMetricsList.push(metricObj);
      return metricObj;
    });

  const distVal = meta.req - meta.cur;
  const distStr = distVal === 0 ? '0' : distVal > 0 ? `+${distVal}` : `${distVal}`;

  builtDimensions[code] = {
    code,
    name: rawD.name,
    weight: meta.weight,
    score: meta.score,
    currentMaturity: meta.cur,
    requiredMaturity: meta.req,
    transformationDistance: distStr,
    evidenceConfidence: meta.confidence,
    assessmentCoverage: 100,
    status: meta.status,
    strengths: obs.strengths,
    gaps: obs.gaps,
    claimsAwaitingEvidence: 0,
    assessorObservation: obs.observation,
    metrics: dimMetrics,
  };
}

export const ECRI_DEMO_ASSESSMENT: EcriDemoAssessment = {
  product: 'ECRI',
  methodologyVersion: 'ECRI v6.0',
  isSample: true,
  isSynthetic: true,
  assessmentId: 'demo-ecri-asm-001',
  assessmentStatus: 'CERTIFIED_BASELINE',
  assessmentPeriod: '2026 Academic Baseline Cycle',
  certifiedAt: '2026-09-18T10:00:00.000Z',
  overallScore: 74.8,
  overallMaturityLevel: 4,
  overallMaturityLabel: 'Level 4 · Transformative & Scaling',
  overallBand: 'Tier 1 Benchmark Cohort',
  overallPercentile: '84th Percentile',
  institution: {
    id: 'demo-ecri-inst-001',
    name: 'Metropolitan Apex University',
    subtitle: 'Illustrative Demonstration Institution',
    type: 'Comprehensive Research & Teaching University',
    governance: 'Public State Chartered Institution',
    location: 'Victoria & New South Wales, Australia',
    studentPopulation: 28500,
    programmePopulation: 142,
    facultyPopulation: 1420,
    schoolsCount: 14,
    mandate: 'Excellence in industry-integrated education, career mobility, and applied research.',
    disciplinaryConsequence: 'High — Accredited professional degree programs with direct industry licensing.',
    aiDigitalExposure: 'Advanced — Campus-wide digital capability integration & generative AI governance.',
    assessmentCycle: '2026 Annual Baseline',
    methodologyVersion: 'ECRI v6.0',
    sampleBadge: 'ECRI v6.0 · Synthetic / Illustrative Assessment',
  },
  dimensions: builtDimensions,
  dimensionsList: Object.values(builtDimensions),
  metricsList: builtMetricsList,
  roadmap: [
    {
      id: 'ACT-01',
      priority: 'CRITICAL',
      horizon: 'NOW_90_DAYS',
      horizonLabel: 'Now · Immediate Interventions (0–90 Days)',
      dimensionCode: 'D04',
      dimensionName: 'Experiential & Practice-Based Learning',
      currentMaturity: 3,
      requiredMaturity: 4,
      gap: 'WIL stipend equity and remote supervision protocols require immediate institutional standardization.',
      action: 'Publish standardized WIL Supervision Charter & establish central industry placement equity fund.',
      owner: 'Dean of Academic Affairs & Director of WIL',
      dependency: 'University Senate Approval of WIL Equity Policy',
      evidenceRequired: 'Approved WIL Supervision Charter (Doc-WIL-2026-01)',
      successMeasure: '100% of non-credit internships transitioned to accredited, supported WIL framework.',
      reviewDate: 'Day 90 (Q1 2026)',
    },
    {
      id: 'ACT-02',
      priority: 'HIGH',
      horizon: 'NOW_90_DAYS',
      horizonLabel: 'Now · Immediate Interventions (0–90 Days)',
      dimensionCode: 'D08',
      dimensionName: 'Portfolio & Capability Signalling',
      currentMaturity: 3,
      requiredMaturity: 3,
      gap: 'Digital credentialing adoption is fragmented in humanities and non-technical disciplines.',
      action: 'Deploy universal verifiable badge framework across all undergraduate capstone subjects.',
      owner: 'Director of Educational Innovation & Assessment',
      dependency: 'Digital Credentials Platform Integration',
      evidenceRequired: 'W3C Verifiable Badge Issuance Telemetry Logs',
      successMeasure: '85% student portfolio activation rate prior to penultimate year.',
      reviewDate: 'Day 90 (Q1 2026)',
    },
    {
      id: 'ACT-03',
      priority: 'HIGH',
      horizon: 'MONTHS_3_12',
      horizonLabel: 'Next · Institutional Integration (3–12 Months)',
      dimensionCode: 'D10',
      dimensionName: 'Employment Outcome Quality',
      currentMaturity: 3,
      requiredMaturity: 4,
      gap: 'Underemployment telemetry in creative arts and humanities lacks granular longitudinal monitoring.',
      action: 'Integrate national tax and employment registry linkage for 12, 24, and 36-month graduate outcome tracking.',
      owner: 'Office of Institutional Research & Career Analytics',
      dependency: 'Government Data Linkage Consent Framework',
      evidenceRequired: 'Longitudinal Graduate Outcome Quality Report (ECRI-D10-2026)',
      successMeasure: 'Underemployment rate decreased by 4.2% across vulnerable programme clusters.',
      reviewDate: 'Month 6 (Q2 2026)',
    },
    {
      id: 'ACT-04',
      priority: 'HIGH',
      horizon: 'MONTHS_3_12',
      horizonLabel: 'Next · Institutional Integration (3–12 Months)',
      dimensionCode: 'D01',
      dimensionName: 'Employer Demand Intelligence',
      currentMaturity: 4,
      requiredMaturity: 3,
      gap: 'SME regional employer participation is lagging behind multinational enterprise partners.',
      action: 'Launch Regional SME Advisory Consortium and automated live job vacancy data pipeline.',
      owner: 'Head of Industry Partnerships & Regional Engagement',
      dependency: 'Regional Chamber of Commerce Co-Design Agreement',
      evidenceRequired: 'SME Engagement Audit & Telemetry Dashboard',
      successMeasure: '250+ regional SMEs actively participating in curriculum feedback loops.',
      reviewDate: 'Month 9 (Q3 2026)',
    },
    {
      id: 'ACT-05',
      priority: 'MEDIUM',
      horizon: 'MONTHS_12_24',
      horizonLabel: 'Future · Longitudinal Transformation (12–24 Months)',
      dimensionCode: 'D11',
      dimensionName: 'Career Adaptability, Lifelong Readiness & Employability Intelligence',
      currentMaturity: 3,
      requiredMaturity: 3,
      gap: 'Mid-career alumni transition support and modular micro-upskilling pathways require systemic funding.',
      action: 'Establish Endowment-backed Lifelong Employability Hub with stackable micro-master pathways.',
      owner: 'Vice-Chancellor (Academic) & Alumni Relations Executive',
      dependency: 'Postgraduate Stackable Micro-Credential Accreditation',
      evidenceRequired: 'Lifelong Learning Matriculation & Retention Records',
      successMeasure: '15,000+ active alumni enrolled in stackable continuous upskilling modules.',
      reviewDate: 'Month 18 (Q4 2027)',
    },
  ],
  evidenceDossier: [
    {
      id: 'EV-01',
      title: 'Institutional WIL Governance & Supervision Policy (2025–2028)',
      dimensionCode: 'D04',
      metricCode: 'I01',
      level: 'E3',
      status: 'VERIFIED',
      verificationHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      sourceType: 'Senate Approved Institutional Policy',
      description: 'Comprehensive policy mandating minimum placement hours, supervisor credentials, and equity support funds.',
      traceability: 'Senate Charter → WIL Central Office → Faculty Implementation Audits',
    },
    {
      id: 'EV-02',
      title: 'Industry Advisory Council Curriculum Co-Design Audits (14 Faculties)',
      dimensionCode: 'D03',
      metricCode: 'I03',
      level: 'E4',
      status: 'VERIFIED',
      verificationHash: 'sha256:4a5b28d098e91f17dc9c8c07e0b57e79df3f5b08c659e931393604f323a67500',
      sourceType: 'External Advisory Board Meeting Minutes & Signed Curricula',
      description: 'Formal signed minutes certifying that 84% of degree programmes underwent biennial industry review.',
      traceability: 'Industry Advisory Board → Dean of Faculty → Curriculum Committee Sign-off',
    },
    {
      id: 'EV-03',
      title: 'Real-Time Labor Market Intelligence Integration Specification (Lightcast/SEEK API)',
      dimensionCode: 'D01',
      metricCode: 'I01',
      level: 'E3',
      status: 'CORROBORATED',
      verificationHash: 'sha256:1a82f9b8c7345671d09e8f73b64c8d92e10f8a3b5c7d9e0f1a2b3c4d5e6f7a8b',
      sourceType: 'Technical Architecture & API Ingestion Logs',
      description: 'Live automated data pipeline feeding regional job demand signals into academic programme reviews.',
      traceability: 'API Ingestion Engine → Institutional Research Dashboard → Programme Review Portals',
    },
    {
      id: 'EV-04',
      title: 'Longitudinal Graduate Outcome Destination & Salary Census (Cohort 2024–2025)',
      dimensionCode: 'D10',
      metricCode: 'I01',
      level: 'E4',
      status: 'VERIFIED',
      verificationHash: 'sha256:9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
      sourceType: 'Verified Graduate Outcome Census & Tax Linkage',
      description: 'Independent graduate employment survey verifying 89.2% full-time employment and starting salary premium.',
      traceability: 'National Graduate Survey → Statistical Audit Unit → Verified Institutional Scorecard',
    },
  ],
  crossDomainIntelligence: {
    pathway: 'Employer Demand → Curriculum Alignment → Practice Learning → Capability Signalling → Employment Outcomes',
    coherenceScore: 84.5,
    observations: [
      'Strong structural coherence (88%) between Employer Demand (D01) and Industry-Aligned Curriculum (D03), driven by active advisory councils.',
      'Slight transmission friction (74%) between Curriculum (D03) and Experiential Learning (D04) due to uneven WIL placement capacity in non-technical faculties.',
      'High conversion efficiency (86%) from Capability Signalling (D08) into Graduate Employment Outcomes (D10).',
    ],
    breakingPoints: [
      'Humanities disciplines exhibit lower employer co-design velocity, creating a temporary alignment lag in non-STEM sectors.',
      'Student digital portfolio uptake requires mandatory integration into capstone assessment rubrics to ensure universal graduate signalling.',
    ],
  },
  summaryInsights: {
    strategicStrengths: [
      'Comprehensive 84% Industry Co-Designed Curricula across all undergraduate faculties.',
      'Leading Graduate Outcome Quality: 89.2% full-time employment within 6 months (+14.8% starting salary premium).',
      'Campus-wide Digital & AI Literacy Integration with 92% student credentialing rate.',
      'Tier-1 Employer Recruitment Ecosystem encompassing 450+ verified corporate and public-sector partners.',
      'Structured 3-Year Alumni Lifelong Upskilling Entitlement maintaining ongoing graduate mobility.',
    ],
    transformationPriorities: [
      'Institutionalize universal WIL Stipend Equity & standardized supervision across all 14 faculties.',
      'Expand regional SME and startup participation in annual curriculum co-design feedback loops.',
      'Standardize W3C verifiable digital skill credentialing across humanities and liberal arts degrees.',
      'Implement granular underemployment telemetry tracking beyond the 12-month graduation milestone.',
      'Scale continuous postgraduate micro-credential stackability for alumni mid-career transitions.',
    ],
    exposureVulnerabilities: [
      'Unequal internship access across socio-economic demographics in unpaid creative arts placements.',
      'High dependence on multinational tech partners compared to local regional industry ecosystems.',
      'Manual verification overhead for informal micro-internships without centralized ledger tracking.',
    ],
  },
};
