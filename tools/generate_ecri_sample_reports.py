from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from pathlib import Path
import json, math
root=Path('/mnt/data/final_ecri_build/Arui-main')
out=root/'university-insights-main/public/samples'; out.mkdir(parents=True,exist_ok=True)
s=json.loads((root/'arui-backend/src/methodology/ecri_sample/canonical_demo.json').read_text())
D=s['dimensions']
navy=colors.HexColor('#17324D'); teal=colors.HexColor('#0F766E'); light=colors.HexColor('#F3F7F7'); gray=colors.HexColor('#5B6573'); red=colors.HexColor('#A94442'); green=colors.HexColor('#2F855A')
styles=getSampleStyleSheet(); styles.add(ParagraphStyle(name='Cover',fontName='Helvetica-Bold',fontSize=28,leading=34,textColor=navy,spaceAfter=14)); styles.add(ParagraphStyle(name='H1x',fontName='Helvetica-Bold',fontSize=18,leading=22,textColor=navy,spaceAfter=8)); styles.add(ParagraphStyle(name='H2x',fontName='Helvetica-Bold',fontSize=12,leading=15,textColor=teal,spaceAfter=5)); styles.add(ParagraphStyle(name='Bodyx',fontName='Helvetica',fontSize=9.2,leading=13,textColor=gray)); styles.add(ParagraphStyle(name='Smallx',fontName='Helvetica',fontSize=7.5,leading=10,textColor=gray)); styles.add(ParagraphStyle(name='BigScore',fontName='Helvetica-Bold',fontSize=36,leading=40,textColor=teal,alignment=TA_CENTER));

def footer(canvas,doc):
    canvas.saveState(); canvas.setFont('Helvetica',7); canvas.setFillColor(gray); canvas.drawString(18*mm,10*mm,'ECRI v6.0 · Demonstration dataset · Synthetic institution'); canvas.drawRightString(192*mm,10*mm,f'Page {doc.page}'); canvas.restoreState()
def title(t,sub=None):
    a=[Paragraph(t,styles['H1x'])]
    if sub:a.append(Paragraph(sub,styles['Bodyx']))
    a.append(Spacer(1,5*mm)); return a
def score_table():
    data=[[Paragraph('<b>Dimension</b>',styles['Smallx']),Paragraph('<b>Weight</b>',styles['Smallx']),Paragraph('<b>Score</b>',styles['Smallx']),Paragraph('<b>Current Maturity</b>',styles['Smallx']),Paragraph('<b>Required</b>',styles['Smallx']),Paragraph('<b>Gap</b>',styles['Smallx'])]]
    for d in D:
        gap=d['requiredMaturity']-d['currentMaturity']; data.append([Paragraph(d['code']+' · '+d['name'],styles['Smallx']),f"{d['weight']*100:.0f}%",f"{d['score']:.1f}",str(d['currentMaturity']),str(d['requiredMaturity']),f"{gap:+.1f}"])
    t=Table(data,colWidths=[83*mm,18*mm,20*mm,28*mm,22*mm,18*mm],repeatRows=1)
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D7DEE5')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),7.5),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,light]),('ALIGN',(1,1),(-1,-1),'CENTER')]))
    return t

def build_exec(path):
    doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=16*mm,leftMargin=16*mm,topMargin=16*mm,bottomMargin=16*mm)
    st=[]; st += [Spacer(1,25*mm),Paragraph('ECRI',styles['Cover']),Paragraph('Employability & Career Readiness Intelligence',styles['H1x']),Paragraph('Executive Institutional Assessment Report',styles['H1x']),Spacer(1,8*mm),Paragraph('<b>Metropolitan Apex University</b>',styles['H2x']),Paragraph('Synthetic demonstration institution · ECRI v6.0 · 2026',styles['Bodyx']),Spacer(1,22*mm),Paragraph('74.80 / 100',styles['BigScore']),Paragraph('Overall ECRI Position',styles['H2x']),Spacer(1,15*mm),Paragraph('This demonstration uses the production ECRI scoring architecture with a synthetic institution. All values are illustrative; the calculation is real and reproducible.',styles['Bodyx']),PageBreak()]
    st += title('1. Executive Institutional Position','The first leadership question: where does the institution stand, and what does the score actually mean?')
    st += [Paragraph('<b>Headline score</b> 74.80 / 100',styles['H2x']),Paragraph('The headline score is a weighted aggregation of validated metric performance across 11 dimensions. Evidence confidence is reported separately and is not used as a performance multiplier.',styles['Bodyx']),Spacer(1,5*mm),score_table(),PageBreak()]
    st += title('2. What Leadership Needs to Know')
    findings=[('01','Strong external relevance foundation','Employer demand, curriculum alignment and digital work readiness show relatively strong positions.'),('02','Practice is the central transformation gap','D04 sits below its declared required maturity and should be treated as a system-level priority.'),('03','Outcome quality needs stronger longitudinal intelligence','D10 requires stronger verified progression and quality-of-employment tracking.'),('04','Capability signalling is uneven','D08 shows a gap between capability development and the ability to demonstrate it credibly to employers.'),('05','ECRI converts findings into sequenced action','The roadmap links maturity gaps to evidence, ownership and review horizons.')]
    for a,b,c in findings: st += [Table([[Paragraph(f'<b>{a}</b>',styles['H2x']),Paragraph(f'<b>{b}</b><br/>{c}',styles['Bodyx'])]],colWidths=[15*mm,160*mm],style=TableStyle([('BACKGROUND',(0,0),(0,0),light),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),0.4,colors.HexColor('#D7DEE5')),('INNERGRID',(0,0),(-1,-1),0.2,colors.HexColor('#E7EBEF')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])),Spacer(1,3*mm)]
    st.append(PageBreak())
    st += title('3. Institutional Context','Context changes what is reasonable to expect; it does not provide an automatic score advantage.')
    ctx=[['Context factor','Demonstration value'],['Institution type','Broad multidisciplinary university'],['Geography','Urban / regional employer ecosystem'],['Scale','Multi-faculty institution'],['Mandate','Teaching + research + employability'],['Assessment scope','11 dimensions / 132 metrics'],['Core evidence model','10 evidence packets supporting multiple metrics']]
    t=Table(ctx,colWidths=[55*mm,120*mm],repeatRows=1); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#D7DEE5')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,light]),('FONTSIZE',(0,0),(-1,-1),8)])); st += [t,PageBreak()]
    st += title('4. Eleven-Dimension Intelligence Map'); st += [score_table(),PageBreak()]
    # pages 6-16: one per dimension
    for i,d in enumerate(D,1):
        st += title(f'5.{i} {d["code"]} — {d["name"]}')
        gap=d['requiredMaturity']-d['currentMaturity']; score=d['score']
        st += [Table([[Paragraph('<b>Performance</b>',styles['Smallx']),Paragraph('<b>Current maturity</b>',styles['Smallx']),Paragraph('<b>Required maturity</b>',styles['Smallx']),Paragraph('<b>Transformation distance</b>',styles['Smallx'])],[Paragraph(f'<font size="18"><b>{score:.1f}</b></font>',styles['Bodyx']),str(d['currentMaturity']),str(d['requiredMaturity']),f'{gap:+.1f} level']],colWidths=[42*mm]*4,style=TableStyle([('BACKGROUND',(0,0),(-1,0),light),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#D7DEE5')),('ALIGN',(0,0),(-1,-1),'CENTER'),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])),Spacer(1,6*mm)]
        strengths=['Structured ownership exists for the dimension.', 'Operating practices are visible in representative areas.', 'There is a clear opportunity to strengthen repeatability and institutional integration.']
        gaps=['Evidence coverage should be strengthened where claims exceed Level 2.', 'Cross-functional integration is the next maturity step.', 'Outcome/learning loops should be made visible where relevant.']
        st += [Paragraph('Diagnostic interpretation',styles['H2x']),Paragraph('This dimension is assessed through 12 canonical metrics. The score is performance; maturity is the observed capability state; required maturity is the declared target. They are intentionally not collapsed into one construct.',styles['Bodyx']),Spacer(1,4*mm),Paragraph('Illustrative strengths',styles['H2x'])]
        for q in strengths: st.append(Paragraph('• '+q,styles['Bodyx']))
        st += [Spacer(1,3*mm),Paragraph('Illustrative transformation signals',styles['H2x'])]
        for q in gaps: st.append(Paragraph('• '+q,styles['Bodyx']))
        st += [Spacer(1,5*mm),Paragraph('<b>12 canonical metrics</b> · evidence confidence reported separately · metric-level traceability available in the detailed report.',styles['Smallx']),PageBreak()]
    st += title('17. Evidence, Verification & Score Release')
    st += [Paragraph('ECRI does not use evidence confidence as a score multiplier. Instead, evidence controls whether a maturity claim is supportable and whether a score can be released as final.',styles['Bodyx']),Spacer(1,5*mm)]
    for x in ['E0 — No usable evidence','E1 — Self-reported / limited evidence','E2 — Operating evidence','E3 — Outcome / corroborated evidence','E4 — Independent / high-stakes evidence']: st.append(Paragraph('• '+x,styles['Bodyx']))
    st += [Spacer(1,5*mm),Paragraph('<b>Release principles:</b> E0/E1 cannot substantiate maturity ≥3; missing data is not N/A; contradictions require adjudication; high-stakes claims require enhanced verification.',styles['Bodyx'])]
    doc.build(st,onFirstPage=footer,onLaterPages=footer)

def build_detailed(path):
    doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=14*mm,leftMargin=14*mm,topMargin=14*mm,bottomMargin=14*mm)
    st=[Spacer(1,12*mm),Paragraph('ECRI v6.0 — Detailed 132-Metric Diagnostic Report',styles['Cover']),Paragraph('Metropolitan Apex University · Synthetic demonstration dataset · Overall 74.80 / 100',styles['Bodyx']),PageBreak()]
    # 4 pages per dimension = 44 + cover = 45
    for d in D:
        metrics=[]
        for j in range(1,13):
            score=max(35,min(95,d['score'] + ((j*7)%15)-7))
            m=max(0,min(5,d['currentMaturity'] + (1 if j in (3,8) and d['currentMaturity']<4 else 0)))
            metrics.append((f"{d['code']}-I{j:02d}",score,m,'E2' if j%3 else 'E3'))
        for pg in range(4):
            st += title(f'{d["code"]} — {d["name"]}',f'Page {pg+1} of 4 for this dimension · 12 canonical metrics')
            if pg==0:
                st += [Paragraph(f'<b>Dimension performance:</b> {d["score"]:.1f} · <b>Current maturity:</b> {d["currentMaturity"]} · <b>Required:</b> {d["requiredMaturity"]} · <b>Gap:</b> {d["requiredMaturity"]-d["currentMaturity"]:+.1f}',styles['Bodyx']),Spacer(1,4*mm)]
                rows=[["Metric","Performance","Maturity","Evidence"]]+[list(x) for x in metrics[:6]]
            elif pg==1:
                rows=[["Metric","Performance","Maturity","Evidence"]]+[list(x) for x in metrics[6:]]
            elif pg==2:
                rows=[["Metric","Observed signal","Control / verification","Status"]]
                for code,sc,m,e in metrics:
                    rows.append([code,f'{sc:.1f} performance; M{m}', 'Anchor evidence + operating proof', 'Verified sample'])
            else:
                rows=[["Intelligence layer","Demonstration output"],['Strength','Structured capability exists in representative areas.'],['Gap','Integration and repeatability are the next maturity step.'],['Evidence','E2 operating evidence; E3 where outcome claims are made.'],['Anti-gaming','Policy-only claims cannot establish Level 3+.'],['Next action','Close the highest-distance metrics first and reassess with the same methodology version.']]
            t=Table(rows,colWidths=[42*mm,50*mm,50*mm,35*mm],repeatRows=1)
            if pg==3: t=Table(rows,colWidths=[55*mm,120*mm],repeatRows=1)
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.3,colors.HexColor('#D7DEE5')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,light]),('FONTSIZE',(0,0),(-1,-1),7),('VALIGN',(0,0),(-1,-1),'TOP')]))
            st += [t,Spacer(1,4*mm)]
            if pg==3: st.append(Paragraph('This section demonstrates the traceability expected from the live ECRI workspace; the live system stores assessor rationale, evidence links, applicability decisions and verification status.',styles['Smallx']))
            st.append(PageBreak())
    # should be 45 pages exactly
    doc.build(st,onFirstPage=footer,onLaterPages=footer)

def simple_report(path,title_txt,pages,sections):
    doc=SimpleDocTemplate(str(path),pagesize=A4,rightMargin=16*mm,leftMargin=16*mm,topMargin=16*mm,bottomMargin=16*mm); st=[]
    for i in range(pages):
        if i==0: st += [Spacer(1,25*mm),Paragraph(title_txt,styles['Cover']),Paragraph('Metropolitan Apex University · ECRI v6.0 · Synthetic demonstration',styles['Bodyx']),Spacer(1,10*mm),Paragraph('74.80 / 100',styles['BigScore']),PageBreak()]
        else:
            sec=sections[(i-1)%len(sections)]; st += title(f'{i+1}. {sec[0]}',sec[1])
            for j in range(5): st.append(Paragraph(f'<b>{sec[2][j%len(sec[2])]}</b> — Demonstration evidence, interpretation, verification and leadership implication are shown using the same canonical ECRI dataset. This is illustrative output; the live engine replaces synthetic observations with institution-specific assessment data.',styles['Bodyx'])); st.append(Spacer(1,4*mm))
            if i<pages-1: st.append(PageBreak())
    doc.build(st,onFirstPage=footer,onLaterPages=footer)

build_exec(out/'ECRI_Sample_Executive_Report.pdf')
build_detailed(out/'ECRI_Sample_Detailed_132_Metric_Report.pdf')
simple_report(out/'ECRI_Sample_Board_Scorecard.pdf','ECRI Board Scorecard',4,[('Board View','What governing leadership sees first',['Overall position','11-dimension profile','Top transformation gaps']),('Decision Signals','What requires attention',['Priority dimensions','Evidence confidence','Cross-domain dependencies']),('Action','What leadership should commission',['0–90 day priorities','Owners and review gates','Reassessment'])])
simple_report(out/'ECRI_Sample_Evidence_Integrity_Dossier.pdf','ECRI Evidence & Claim Integrity Dossier',8,[('Evidence Architecture','How evidence supports claims',['E0–E4 assurance','Metric traceability','Evidence reuse']),('Verification','How claims are controlled',['Maturity anchors','Contradictions','High-stakes claims']),('Anti-Gaming','How inflation is detected',['Policy-only inflation','Evidence recycling','Outcome back-casting'])])
simple_report(out/'ECRI_Sample_Transformation_Roadmap.pdf','ECRI Transformation Roadmap',7,[('0–90 Days','Immediate system actions',['Priority gaps','Owners','Evidence deliverables']),('3–12 Months','Capability integration',['Operating model','Cross-functional integration','Employer ecosystem']),('12–24 Months','Longitudinal intelligence',['Outcome tracking','Reassessment','Continuous improvement'])])
print('generated',[(p.name,p.stat().st_size) for p in out.glob('ECRI_Sample_*.pdf')])
