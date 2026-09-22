import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

// Palette constants matching the ARUI 20-page benchmark reference
export const PALETTE = {
  NAVY_COVER: '#0d1b2a',       // Dark navy cover
  NAVY_HEADER: '#132238',      // Running header dark navy
  NAVY_TEXT: '#1e293b',        // Slate-900 heading text
  CHARCOAL: '#334155',         // Slate-700 body text
  MUTED: '#64748b',            // Slate-500 secondary text
  MUTED_LIGHT: '#94a3b8',      // Slate-400 light labels
  LIGHT_BG: '#f8fafc',         // Slate-50 card/box background
  BORDER: '#e2e8f0',           // Slate-200 border lines
  BORDER_DARK: '#cbd5e1',      // Slate-300 table grid lines
  TEAL: '#0f766e',             // Teal accent
  TEAL_LIGHT: '#f0fdfa',       // Light teal tint
  TEAL_BORDER: '#99f6e4',      // Teal border
  AMBER: '#d97706',            // Amber/Gold
  AMBER_LIGHT: '#fef3c7',      // Light amber tint
  AMBER_BORDER: '#fde68a',     // Amber border
  BLUE: '#2563eb',             // Blue accent
  BLUE_LIGHT: '#eff6ff',       // Light blue tint
  EMERALD: '#16a34a',          // Green/Emerald
  EMERALD_LIGHT: '#f0fdf4',    // Light emerald tint
  ROSE: '#e11d48',             // Red/Rose priority
  ROSE_LIGHT: '#fff1f2',       // Light rose tint
  WHITE: '#ffffff',
};

export interface ReportMeta {
  productCode: string;
  productName: string;
  productSubtitle: string;
  institutionName: string;
  institutionMeta: string;
  assessmentId: string;
  reportId: string;
  assessmentPeriod: string;
  methodologyVersion: string;
  scoreRun: string;
  assessmentStatus: string;
  generatedDate: string;
  audience: string;
  overallScore: number | null;
  overallLevel: string;
  coverageLabel: string;
  sampleBadgeLabel: string;
}

export class EcriVectorReportBuilder {
  doc: PDFKit.PDFDocument;
  meta: ReportMeta;
  currentPageNum: number = 1;
  totalPages: number = 20;

  constructor(meta: ReportMeta, totalPages: number = 20) {
    this.meta = meta;
    this.totalPages = totalPages;
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      autoFirstPage: false,
      bufferPages: true,
      info: {
        Title: `${meta.productName} — ${meta.institutionName}`,
        Author: 'Rafts & Rivers Higher Education Advisory',
        Subject: meta.productSubtitle,
      },
    });
  }

  // Draw Page Running Header & Footer
  drawHeaderFooter(pageNum: number) {
    if (pageNum === 1) return; // Cover page has no header/footer

    const d = this.doc;
    const w = d.page.width;

    // 1. Top Running Header Dark Navy Banner
    d.rect(0, 0, w, 28).fill(PALETTE.NAVY_HEADER);

    // Left Title
    d.fillColor(PALETTE.WHITE)
      .fontSize(7)
      .font('Helvetica-Bold')
      .text(
        `${this.meta.productCode.toUpperCase()} · ${this.meta.productSubtitle.toUpperCase()} · ${this.meta.institutionName.toUpperCase()}`,
        40,
        9,
        { lineBreak: false }
      );

    // Right Badges
    const badge1W = 140;
    const badge1X = w - 40 - badge1W - 100;
    d.roundedRect(badge1X, 5, badge1W, 18, 3).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.WHITE)
      .fontSize(6)
      .font('Helvetica-Bold')
      .text(this.meta.coverageLabel.toUpperCase(), badge1X, 9, { width: badge1W, align: 'center' });

    const badge2W = 95;
    const badge2X = w - 40 - badge2W;
    d.roundedRect(badge2X, 5, badge2W, 18, 3).fill(PALETTE.AMBER);
    d.fillColor(PALETTE.WHITE)
      .fontSize(6)
      .font('Helvetica-Bold')
      .text(this.meta.sampleBadgeLabel.toUpperCase(), badge2X, 9, { width: badge2W, align: 'center' });

    // 2. Bottom Running Footer
    const footerY = 804;
    d.rect(40, footerY - 8, w - 80, 0.5).fill(PALETTE.BORDER);

    d.fillColor(PALETTE.MUTED)
      .fontSize(6.8)
      .font('Helvetica')
      .text(
        `${this.meta.reportId} · ${this.meta.methodologyVersion} · Confidential — prepared for institutional leadership`,
        40,
        footerY,
        { lineBreak: false }
      );

    d.fillColor(PALETTE.MUTED)
      .fontSize(6.8)
      .font('Helvetica')
      .text(`Page ${pageNum}`, w - 100, footerY, { width: 60, align: 'right' });
  }

  // Draw Premium Dark Navy Cover Page (Page 1)
  drawCoverPage() {
    this.doc.addPage();
    const d = this.doc;
    const w = d.page.width;
    const h = d.page.height;

    // Full Bleed Dark Navy Cover Background
    d.rect(0, 0, w, h).fill(PALETTE.NAVY_COVER);

    // Top Dot Indicators & Coverage Line
    const dotY = 110;
    const dotColors = [PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL, PALETTE.TEAL];
    dotColors.forEach((color, i) => {
      d.circle(44 + i * 9, dotY, 2.5).fill(color);
    });

    d.fillColor(PALETTE.MUTED_LIGHT)
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .text(this.meta.coverageLabel.toUpperCase(), 160, dotY - 3);

    // Subtitle uppercase
    d.fillColor('#94a3b8')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('EMPLOYABILITY & CAREER READINESS INTELLIGENCE', 40, 160);

    // Large Elegant Serif Title
    d.fillColor(PALETTE.WHITE)
      .fontSize(32)
      .font('Times-Bold')
      .text('Preliminary ECRI\nAssessment Report', 40, 185, { lineGap: 6 });

    // Italic Subtitle
    d.fillColor('#cbd5e1')
      .fontSize(11)
      .font('Times-Italic')
      .text(
        'Institutional Employability & Work-Readiness Assessment · Comprehensive position based on the 11-dimension framework',
        40,
        275,
        { width: 515 }
      );

    // PREPARED FOR Section
    d.fillColor('#94a3b8')
      .fontSize(7.5)
      .font('Helvetica-Bold')
      .text('PREPARED FOR', 40, 400);

    d.fillColor(PALETTE.WHITE)
      .fontSize(24)
      .font('Times-Bold')
      .text(this.meta.institutionName, 40, 420);

    d.fillColor('#cbd5e1')
      .fontSize(9.5)
      .font('Helvetica')
      .text(this.meta.institutionMeta, 40, 455);

    // Badges
    const badgeY = 490;
    d.roundedRect(40, badgeY, 190, 24, 4).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.WHITE)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(this.meta.coverageLabel.toUpperCase(), 40, badgeY + 7, { width: 190, align: 'center' });

    d.roundedRect(240, badgeY, 170, 24, 4).fill(PALETTE.AMBER);
    d.fillColor(PALETTE.WHITE)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(this.meta.sampleBadgeLabel.toUpperCase(), 240, badgeY + 7, { width: 170, align: 'center' });

    // Bottom Metadata Grid in 2 rows of 4 columns
    const metaY = 700;
    d.rect(40, metaY - 15, w - 80, 0.5).fill('#334155');

    const colW = (w - 80) / 4;
    const row1 = [
      { label: 'ASSESSMENT ID', val: this.meta.assessmentId },
      { label: 'REPORT ID', val: this.meta.reportId },
      { label: 'ASSESSMENT PERIOD', val: this.meta.assessmentPeriod },
      { label: 'METHODOLOGY VERSION', val: this.meta.methodologyVersion },
    ];
    const row2 = [
      { label: 'SCORE RUN', val: this.meta.scoreRun },
      { label: 'ASSESSMENT STATUS', val: this.meta.assessmentStatus },
      { label: 'GENERATED', val: this.meta.generatedDate },
      { label: 'AUDIENCE', val: this.meta.audience },
    ];

    row1.forEach((item, i) => {
      d.fillColor('#94a3b8').fontSize(6.5).font('Helvetica-Bold').text(item.label, 40 + i * colW, metaY);
      d.fillColor(PALETTE.WHITE).fontSize(7.5).font('Helvetica').text(item.val, 40 + i * colW, metaY + 11, { width: colW - 10 });
    });

    const metaY2 = metaY + 40;
    row2.forEach((item, i) => {
      d.fillColor('#94a3b8').fontSize(6.5).font('Helvetica-Bold').text(item.label, 40 + i * colW, metaY2);
      d.fillColor(PALETTE.WHITE).fontSize(7.5).font('Helvetica').text(item.val, 40 + i * colW, metaY2 + 11, { width: colW - 10 });
    });

    // Confidentiality Notice at Bottom
    d.fillColor('#64748b')
      .fontSize(6.5)
      .font('Helvetica')
      .text(
        'Confidential — prepared for the institution\'s leadership. Not a certification, ranking or public benchmark.\nNot a certification engine · Assessment fees never influence score, rank, verification or recognition.',
        40,
        785,
        { width: 515, align: 'center' }
      );
  }

  // Draw Standard Section Top Header
  drawSectionTracker(label: string, title: string, subtitle?: string, y: number = 46) {
    const d = this.doc;
    d.fillColor(PALETTE.MUTED).fontSize(7.5).font('Helvetica-Bold').text(label.toUpperCase(), 40, y);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(17).font('Times-Bold').text(title, 40, y + 14, { width: 515 });
    let curY = y + 14 + (title.length > 55 ? 40 : 24);
    if (subtitle) {
      d.fillColor(PALETTE.CHARCOAL).fontSize(9).font('Helvetica').text(subtitle, 40, curY, { width: 515, lineGap: 3 });
      curY += 28;
    }
    return curY;
  }

  // Draw 4 KPI Metric Boxes Row
  drawKpiRow(y: number, boxes: { label: string; value: string; sub: string }[]) {
    const d = this.doc;
    const w = (515 - (boxes.length - 1) * 8) / boxes.length;
    boxes.forEach((b, i) => {
      const x = 40 + i * (w + 8);
      d.roundedRect(x, y, w, 52, 4).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
      d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text(b.label.toUpperCase(), x + 8, y + 7, { width: w - 16 });
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(15).font('Times-Bold').text(b.value, x + 8, y + 18, { width: w - 16 });
      d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica').text(b.sub, x + 8, y + 36, { width: w - 16 });
    });
    return y + 60;
  }

  // Draw Callout Box with Accent Bar
  drawCallout(y: number, title: string, text: string, type: 'teal' | 'amber' | 'neutral' = 'teal') {
    const d = this.doc;
    const bgColor = type === 'teal' ? PALETTE.TEAL_LIGHT : type === 'amber' ? PALETTE.AMBER_LIGHT : PALETTE.LIGHT_BG;
    const borderColor = type === 'teal' ? PALETTE.TEAL_BORDER : type === 'amber' ? PALETTE.AMBER_BORDER : PALETTE.BORDER;
    const barColor = type === 'teal' ? PALETTE.TEAL : type === 'amber' ? PALETTE.AMBER : PALETTE.MUTED;

    d.roundedRect(40, y, 515, 36, 4).fillAndStroke(bgColor, borderColor);
    d.rect(40, y, 3, 36).fill(barColor);

    if (title) {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(title, 50, y + 7);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(text, 50, y + 19, { width: 495 });
    } else {
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(text, 50, y + 10, { width: 495 });
    }
    return y + 44;
  }

  // Draw Dimension Results Page (Matching Page 8/10/12 exactly!)
  drawDimensionResultPage(pageNum: number, dData: {
    sectionNum: string;
    code: string;
    name: string;
    currentMaturity: number;
    currentLabel: string;
    requiredMaturity: number;
    requiredLabel: string;
    distance: number;
    score: number;
    scoreStatus: string;
    evidenceConfidence: number;
    evidenceCoverage: string;
    metricsSummary: string;
    capabilities: { name: string; score: number; status: string; evidence: string }[];
    strengths: { finding: string; text: string; domain: string; evidence: string }[];
    gaps: { finding: string; text: string; domain: string; evidence: string }[];
    claimsAwaiting: { claim: string; evidenceNeeded: string }[];
    institutionalData: { ref: string; item: string; value: string; state: string }[];
    assessorObservation: string;
  }) {
    this.doc.addPage();
    const d = this.doc;
    let y = 46;

    // 1. Top Section Tracker & Dimension Title
    d.fillColor(PALETTE.MUTED).fontSize(7.5).font('Helvetica-Bold').text(`${dData.sectionNum} · DOMAIN RESULT`, 40, y);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(17).font('Times-Bold').text(`${dData.code} — ${dData.name}`, 40, y + 14);
    y += 40;

    // 2. 5 KPI Summary Boxes in a Horizontal Row
    const boxW = (515 - 4 * 6) / 5;
    const boxes = [
      { label: 'CURRENT MATURITY', val: `${dData.currentMaturity}`, sub: dData.currentLabel },
      { label: 'REQUIRED MATURITY', val: `${dData.requiredMaturity}`, sub: `${dData.requiredLabel} ·\ncontext-derived` },
      { label: 'DISTANCE', val: `+${dData.distance}`, sub: 'required − current ·\ndiagnostic' },
      { label: 'DOMAIN SCORE', val: `${dData.score}`, sub: dData.scoreStatus },
      { label: 'EVIDENCE CONFIDENCE', val: `${dData.evidenceConfidence.toFixed(2)}`, sub: `coverage ${dData.evidenceCoverage}` },
    ];

    boxes.forEach((b, i) => {
      const bx = 40 + i * (boxW + 6);
      d.roundedRect(bx, y, boxW, 58, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
      d.fillColor(PALETTE.MUTED).fontSize(5.8).font('Helvetica-Bold').text(b.label, bx + 6, y + 6, { width: boxW - 12 });
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(17).font('Times-Bold').text(b.val, bx + 6, y + 17, { width: boxW - 12 });
      d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica').text(b.sub, bx + 6, y + 36, { width: boxW - 12 });
    });
    y += 66;

    // 3. Metrics summary line
    d.fillColor(PALETTE.MUTED).fontSize(7).font('Helvetica').text(dData.metricsSummary, 40, y, { width: 515 });
    y += 16;

    // 4. Capability positions Table
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Capability positions', 40, y);
    y += 12;

    // Table Header
    d.rect(40, y, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('CAPABILITY', 45, y + 4);
    d.text('SCORE', 240, y + 4);
    d.text('STATUS', 370, y + 4);
    d.text('EVIDENCE', 460, y + 4);
    y += 16;

    dData.capabilities.forEach((c) => {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica').text(c.name, 45, y + 2, { width: 190 });
      
      // Score bar
      const barW = 80;
      d.rect(240, y + 4, barW, 5).fill(PALETTE.BORDER);
      const fillW = Math.max(0, Math.min(barW, (c.score / 100) * barW));
      const barColor = c.score >= 70 ? PALETTE.BLUE : c.score >= 55 ? PALETTE.AMBER : PALETTE.ROSE;
      d.rect(240, y + 4, fillW, 5).fill(barColor);
      d.fillColor(PALETTE.CHARCOAL).fontSize(6.5).font('Helvetica').text(`${c.score} / 100`, 240, y + 11);

      // Status Badge
      const stColor = c.status === 'PRIORITY' ? PALETTE.AMBER : PALETTE.TEAL;
      d.fillColor(stColor).fontSize(7).font('Helvetica-Bold').text(c.status, 370, y + 4);

      // Evidence Badge
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica-Bold').text(c.evidence, 465, y + 4);

      d.rect(40, y + 20, 515, 0.4).fill(PALETTE.BORDER);
      y += 22;
    });

    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Oblique').text(
      'Capability labels are the domain\'s derived outputs. Individual metric identities are held in the assessor record and are not printed in the institution copy.',
      40,
      y + 2,
      { width: 515 }
    );
    y += 18;

    // 5. Strengths Table
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Strengths', 40, y);
    y += 12;
    d.rect(40, y, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('FINDING', 45, y + 4);
    d.text('DOMAINS', 380, y + 4);
    d.text('EVIDENCE', 450, y + 4);
    y += 16;

    dData.strengths.forEach((s) => {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(s.finding, 45, y + 2, { width: 320 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(s.text, 45, y + 11, { width: 320 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(s.domain, 380, y + 4);
      d.fillColor(PALETTE.EMERALD).fontSize(7.5).font('Helvetica-Bold').text(s.evidence, 450, y + 4);
      d.rect(40, y + 26, 515, 0.4).fill(PALETTE.BORDER);
      y += 28;
    });
    y += 4;

    // 6. Gaps Table
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Gaps', 40, y);
    y += 12;
    d.rect(40, y, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('FINDING', 45, y + 4);
    d.text('DOMAINS', 380, y + 4);
    d.text('EVIDENCE', 450, y + 4);
    y += 16;

    dData.gaps.forEach((g) => {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(g.finding, 45, y + 2, { width: 320 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(g.text, 45, y + 11, { width: 320 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(g.domain, 380, y + 4);
      const evColor = g.evidence === 'Evidenced' ? PALETTE.EMERALD : g.evidence === 'Partially evidenced' ? PALETTE.AMBER : PALETTE.MUTED;
      d.fillColor(evColor).fontSize(7.5).font('Helvetica-Bold').text(g.evidence, 450, y + 4);
      d.rect(40, y + 26, 515, 0.4).fill(PALETTE.BORDER);
      y += 28;
    });

    // ----------------------------------------------------
    // COMPANION SUB-PAGE FOR CLAIMS & INSTITUTIONAL DATA
    // ----------------------------------------------------
    this.doc.addPage();
    let y2 = 46;

    d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Claims awaiting evidence', 40, y2);
    y2 += 12;
    d.rect(40, y2, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('CLAIM', 45, y2 + 4);
    d.text('EVIDENCE THAT WOULD VALIDATE IT', 280, y2 + 4);
    y2 += 16;

    dData.claimsAwaiting.forEach((c) => {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica').text(c.claim, 45, y2 + 2, { width: 225 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(c.evidenceNeeded, 280, y2 + 2, { width: 265 });
      d.rect(40, y2 + 20, 515, 0.4).fill(PALETTE.BORDER);
      y2 += 22;
    });

    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Oblique').text(
      'Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available.',
      40,
      y2 + 2,
      { width: 515 }
    );
    y2 += 24;

    // Institutional data supplied table
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Institutional data supplied', 40, y2);
    y2 += 12;
    d.rect(40, y2, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('REF', 45, y2 + 4);
    d.text('ITEM', 110, y2 + 4);
    d.text('VALUE', 380, y2 + 4);
    d.text('STATE', 450, y2 + 4);
    y2 += 16;

    dData.institutionalData.forEach((row) => {
      d.fillColor(PALETTE.MUTED).fontSize(7).font('Helvetica').text(row.ref, 45, y2 + 2);
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica').text(row.item, 110, y2 + 2, { width: 260 });
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(row.value, 380, y2 + 2);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(row.state, 450, y2 + 2);
      d.rect(40, y2 + 15, 515, 0.4).fill(PALETTE.BORDER);
      y2 += 17;
    });

    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Oblique').text(
      'Not sure, not provided and not applicable are distinct states. None of them is treated as zero.',
      40,
      y2 + 2,
      { width: 515 }
    );
    y2 += 22;

    // Assessor observation
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Assessor observation', 40, y2);
    y2 += 12;
    d.roundedRect(40, y2, 515, 36, 4).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y2, 3, 36).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(dData.assessorObservation, 50, y2 + 8, { width: 495, lineGap: 2 });
  }

  // Finalize PDF Stream and apply all Headers & Footers across buffered pages
  finalize(outputStream: NodeJS.WritableStream): Promise<void> {
    return new Promise((resolve, reject) => {
      outputStream.on('finish', resolve);
      outputStream.on('error', reject);

      this.doc.pipe(outputStream);

      // Post-process buffered pages to stamp headers and footers with accurate page counts
      const range = this.doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        this.doc.switchToPage(i);
        this.drawHeaderFooter(i + 1);
      }

      this.doc.end();
    });
  }
}
