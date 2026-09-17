export type ParticipationLevel =
  | 'OPT_OUT'
  | 'ANONYMOUS_BENCHMARK'
  | 'CONFIDENTIAL_PEER'
  | 'PUBLIC_DISCLOSURE';

export interface BenchmarkConsent {
  id: string;
  institutionId: string;
  productCode: string;
  participationLevel: ParticipationLevel;
  isConsented: boolean;
  governanceContactEmail?: string | null;
  consentedAt: string;
}

export interface PeerGroupRule {
  id?: string;
  peerGroupId?: string;
  dimensionName: string; // e.g., 'institution_type', 'ownership', 'student_band', 'region'
  operator: 'EQ' | 'IN' | 'GTE' | 'LTE';
  ruleValueJson: string[] | number | string;
}

export interface PeerGroup {
  id: string;
  productCode: string;
  code: string;
  name: string;
  description: string;
  category: string;
  minSampleThreshold: number;
  isActive: boolean;
  rules?: PeerGroupRule[];
  createdAt: string;
}

export interface BenchmarkDatasetSnapshot {
  id: string;
  productCode: string;
  assessmentId: string;
  institutionId: string;
  methodologyVersion: string;
  assessmentDate: string;
  anonymizedId: string;
  contextProfile: Record<string, any>;
  overallScore: number;
  maturityBand: number;
  dimensionScores: Record<string, number>;
  metricScores: Record<string, number>;
  isVerifiedAudit: boolean;
  createdAt: string;
}

export interface DistributionStats {
  mean: number;
  median: number;
  p25: number;
  p75: number;
  iqr: number;
  stdDev: number;
  min: number;
  max: number;
}

export interface DimensionBenchmark {
  dimensionCode: string;
  dimensionName: string;
  institutionScore: number;
  peerMedian: number | null;
  peerP25: number | null;
  peerP75: number | null;
  deltaToMedian: number | null;
  comparativeStanding: 'ABOVE_PEER_MEDIAN' | 'AT_PEER_MEDIAN' | 'BELOW_PEER_MEDIAN' | 'BASELINE_ONLY';
}

export interface HistoricalBaselineEvolution {
  versionNumber: number;
  assessmentDate: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  deltaPoints: number;
}

export interface BenchmarkSummaryResponse {
  productCode: string;
  assessmentId: string;
  institutionId: string;
  institutionName: string;
  overallScore: number;
  maturityBand: number;
  
  // Level 1: Institutional Baseline (Historical self-evolution)
  level1Baseline: {
    currentVersion: number;
    history: HistoricalBaselineEvolution[];
    longitudinalDelta: number;
  };

  // Level 2: Relevant Peer Benchmark
  level2PeerBenchmark: {
    peerGroupId: string | null;
    peerGroupCode: string | null;
    peerGroupName: string | null;
    sampleSize: number;
    minRequiredSample: number;
    isStatisticallyValid: boolean;
    status: 'STATISTICALLY_VALID' | 'DATASET_GROWING';
    peerMedianOverall: number | null;
    deltaToPeerMedian: number | null;
    dimensionBenchmarks: DimensionBenchmark[];
  };

  // Level 3 & 4: Cohort & Sector Reference Points
  level4SectorBenchmark: {
    totalSectorInstitutions: number;
    minRequiredSample: number;
    isStatisticallyValid: boolean;
    status: 'STATISTICALLY_VALID' | 'DATASET_GROWING';
    sectorMedianOverall: number | null;
  };

  // Statistical Governance Note (Zero Fake Rankings Guarantee)
  governanceNote: string;
}
