export type ReconciliationStatus =
  | 'SUPPORTED'
  | 'POTENTIAL_MISMATCH'
  | 'INCONCLUSIVE'
  | 'UNSUPPORTED'
  | 'AWAITING_EVIDENCE'
  | 'NOT_READABLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'AI_ANALYSIS_PENDING';

export interface ExtractedDocument {
  text: string;
  pageCount?: number;
  metadata?: Record<string, any>;
  tables?: Array<Array<string[]>>;
  identifiedDates?: string[];
  identifiedNumbers?: Array<{ label: string; value: number }>;
}

export interface StructuredEvidenceFinding {
  claim: string | number;
  evidenceSupportedValue?: string | number;
  status: ReconciliationStatus;
  confidence: number; // 0.0 - 1.0
  basis: string[];
  limitations: string[];
  detectedFacts: string[];
  suggestedMaturityLevel?: number;
  evidenceConfidenceLevel?: 'E0' | 'E1' | 'E2' | 'E3' | 'E4';
}

export interface ReconcileClaimInput {
  assessmentId: string;
  metricCode: string;
  questionId?: string;
  institutionClaim: string | number;
  evidenceId?: string;
  evidenceFileName?: string;
  evidenceText: string;
  context?: {
    metricName?: string;
    dimensionCode?: string;
    whatWeAreAsking?: string;
    whatShouldIProvide?: string;
  };
}

export interface AIProvider {
  name: string;
  version: string;
  extractText(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<ExtractedDocument>;
  analyzeEvidence(extractedText: string, context: Record<string, any>): Promise<StructuredEvidenceFinding>;
  reconcileClaim(input: ReconcileClaimInput): Promise<StructuredEvidenceFinding>;
  classifyEvidence(extractedText: string): Promise<{ category: string; evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4'; confidence: number }>;
}

export interface ReconciliationRecordRow {
  id: string;
  assessmentId: string;
  metricCode: string;
  questionId?: string;
  institutionClaim: string;
  evidenceId?: string;
  evidenceFileName?: string;
  extractedFacts: string[];
  extractedValues: Record<string, any>;
  extractionConfidence: number;
  reconciliationStatus: ReconciliationStatus;
  detectedVariance?: string;
  reconciliationExplanation?: string;
  institutionClarification?: string;
  closedByInstitution: boolean;
  createdAt: string;
  updatedAt: string;
}
