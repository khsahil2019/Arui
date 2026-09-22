import fs from 'fs';
import path from 'path';

export interface ReportManifestItem {
  reportId: string;
  reportType: string;
  title: string;
  filename: string;
  pageCount: number;
  fileSizeBytes: number;
  generatedAt: string;
  institution: string;
  assessmentId: string;
  methodologyVersion: string;
  overallScore: number;
  audience: string;
  publicUrl: string;
}

export interface ReportManifest {
  product: 'ECRI';
  methodologyVersion: 'ECRI v6.0';
  institution: string;
  assessmentId: string;
  overallScore: number;
  generatedAt: string;
  reports: ReportManifestItem[];
}

/**
 * Counts actual physical pages in a PDF binary buffer.
 */
export function countPdfPages(pdfBuffer: Buffer): number {
  const content = pdfBuffer.toString('binary');
  // Match /Type /Page (excluding /Pages) or count page delimiters
  const matches = content.match(/\/Type\s*\/Page[^s]/g);
  if (matches && matches.length > 0) {
    return matches.length;
  }
  // Fallback pattern
  const fallback = content.match(/\/Count\s+(\d+)/);
  if (fallback && fallback[1]) {
    return parseInt(fallback[1], 10);
  }
  return 1;
}

/**
 * Generates dynamic manifest from existing sample PDF files.
 */
export function buildReportManifest(samplesDir: string, institutionName: string = 'Metropolitan Apex University'): ReportManifest {
  const definitions = [
    {
      reportId: 'RPT-ECRI-EXEC-001',
      reportType: 'EXECUTIVE',
      title: 'Executive Institutional Assessment Report',
      filename: 'ECRI_Sample_Executive_Report.pdf',
      audience: 'Vice-Chancellor, Academic Council & Executive Board',
    },
    {
      reportId: 'RPT-ECRI-DET-002',
      reportType: 'DETAILED_132_METRIC',
      title: 'Detailed 132-Metric Taxonomy Diagnostic',
      filename: 'ECRI_Sample_Detailed_132_Metric_Report.pdf',
      audience: 'Deans, Heads of Department & Curriculum Committees',
    },
    {
      reportId: 'RPT-ECRI-BRD-003',
      reportType: 'BOARD_SCORECARD',
      title: 'Boardroom Governance & Risk Scorecard',
      filename: 'ECRI_Sample_Board_Scorecard.pdf',
      audience: 'University Council, Board of Governors & Trustees',
    },
    {
      reportId: 'RPT-ECRI-EVI-004',
      reportType: 'EVIDENCE_DOSSIER',
      title: 'Evidence Integrity & Verification Dossier',
      filename: 'ECRI_Sample_Evidence_Integrity_Dossier.pdf',
      audience: 'Adcreditation Teams, Quality Assurance & Lead Adjudicators',
    },
    {
      reportId: 'RPT-ECRI-RDM-005',
      reportType: 'TRANSFORMATION_ROADMAP',
      title: 'Strategic 3-Horizon Transformation Roadmap',
      filename: 'ECRI_Sample_Transformation_Roadmap.pdf',
      audience: 'Transformation Taskforce & Institutional Leadership',
    },
  ];

  const items: ReportManifestItem[] = definitions.map((def) => {
    const filePath = path.join(samplesDir, def.filename);
    let pageCount = 0;
    let fileSizeBytes = 0;
    let generatedAt = new Date().toISOString();

    if (fs.existsSync(filePath)) {
      const buf = fs.readFileSync(filePath);
      fileSizeBytes = buf.length;
      pageCount = countPdfPages(buf);
      const stat = fs.statSync(filePath);
      generatedAt = stat.mtime.toISOString();
    }

    return {
      reportId: def.reportId,
      reportType: def.reportType,
      title: def.title,
      filename: def.filename,
      pageCount,
      fileSizeBytes,
      generatedAt,
      institution: institutionName,
      assessmentId: 'demo-ecri-asm-001',
      methodologyVersion: 'ECRI v6.0',
      overallScore: 74.8,
      audience: def.audience,
      publicUrl: `/samples/${def.filename}`,
    };
  });

  return {
    product: 'ECRI',
    methodologyVersion: 'ECRI v6.0',
    institution: institutionName,
    assessmentId: 'demo-ecri-asm-001',
    overallScore: 74.8,
    generatedAt: new Date().toISOString(),
    reports: items,
  };
}
