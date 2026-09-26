import { AIProvider, ExtractedDocument, StructuredEvidenceFinding, ReconcileClaimInput } from './types.js';

export class OpenAIProvider implements AIProvider {
  public name = 'OpenAIProvider';
  public version = '1.0.0-prod';
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async extractText(fileBuffer: Buffer, mimeType: string, fileName: string): Promise<ExtractedDocument> {
    // Deterministic text extraction
    const rawString = fileBuffer.toString('utf8');
    return {
      text: rawString,
      pageCount: Math.max(1, Math.ceil(fileBuffer.length / 3000)),
      metadata: { fileName, mimeType, fileSizeBytes: fileBuffer.length },
    };
  }

  async analyzeEvidence(extractedText: string, context: Record<string, any>): Promise<StructuredEvidenceFinding> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server. Please check environment variables or use MockAIProvider.');
    }

    const systemPrompt = `You are the ECRI AI Evidence Intelligence Engine.
Analyze the submitted institutional evidence against the assessment context.
Return ONLY valid JSON with this exact schema:
{
  "claim": string or number,
  "evidenceSupportedValue": string or number or null,
  "status": "SUPPORTED" | "POTENTIAL_MISMATCH" | "INCONCLUSIVE" | "UNSUPPORTED" | "NOT_READABLE" | "INSUFFICIENT_EVIDENCE",
  "confidence": number between 0.0 and 1.0,
  "basis": string[],
  "limitations": string[],
  "detectedFacts": string[],
  "suggestedMaturityLevel": integer between 0 and 5,
  "evidenceConfidenceLevel": "E0" | "E1" | "E2" | "E3" | "E4"
}
Rules:
1. Do not invent or fabricate evidence.
2. Never accuse the institution of intentional fraud; use objective observations.
3. If evidence is ambiguous, mark status as INCONCLUSIVE or POTENTIAL_MISMATCH.`;

    const userPrompt = `Context: ${JSON.stringify(context)}
Evidence Text:
${extractedText.slice(0, 12000)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const json = await response.json() as any;
    const content = json.choices?.[0]?.message?.content;
    return JSON.parse(content) as StructuredEvidenceFinding;
  }

  async reconcileClaim(input: ReconcileClaimInput): Promise<StructuredEvidenceFinding> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server. Please check environment variables or use MockAIProvider.');
    }

    const systemPrompt = `You are the ECRI Claim-Evidence Reconciliation Engine.
Compare the institution's self-reported claim with the uploaded evidence text.
Return ONLY valid JSON matching this schema:
{
  "claim": string or number,
  "evidenceSupportedValue": string or number or null,
  "status": "SUPPORTED" | "POTENTIAL_MISMATCH" | "INCONCLUSIVE" | "UNSUPPORTED" | "NOT_READABLE" | "INSUFFICIENT_EVIDENCE",
  "confidence": number (0.0 to 1.0),
  "basis": string[],
  "limitations": string[],
  "detectedFacts": string[],
  "evidenceConfidenceLevel": "E0" | "E1" | "E2" | "E3" | "E4"
}
Important:
If the institution claims a count (e.g. 85 partnerships) and the document only contains 27 records, report claim=85, evidenceSupportedValue=27, status="POTENTIAL_MISMATCH".
Do not overwrite the claim.`;

    const userPrompt = `Metric: ${input.metricCode}
Institution Claim: ${JSON.stringify(input.institutionClaim)}
Evidence File: ${input.evidenceFileName || 'Uploaded Artifact'}
Evidence Content:
${input.evidenceText.slice(0, 12000)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const json = await response.json() as any;
    const content = json.choices?.[0]?.message?.content;
    return JSON.parse(content) as StructuredEvidenceFinding;
  }

  async classifyEvidence(extractedText: string): Promise<{ category: string; evidenceLevel: 'E0' | 'E1' | 'E2' | 'E3' | 'E4'; confidence: number }> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }
    // Classification call to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Classify this educational evidence artifact into category and E0-E4 level as JSON: {"category": string, "evidenceLevel": "E0"|"E1"|"E2"|"E3"|"E4", "confidence": number}' },
          { role: 'user', content: extractedText.slice(0, 4000) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API classification error: ${errText}`);
    }

    const json = await response.json() as any;
    return JSON.parse(json.choices?.[0]?.message?.content);
  }
}
