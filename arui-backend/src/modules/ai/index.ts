import { AIProvider, ExtractedDocument, StructuredEvidenceFinding, ReconcileClaimInput, ReconciliationStatus } from './types.js';
import { MockAIProvider } from './mockProvider.js';
import { OpenAIProvider } from './openAiProvider.js';

let activeProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (activeProvider) return activeProvider;

  // Use OpenAIProvider only if explicit server env key is available and configured for production
  if (process.env.OPENAI_API_KEY && process.env.AI_PROVIDER === 'openai') {
    activeProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
    console.log('[AI Intelligence] Active provider: OpenAIProvider');
  } else {
    activeProvider = new MockAIProvider();
    console.log('[AI Intelligence] Active provider: MockAIProvider (No active paid API key required)');
  }
  return activeProvider;
}

export function setAIProvider(provider: AIProvider): void {
  activeProvider = provider;
}

export async function extractEvidence(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<ExtractedDocument> {
  const provider = getAIProvider();
  return provider.extractText(fileBuffer, mimeType, fileName);
}

export async function analyzeEvidence(extractedText: string, context: Record<string, any> = {}): Promise<StructuredEvidenceFinding> {
  const provider = getAIProvider();
  try {
    return await provider.analyzeEvidence(extractedText, context);
  } catch (err: any) {
    console.warn('[AI Analysis Warning] Provider failed:', err.message);
    return {
      claim: context.claim || 'Pending',
      status: 'AI_ANALYSIS_PENDING',
      confidence: 0.0,
      basis: ['AI Analysis is currently queued or awaiting API activation.'],
      limitations: ['Document is safely stored. Analysis can be resumed/retried at any time.'],
      detectedFacts: [],
      evidenceConfidenceLevel: 'E1',
    };
  }
}

export async function reconcileClaim(input: ReconcileClaimInput): Promise<StructuredEvidenceFinding> {
  const provider = getAIProvider();
  try {
    return await provider.reconcileClaim(input);
  } catch (err: any) {
    console.warn('[AI Reconciliation Warning] Provider failed:', err.message);
    return {
      claim: input.institutionClaim,
      status: 'AI_ANALYSIS_PENDING',
      confidence: 0.0,
      basis: ['Claim and evidence preserved. Analysis will complete upon provider connection.'],
      limitations: ['Analysis pending.'],
      detectedFacts: [],
      evidenceConfidenceLevel: 'E1',
    };
  }
}

export async function classifyEvidence(extractedText: string): Promise<{ category: string; evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4'; confidence: number }> {
  const provider = getAIProvider();
  return provider.classifyEvidence(extractedText);
}

export * from './types.js';
export * from './mockProvider.js';
export * from './openAiProvider.js';
