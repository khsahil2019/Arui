import { AIProvider, ExtractedDocument, StructuredEvidenceFinding, ReconcileClaimInput } from './types.js';

export class MockAIProvider implements AIProvider {
  public name = 'MockAIProvider';
  public version = '1.0.0-dev';

  async extractText(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<ExtractedDocument> {
    const rawString = fileBuffer.toString('utf8');
    // Extract dates (e.g. 2024, 2025, 2026, or YYYY-MM-DD)
    const dateMatches = rawString.match(/\b(202[0-9](?:-[0-1][0-9]-[0-3][0-9])?)\b/g) || [];
    const identifiedDates = Array.from(new Set(dateMatches));

    // Extract numbers associated with typical employability metrics
    const identifiedNumbers: Array<{ label: string; value: number }> = [];
    const numberMatches = rawString.matchAll(/([a-zA-Z\s]{3,25})[:\s=]+(\d{1,6})/g);
    for (const match of numberMatches) {
      const label = match[1].trim();
      const val = parseInt(match[2], 10);
      if (!isNaN(val)) {
        identifiedNumbers.push({ label, value: val });
      }
    }

    return {
      text: rawString.length > 0 ? rawString : `[Simulated text extraction from ${fileName} (${mimeType})]`,
      pageCount: Math.max(1, Math.ceil(fileBuffer.length / 3000)),
      metadata: {
        fileName,
        mimeType,
        fileSizeBytes: fileBuffer.length,
        extractedAt: new Date().toISOString(),
      },
      identifiedDates,
      identifiedNumbers,
    };
  }

  async analyzeEvidence(extractedText: string, context: Record<string, any>): Promise<StructuredEvidenceFinding> {
    const textLower = (extractedText || '').toLowerCase();
    const hasActiveRecords = textLower.includes('register') || textLower.includes('record') || textLower.includes('minutes') || textLower.includes('dataset') || textLower.includes('agreement');
    const hasNumbers = /\b\d{1,6}\b/.test(extractedText);

    const confidence = hasActiveRecords ? 0.92 : 0.75;
    const basis: string[] = [];
    const limitations: string[] = [];

    if (hasActiveRecords) {
      basis.push('Contains identifiable operating records and structured operational data.');
      basis.push('Artifact demonstrates direct institutional implementation rather than standalone policy text.');
    } else {
      basis.push('Contains preliminary institutional policy or self-declared summary.');
      limitations.push('Document may not represent the complete institutional operating dataset.');
    }

    return {
      claim: context.claim || 'Institutional Capability Evidenced',
      status: hasActiveRecords ? 'SUPPORTED' : 'INCONCLUSIVE',
      confidence,
      basis,
      limitations,
      detectedFacts: [
        `Document length: ${extractedText.length} characters`,
        `Identified operational keywords: ${hasActiveRecords ? 'Present' : 'Limited'}`,
      ],
      evidenceConfidenceLevel: hasActiveRecords ? (hasNumbers ? 'E3' : 'E2') : 'E1',
      suggestedMaturityLevel: hasActiveRecords ? 4 : 2,
    };
  }

  async reconcileClaim(input: ReconcileClaimInput): Promise<StructuredEvidenceFinding> {
    const { institutionClaim, evidenceText, metricCode } = input;
    const claimStr = String(institutionClaim || '').trim();
    const claimNum = parseFloat(claimStr);
    const isNumericClaim = !isNaN(claimNum);

    const textLower = (evidenceText || '').toLowerCase();

    // Check for specific numerical mismatch scenarios (e.g. 85 partnerships claimed vs 27 evidenced in sample dataset)
    if (isNumericClaim) {
      // Find all numbers in evidence text
      const numbersFound = (evidenceText.match(/\b\d{1,5}\b/g) || []).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      
      // Check if exact claim is found
      const exactMatch = numbersFound.includes(claimNum);
      if (exactMatch) {
        return {
          claim: claimNum,
          evidenceSupportedValue: claimNum,
          status: 'SUPPORTED',
          confidence: 0.95,
          basis: [
            `Verified exact match of institutional claim (${claimNum}) in submitted dataset / register.`,
            `Evidence covers active operating cycle.`,
          ],
          limitations: [
            'Data recency is subject to periodic audit verification.',
          ],
          detectedFacts: [
            `Identified verified value of ${claimNum} in evidence ${input.evidenceFileName || ''}.`,
          ],
          evidenceConfidenceLevel: 'E3',
        };
      }

      // If not exact match, look for highest verifiable count in evidence
      const maxFound = numbersFound.length > 0 ? Math.max(...numbersFound) : 0;
      if (maxFound > 0 && maxFound < claimNum) {
        const variance = claimNum - maxFound;
        return {
          claim: claimNum,
          evidenceSupportedValue: maxFound,
          status: 'POTENTIAL_MISMATCH',
          confidence: 0.91,
          basis: [
            `${maxFound} identifiable records found in submitted document.`,
            `Document covers recorded period 2025–2026.`,
          ],
          limitations: [
            'Document may not represent the complete institutional register.',
            'These observations reflect the submitted evidence available at the time of assessment. They do not by themselves establish intentional misreporting.',
          ],
          detectedFacts: [
            `Institution-reported value: ${claimNum}`,
            `Evidence-supported identifiable value: ${maxFound}`,
            `Difference: ${variance}`,
          ],
          evidenceConfidenceLevel: 'E2',
        };
      }
    }

    // Textual / qualitative claim evaluation
    const isStronglySupported = textLower.includes('approved') || textLower.includes('completed') || textLower.includes('implemented') || textLower.includes('verified');
    const isWeak = textLower.includes('draft') || textLower.includes('proposed') || textLower.includes('planned');

    if (isStronglySupported) {
      return {
        claim: claimStr,
        status: 'SUPPORTED',
        confidence: 0.88,
        basis: [
          'Submitted evidence documents active execution and stakeholder validation.',
          'Operational records corroborate institutional assertion.',
        ],
        limitations: [
          'Evidence reflects snapshot at time of upload.',
        ],
        detectedFacts: [
          `Corroborated mechanism for ${metricCode} in ${input.evidenceFileName || 'evidence artifact'}.`,
        ],
        evidenceConfidenceLevel: 'E3',
      };
    } else if (isWeak) {
      return {
        claim: claimStr,
        status: 'INCONCLUSIVE',
        confidence: 0.72,
        basis: [
          'Submitted artifact indicates draft or proposed state rather than full multi-cohort implementation.',
        ],
        limitations: [
          'Additional operational logs or outcome reports recommended.',
        ],
        detectedFacts: [
          'Draft policy or plan identified without operational delivery logs.',
        ],
        evidenceConfidenceLevel: 'E1',
      };
    }

    return {
      claim: claimStr,
      status: 'SUPPORTED',
      confidence: 0.82,
      basis: [
        'Artifact correlates with defined assessment criteria.',
      ],
      limitations: [
        'These observations reflect the submitted evidence available at the time of assessment. They do not by themselves establish intentional misreporting.',
      ],
      detectedFacts: [
        `Evidence reviewed for ${metricCode}.`,
      ],
      evidenceConfidenceLevel: 'E2',
    };
  }

  async classifyEvidence(extractedText: string): Promise<{ category: string; evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4'; confidence: number }> {
    const textLower = (extractedText || '').toLowerCase();
    if (textLower.includes('audit') || textLower.includes('accreditation') || textLower.includes('external review')) {
      return { category: 'EXTERNAL_AUDIT', evidenceLevel: 'E4', confidence: 0.94 };
    }
    if (textLower.includes('minutes') || textLower.includes('register') || textLower.includes('dataset') || textLower.includes('syllabus')) {
      return { category: 'OPERATIONAL_RECORD', evidenceLevel: 'E3', confidence: 0.89 };
    }
    if (textLower.includes('policy') || textLower.includes('handbook') || textLower.includes('guidelines')) {
      return { category: 'INSTITUTIONAL_POLICY', evidenceLevel: 'E2', confidence: 0.85 };
    }
    return { category: 'SELF_DECLARED_STATEMENT', evidenceLevel: 'E1', confidence: 0.70 };
  }
}
