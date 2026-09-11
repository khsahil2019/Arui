#!/usr/bin/env python3
"""
ARUI sample report generator — DESIGN REFERENCE ONLY.

Renders docs/samples/ARUI_Sample_Assessment_Report.pdf from
docs/samples/report-payload.sample.json (mock data, invented values).

This is not production code. It exists so the production developer can see
the intended report structure, hierarchy, typography and layout while
building the real generator against the contract in src/api/report-types.ts.
The production implementation may use any PDF stack (server-side HTML→PDF,
a React print view, a reporting library); the section order, labels and data
bindings in this script are the specification.

Usage:
    python3 docs/samples/report_sample_generator.py [--fonts DIR] [--out FILE]

Fonts: pass a directory containing Newsreader-Regular/Medium/SemiBold/
Italic-Regular.ttf and Plex-Regular/Medium/SemiBold/Italic.ttf (static
instances of the product typefaces). Falls back to DejaVu Serif/Sans.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Flowable,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

HERE = Path(__file__).parent
PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
CONTENT_W = PAGE_W - 2 * MARGIN

# Palette — print equivalents of the product tokens in src/styles.css
NAVY = colors.HexColor("#283552")
NAVY_DEEP = colors.HexColor("#1A2440")
BLUE = colors.HexColor("#3F66A8")
BLUE_SOFT = colors.HexColor("#E7ECF5")
TEAL = colors.HexColor("#3F8A8F")
TEAL_SOFT = colors.HexColor("#E6F1F1")
AMBER = colors.HexColor("#C88F3A")
AMBER_SOFT = colors.HexColor("#F8F0E1")
ROSE = colors.HexColor("#B5484F")
ROSE_SOFT = colors.HexColor("#F7E8E8")
IVORY = colors.HexColor("#FBFAF6")
IVORY_DEEP = colors.HexColor("#F3F1EA")
INK = colors.HexColor("#22283A")
SLATE = colors.HexColor("#5C6270")
BORDER = colors.HexColor("#E1DDD3")
WHITE = colors.white

STATUS_COLOR = {"STRONG": TEAL, "DEVELOPING": BLUE, "PRIORITY": AMBER, "NOT SCORED": SLATE}
STATUS_SOFT = {"STRONG": TEAL_SOFT, "DEVELOPING": BLUE_SOFT, "PRIORITY": AMBER_SOFT, "NOT SCORED": IVORY_DEEP}
MATURITY = {0: "Absent", 1: "Reactive", 2: "Emerging", 3: "Structured", 4: "Integrated", 5: "Adaptive"}


# ----------------------------------------------------------------------------
# Fonts
# ----------------------------------------------------------------------------
def register_fonts(fonts_dir: Path | None) -> dict[str, str]:
    names = {"serif": "Serif", "serifMed": "SerifMed", "serifBold": "SerifBold", "serifIt": "SerifIt", "sans": "Sans", "sansMed": "SansMed", "sansBold": "SansBold", "sansIt": "SansIt"}
    wanted = {
        "serif": "Newsreader-Regular.ttf", "serifMed": "Newsreader-Medium.ttf", "serifBold": "Newsreader-SemiBold.ttf", "serifIt": "Newsreader-Italic-Regular.ttf",
        "sans": "Plex-Regular.ttf", "sansMed": "Plex-Medium.ttf", "sansBold": "Plex-SemiBold.ttf", "sansIt": "Plex-Italic.ttf",
    }
    if fonts_dir and all((fonts_dir / f).exists() for f in wanted.values()):
        for key, fname in wanted.items():
            pdfmetrics.registerFont(TTFont(names[key], str(fonts_dir / fname)))
    else:
        def fc(q):
            return subprocess.check_output(["fc-match", "-f", "%{file}", q], text=True).strip()
        pdfmetrics.registerFont(TTFont("Serif", fc("DejaVu Serif")))
        pdfmetrics.registerFont(TTFont("SerifMed", fc("DejaVu Serif")))
        pdfmetrics.registerFont(TTFont("SerifBold", fc("DejaVu Serif:bold")))
        pdfmetrics.registerFont(TTFont("SerifIt", fc("DejaVu Serif:italic")))
        pdfmetrics.registerFont(TTFont("Sans", fc("DejaVu Sans")))
        pdfmetrics.registerFont(TTFont("SansMed", fc("DejaVu Sans")))
        pdfmetrics.registerFont(TTFont("SansBold", fc("DejaVu Sans:bold")))
        pdfmetrics.registerFont(TTFont("SansIt", fc("DejaVu Sans:italic")))
    from reportlab.pdfbase.pdfmetrics import registerFontFamily
    registerFontFamily("Sans", normal="Sans", bold="SansBold", italic="SansIt", boldItalic="SansBold")
    registerFontFamily("Serif", normal="Serif", bold="SerifBold", italic="SerifIt", boldItalic="SerifBold")
    return names


# ----------------------------------------------------------------------------
# Styles
# ----------------------------------------------------------------------------
def build_styles():
    s = {}
    s["eyebrow"] = ParagraphStyle("eyebrow", fontName="SansMed", fontSize=7.2, leading=9, textColor=BLUE, spaceAfter=3, alignment=TA_LEFT)
    s["h1"] = ParagraphStyle("h1", fontName="Serif", fontSize=24, leading=28, textColor=NAVY_DEEP, spaceAfter=6)
    s["h2"] = ParagraphStyle("h2", fontName="Serif", fontSize=15, leading=18, textColor=NAVY_DEEP, spaceBefore=10, spaceAfter=5)
    s["h3"] = ParagraphStyle("h3", fontName="SansBold", fontSize=9.5, leading=12, textColor=NAVY_DEEP, spaceBefore=6, spaceAfter=3)
    s["lede"] = ParagraphStyle("lede", fontName="Serif", fontSize=11.5, leading=16, textColor=INK, spaceAfter=8)
    s["body"] = ParagraphStyle("body", fontName="Sans", fontSize=9, leading=13, textColor=INK, spaceAfter=5)
    s["small"] = ParagraphStyle("small", fontName="Sans", fontSize=7.8, leading=10.5, textColor=SLATE)
    s["smallInk"] = ParagraphStyle("smallInk", fontName="Sans", fontSize=7.8, leading=10.5, textColor=INK)
    s["cell"] = ParagraphStyle("cell", fontName="Sans", fontSize=8.2, leading=11, textColor=INK)
    s["cellMuted"] = ParagraphStyle("cellMuted", fontName="Sans", fontSize=8.2, leading=11, textColor=SLATE)
    s["cellBold"] = ParagraphStyle("cellBold", fontName="SansBold", fontSize=8.2, leading=11, textColor=INK)
    s["th"] = ParagraphStyle("th", fontName="SansMed", fontSize=7, leading=9, textColor=SLATE)
    s["tileLabel"] = ParagraphStyle("tileLabel", fontName="SansMed", fontSize=6.8, leading=9, textColor=SLATE)
    s["tileValue"] = ParagraphStyle("tileValue", fontName="Serif", fontSize=20, leading=22, textColor=NAVY_DEEP)
    s["tileSub"] = ParagraphStyle("tileSub", fontName="Sans", fontSize=7.4, leading=9.5, textColor=SLATE)
    s["quote"] = ParagraphStyle("quote", fontName="SerifIt", fontSize=10, leading=14, textColor=INK, leftIndent=8, borderPadding=0)
    s["caption"] = ParagraphStyle("caption", fontName="SansIt", fontSize=7.6, leading=10, textColor=SLATE, spaceBefore=2)
    s["bullet"] = ParagraphStyle("bullet", parent=s["body"], leftIndent=10, bulletIndent=0, spaceAfter=3)
    return s


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ----------------------------------------------------------------------------
# Building blocks
# ----------------------------------------------------------------------------
class Rule(Flowable):
    def __init__(self, width=CONTENT_W, color=BORDER, thickness=0.6, space=4):
        super().__init__()
        self.width, self.color, self.thickness, self.space = width, color, thickness, space

    def wrap(self, aw, ah):
        return self.width, self.thickness + 2 * self.space

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.space, self.width, self.space)


class MaturityBars(Flowable):
    """Current vs required maturity per domain on a 0–5 scale."""

    def __init__(self, rows, width=CONTENT_W, row_h=26):
        super().__init__()
        self.rows, self.width, self.row_h = rows, width, row_h
        self.label_w = 150
        self.height = row_h * len(rows) + 44

    def wrap(self, aw, ah):
        return self.width, self.height

    def draw(self):
        c = self.canv
        x0 = self.label_w
        bar_w = self.width - x0 - 70
        scale = bar_w / 5.0
        top = self.height - 12
        c.setFont("SansMed", 6.6)
        c.setFillColor(SLATE)
        for i in range(6):
            c.drawCentredString(x0 + i * scale, top + 4, f"{i}")
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.4)
            c.line(x0 + i * scale, top - 1, x0 + i * scale, top - self.row_h * len(self.rows) - 2)
        c.setFont("Sans", 6.2)
        for i, lbl in MATURITY.items():
            c.drawCentredString(x0 + i * scale, top - self.row_h * len(self.rows) - 10, lbl)
        for idx, r in enumerate(self.rows):
            y = top - (idx + 1) * self.row_h + 8
            c.setFillColor(NAVY_DEEP)
            c.setFont("SansBold", 8)
            c.drawString(0, y + 6, r["code"])
            c.setFillColor(SLATE)
            c.setFont("Sans", 7)
            name = r["name"]
            if len(name) > 34:
                name = name[:33] + "…"
            c.drawString(0, y - 3, name)
            cur, req = r.get("currentMaturity"), r.get("requiredMaturity")
            if cur is not None:
                c.setFillColor(NAVY)
                c.roundRect(x0, y, cur * scale, 8, 2, stroke=0, fill=1)
            if req is not None:
                c.setFillColor(TEAL)
                c.setStrokeColor(TEAL)
                c.setLineWidth(1.4)
                c.line(x0 + req * scale, y - 3, x0 + req * scale, y + 11)
            td = r.get("transformationDistance")
            c.setFillColor(INK)
            c.setFont("SansMed", 7.4)
            txt = f"Distance {td:+d}" if td is not None else "—"
            c.drawString(x0 + bar_w + 10, y + 1, txt)
        # legend
        ly = 2
        c.setFillColor(NAVY)
        c.rect(x0, ly, 14, 6, stroke=0, fill=1)
        c.setFillColor(SLATE)
        c.setFont("Sans", 6.8)
        c.drawString(x0 + 18, ly, "Current maturity")
        c.setStrokeColor(TEAL)
        c.setLineWidth(1.4)
        c.line(x0 + 96, ly - 1, x0 + 96, ly + 8)
        c.drawString(x0 + 101, ly, "Required maturity (context-derived)")


class ScoreBar(Flowable):
    def __init__(self, score, status, width=120, height=7):
        super().__init__()
        self.score, self.status, self.width, self.height = score, status, width, height

    def wrap(self, aw, ah):
        return self.width, self.height + 2

    def draw(self):
        c = self.canv
        c.setFillColor(IVORY_DEEP)
        c.roundRect(0, 1, self.width, self.height, 2, stroke=0, fill=1)
        if self.score is not None:
            c.setFillColor(STATUS_COLOR.get(self.status, SLATE))
            c.roundRect(0, 1, self.width * min(self.score, 100) / 100.0, self.height, 2, stroke=0, fill=1)


def tile(st, label, value, sub=None, tone=None):
    bg = tone or IVORY_DEEP
    vstyle = st["tileValue"] if len(str(value)) <= 8 else ParagraphStyle("tileValueSm", parent=st["tileValue"], fontSize=14, leading=17)
    content = [Paragraph(esc(label).upper(), st["tileLabel"]), Paragraph(esc(value), vstyle)]
    if sub:
        content.append(Paragraph(esc(sub), st["tileSub"]))
    t = Table([[content]], colWidths=["100%"])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg), ("BOX", (0, 0), (-1, -1), 0.5, BORDER), ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 8), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return t


def tiles_row(items, gap=6):
    n = len(items)
    w = (CONTENT_W - gap * (n - 1)) / n
    data = [[]]
    widths = []
    for i, it in enumerate(items):
        data[0].append(it)
        widths.append(w)
        if i < n - 1:
            data[0].append("")
            widths.append(gap)
    t = Table(data, colWidths=widths)
    t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    return t


def status_chip(st, status):
    p = ParagraphStyle("chip", fontName="SansBold", fontSize=6.6, leading=8, textColor=STATUS_COLOR.get(status, SLATE))
    t = Table([[Paragraph(esc(status), p)]], colWidths=[None])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), STATUS_SOFT.get(status, IVORY_DEEP)), ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5), ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
    return t


def data_table(st, header, rows, col_widths, zebra=True, align_right=()):
    data = [[Paragraph(esc(h).upper(), st["th"]) for h in header]]
    for r in rows:
        data.append([c if isinstance(c, (Paragraph, Table, Flowable, list)) else Paragraph(esc(c), st["cell"]) for c in r])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = [
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, NAVY),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for col in align_right:
        style.append(("ALIGN", (col, 1), (col, -1), "RIGHT"))
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), IVORY))
    t.setStyle(TableStyle(style))
    return t


def finding_rows(st, findings):
    rows = []
    for f in findings:
        codes = ", ".join(f.get("domainCodes", []))
        ev = f.get("evidenceStatus", "").replace("_", " ")
        rows.append([
            [Paragraph(esc(f["title"]), st["cellBold"]), Paragraph(esc(f["body"]), st["cellMuted"])],
            Paragraph(esc(codes), st["cell"]),
            Paragraph(esc(ev.capitalize()), st["cellMuted"]),
        ])
    return rows


def kv_table(st, pairs, col_widths=(CONTENT_W * 0.32, CONTENT_W * 0.68)):
    data = [[Paragraph(esc(k), st["cellMuted"]), Paragraph(esc(v), st["cell"])] for k, v in pairs]
    t = Table(data, colWidths=list(col_widths))
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.4, BORDER), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 2), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    return t


def section_head(st, eyebrow, title, lede=None):
    out = [Paragraph(esc(eyebrow).upper(), st["eyebrow"]), Paragraph(esc(title), st["h1"])]
    if lede:
        out.append(Paragraph(esc(lede), st["lede"]))
    out.append(Rule(space=2))
    out.append(Spacer(1, 6))
    return out


def callout(st, text, tone=BLUE_SOFT, rule=BLUE):
    t = Table([[Paragraph(text, st["smallInk"])]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), tone), ("LINEBEFORE", (0, 0), (0, -1), 2, rule), ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    return t


# ----------------------------------------------------------------------------
# Page furniture
# ----------------------------------------------------------------------------
def make_page_callbacks(payload):
    inst = payload["institution"]["name"]
    banner = payload["report"]["statusBanner"]
    rid = payload["report"]["id"]
    conf = payload["report"]["confidentiality"]

    def cover(canv, doc):
        canv.saveState()
        canv.setFillColor(NAVY_DEEP)
        canv.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canv.setFillColor(NAVY)
        canv.rect(0, 0, PAGE_W, 92 * mm, stroke=0, fill=1)
        # domain dots: 11 domains, 3 assessed
        x, y = MARGIN, PAGE_H - 34 * mm
        for i in range(11):
            canv.setFillColor(TEAL if i < 3 else colors.HexColor("#3A4666"))
            canv.circle(x + i * 9, y, 2.6, stroke=0, fill=1)
        canv.setFillColor(colors.HexColor("#AEB8D0"))
        canv.setFont("SansMed", 7.4)
        canv.drawString(x + 11 * 9 + 6, y - 2.5, "ASSESSMENT COVERAGE · 3 OF 11 DOMAINS")
        canv.setFont("SansMed", 8)
        canv.setFillColor(colors.HexColor("#AEB8D0"))
        canv.drawString(MARGIN, PAGE_H - 50 * mm, "AI RESILIENT UNIVERSITY INDEX")
        canv.setFont("Serif", 34)
        canv.setFillColor(WHITE)
        canv.drawString(MARGIN, PAGE_H - 66 * mm, "Preliminary ARUI")
        canv.drawString(MARGIN, PAGE_H - 80 * mm, "Assessment Report")
        canv.setFont("SerifIt", 13)
        canv.setFillColor(colors.HexColor("#C9D1E3"))
        canv.drawString(MARGIN, PAGE_H - 92 * mm, "Institutional AI Resilience Assessment · Indicative position based on the current assessment scope")
        # institution block
        canv.setFont("SansMed", 7.4)
        canv.setFillColor(colors.HexColor("#AEB8D0"))
        canv.drawString(MARGIN, PAGE_H - 122 * mm, "PREPARED FOR")
        canv.setFont("Serif", 24)
        canv.setFillColor(WHITE)
        canv.drawString(MARGIN, PAGE_H - 132 * mm, inst)
        ident = payload["institution"]["identity"]
        canv.setFont("Sans", 9.5)
        canv.setFillColor(colors.HexColor("#C9D1E3"))
        canv.drawString(MARGIN, PAGE_H - 140 * mm, f"{ident['institutionType']} · {ident['governanceType']} · {ident['district']}, {ident['state']} · Established {ident['yearEstablished']}")
        # status chip
        canv.setFillColor(TEAL)
        canv.roundRect(MARGIN, PAGE_H - 156 * mm, 62 * mm, 8 * mm, 2, stroke=0, fill=1)
        canv.setFillColor(WHITE)
        canv.setFont("SansBold", 7.6)
        canv.drawString(MARGIN + 4 * mm, PAGE_H - 153.2 * mm, banner.upper())
        canv.setFillColor(AMBER)
        canv.roundRect(MARGIN + 66 * mm, PAGE_H - 156 * mm, 52 * mm, 8 * mm, 2, stroke=0, fill=1)
        canv.setFillColor(WHITE)
        canv.drawString(MARGIN + 70 * mm, PAGE_H - 153.2 * mm, "SAMPLE REPORT · MOCK DATA")
        # meta grid in lower band
        meta = [
            ("Assessment ID", payload["assessment"]["id"]),
            ("Report ID", rid),
            ("Assessment period", f"{payload['assessment']['periodStart']} to {payload['assessment']['periodEnd']}"),
            ("Methodology version", payload["report"]["methodologyVersion"]),
            ("Score run", payload["report"]["scoreRunId"]),
            ("Assessment status", payload["assessment"]["status"].capitalize()),
            ("Generated", payload["report"]["generatedAt"][:10]),
            ("Audience", payload["report"]["audience"]),
        ]
        gx, gy = MARGIN, 74 * mm
        colw = (PAGE_W - 2 * MARGIN) / 4
        for i, (k, v) in enumerate(meta):
            cx = gx + (i % 4) * colw
            cy = gy - (i // 4) * 20 * mm
            canv.setFont("SansMed", 6.8)
            canv.setFillColor(colors.HexColor("#AEB8D0"))
            canv.drawString(cx, cy, k.upper())
            canv.setFont("Sans", 8.6)
            canv.setFillColor(WHITE)
            for li, line in enumerate(simpleSplit(v, "Sans", 8.6, colw - 10)[:2]):
                canv.drawString(cx, cy - 12 - li * 11, line)
        canv.setFont("Sans", 7.2)
        canv.setFillColor(colors.HexColor("#8E9AB8"))
        canv.drawString(MARGIN, 16 * mm, conf)
        canv.drawString(MARGIN, 11 * mm, "Not a certification engine · Assessment fees never influence score, rank, verification or recognition.")
        canv.restoreState()

    def body(canv, doc):
        canv.saveState()
        # header band
        canv.setFillColor(NAVY_DEEP)
        canv.rect(0, PAGE_H - 11 * mm, PAGE_W, 11 * mm, stroke=0, fill=1)
        canv.setFont("SansMed", 7)
        canv.setFillColor(colors.HexColor("#C9D1E3"))
        canv.drawString(MARGIN, PAGE_H - 7 * mm, f"ARUI · PRELIMINARY ASSESSMENT REPORT · {inst.upper()}")
        canv.setFillColor(TEAL)
        w = 44 * mm
        canv.roundRect(PAGE_W - MARGIN - w - 40 * mm, PAGE_H - 8.6 * mm, w, 5.2 * mm, 1.5, stroke=0, fill=1)
        canv.setFillColor(WHITE)
        canv.setFont("SansBold", 6.2)
        canv.drawCentredString(PAGE_W - MARGIN - w / 2 - 40 * mm, PAGE_H - 6.9 * mm, banner.upper())
        canv.setFillColor(AMBER)
        canv.roundRect(PAGE_W - MARGIN - 38 * mm, PAGE_H - 8.6 * mm, 38 * mm, 5.2 * mm, 1.5, stroke=0, fill=1)
        canv.setFillColor(WHITE)
        canv.drawCentredString(PAGE_W - MARGIN - 19 * mm, PAGE_H - 6.9 * mm, "SAMPLE · MOCK DATA")
        # footer
        canv.setStrokeColor(BORDER)
        canv.setLineWidth(0.5)
        canv.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
        canv.setFont("Sans", 6.8)
        canv.setFillColor(SLATE)
        canv.drawString(MARGIN, 9 * mm, f"{rid} · {payload['report']['methodologyVersion']} · Confidential — prepared for institutional leadership")
        canv.drawRightString(PAGE_W - MARGIN, 9 * mm, f"Page {doc.page}")
        canv.restoreState()

    return cover, body


# ----------------------------------------------------------------------------
# Story
# ----------------------------------------------------------------------------
def build_story(p, st):
    S = []
    S.append(NextPageTemplate("body"))
    S.append(PageBreak())

    # --- Report information ------------------------------------------------
    S += section_head(st, "Report information", "About this report", "This report presents the Preliminary ARUI Assessment for the institution named below. It covers the three domains assessed in the current scope and should be read with the limitations set out at the end.")
    a = p["assessment"]
    pairs = [
        ("Institution", p["institution"]["name"]),
        ("Assessment ID", a["id"]),
        ("Report ID", p["report"]["id"]),
        ("Report kind", p["report"]["kind"].capitalize()),
        ("Assessment period", f"{a['periodStart']} to {a['periodEnd']}"),
        ("Submitted", (a["submittedAt"] or "—")[:10]),
        ("Assessment status", a["status"].capitalize()),
        ("Methodology version", p["report"]["methodologyVersion"]),
        ("Score run", p["report"]["scoreRunId"]),
        ("Template version", p["report"]["templateVersion"]),
        ("Contributors", "; ".join(f"{c['role']}: {c['name']}" for c in a["contributors"])),
        ("Assessors", "; ".join(f"{x['name']} ({x['role']})" for x in a["assessors"])),
        ("Confidentiality", p["report"]["confidentiality"]),
    ]
    S.append(kv_table(st, pairs))
    S.append(Spacer(1, 10))
    S.append(Paragraph("How to read this report", st["h2"]))
    S.append(Paragraph("<b>Current maturity</b> is the level the institution demonstrates today on a 0–5 scale, scored by assessors against domain-specific anchors. <b>Required maturity</b> is the level the institution's own context reasonably calls for; it is derived from mandate, AI exposure, disciplinary consequence and trajectory, and never changes a capability score. <b>Transformation distance</b> is required minus current; it is a diagnostic gap, not a penalty. <b>Evidence confidence</b> describes how well positions are supported and is reported separately from capability. <b>Cross-domain findings</b> are diagnostic signals only.", st["body"]))
    S.append(callout(st, f"<b>{esc(p['scope']['coverageStatement'])}.</b> Positions for the eight remaining domains are not assessed and no indicative score is given for them. Preliminary results are not a certification.", tone=TEAL_SOFT, rule=TEAL))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Contents", st["h2"]))
    toc = ["Executive summary", "Institutional context and profile", "Assessment scope and coverage", "Overall ARUI position", "Domain results — D01, D02, D03", "Cross-domain dependencies and contradictions", "Validation, evidence and verification status", "Assessor observations and priority areas", "Recommended actions — 90 days, 12 months, longer term", "Methodology note, limitations and reassessment"]
    for i, t in enumerate(toc, 1):
        S.append(Paragraph(f"{i}.&nbsp;&nbsp;{esc(t)}", st["smallInk"]))
    S.append(PageBreak())

    # --- Executive summary -------------------------------------------------
    ex = p["executiveSummary"]
    ov = p["overall"]
    S += section_head(st, "1 · Executive summary", ex["headline"])
    S.append(Paragraph(esc(ex["narrative"]), st["lede"]))
    S.append(Paragraph("Narrative sections of this report are assessor-authored. The engine supplies positions, flags and diagnostics; it does not write prose.", st["caption"]))
    S.append(Spacer(1, 6))
    S.append(tiles_row([
        tile(st, "Assessment coverage", f"{len(p['scope']['assessedDomains'])} of {p['scope']['totalDomains']}", "domains assessed (D01–D03)"),
        tile(st, "Weighted domain coverage", f"{ov['weightedDomainCoverage']:.2f}", "share of index weight covered"),
        tile(st, "Average evidence confidence", f"{ov['averageEvidenceConfidence']:.2f}", "mean of metric evidence levels (0–1)"),
        tile(st, "Evidence coverage", f"{round(ov['evidenceCoverage'] * 100)}%", "scored positions with gating evidence met"),
    ]))
    S.append(Spacer(1, 10))
    S.append(Paragraph("Domain positions at a glance", st["h3"]))
    rows = []
    for d in ov["domainPositions"]:
        rows.append([
            Paragraph(f"<b>{d['code']}</b> · {esc(d['name'])}", st["cell"]),
            f"{d['currentMaturity']} · {MATURITY[d['currentMaturity']]}",
            f"{d['requiredMaturity']} · {MATURITY[d['requiredMaturity']]}",
            f"{d['transformationDistance']:+d}",
            [ScoreBar(d["domainScore"], d["status"], width=70), Paragraph(f"{d['domainScore']:.0f} / 100", st["cellMuted"])],
            status_chip(st, d["status"]),
        ])
    S.append(data_table(st, ["Domain", "Current", "Required", "Distance", "Domain score", "Status"], rows, [CONTENT_W * 0.36, CONTENT_W * 0.14, CONTENT_W * 0.14, CONTENT_W * 0.09, CONTENT_W * 0.15, CONTENT_W * 0.12]))
    S.append(Spacer(1, 10))
    S.append(Paragraph("Key strengths", st["h3"]))
    S.append(data_table(st, ["Finding", "Domains", "Evidence"], finding_rows(st, ex["keyStrengths"]), [CONTENT_W * 0.70, CONTENT_W * 0.13, CONTENT_W * 0.17], zebra=False))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Priority gaps", st["h3"]))
    S.append(data_table(st, ["Finding", "Domains", "Evidence"], finding_rows(st, ex["priorityGaps"]), [CONTENT_W * 0.70, CONTENT_W * 0.13, CONTENT_W * 0.17], zebra=False))
    S.append(PageBreak())

    # --- Institutional context -------------------------------------------
    S += section_head(st, "2 · Institutional context and profile", "The institution as it described itself", "Context shapes what the assessment explores, how deeply, what evidence is proportionate and what maturity is reasonable to expect. It never gives an institution a score advantage or disadvantage.")
    groups = p["institution"]["profile"]
    half = (len(groups) + 1) // 2
    left, right = groups[:half], groups[half:]

    def group_block(g):
        items = [Paragraph(esc(g["group"]), st["h3"])]
        pairs = [(f["label"], (f["value"] or "—") + (f"  ({f['note']})" if f.get("note") else "")) for f in g["fields"]]
        items.append(kv_table(st, pairs, col_widths=(CONTENT_W * 0.19, CONTENT_W * 0.29)))
        items.append(Spacer(1, 6))
        return items

    lcol, rcol = [], []
    for g in left:
        lcol += group_block(g)
    for g in right:
        rcol += group_block(g)
    two = Table([[lcol, rcol]], colWidths=[CONTENT_W * 0.49, CONTENT_W * 0.49], hAlign="LEFT")
    two.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (0, 0), 8)]))
    S.append(two)
    S.append(callout(st, f"Profile completeness: <b>{esc(p['institution']['profileCompleteness'])}</b>. A complete profile precedes scoring. Expenditure and funding band boundaries, and the option lists for several profile fields, are pending methodology decisions; values shown are the institution's selections from provisional lists.", tone=AMBER_SOFT, rule=AMBER))
    S.append(PageBreak())

    # --- Scope -------------------------------------------------------------
    sc = p["scope"]
    S += section_head(st, "3 · Assessment scope and coverage", sc["coverageStatement"], "The AI Resilient University Index has eleven domains. This assessment covers the first three; the remaining eight are listed so that leadership can see the full architecture and what a complete assessment would add.")
    rows = []
    for d in sc["domains"]:
        rows.append([
            Paragraph(f"<b>{d['code']}</b>", st["cell"]),
            Paragraph(esc(d["name"]), st["cell"]),
            str(d["metricCount"]) if d["metricCount"] else "—",
            status_chip(st, "STRONG" if False else ("DEVELOPING" if d["inScope"] else "NOT SCORED")) if False else Paragraph("<b>Assessed</b>" if d["inScope"] else "Not yet assessed", st["cell"] if d["inScope"] else st["cellMuted"]),
        ])
    S.append(data_table(st, ["Code", "Domain", "Metrics", "Status in this report"], rows, [CONTENT_W * 0.08, CONTENT_W * 0.62, CONTENT_W * 0.10, CONTENT_W * 0.20], align_right=(2,)))
    S.append(Spacer(1, 8))
    S.append(tiles_row([
        tile(st, "Domains assessed", "3 of 11", "D01, D02, D03"),
        tile(st, "Metrics in scope", "41 of 143", "10 + 14 + 17"),
        tile(st, "Weighted domain coverage", f"{sc['weightedDomainCoverage']:.2f}", "sum of assessed domain weights"),
    ]))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Domain weights are provisional pending methodology validation. Weighted domain coverage is reported so that any future overall figure can be read against the share of the index it represents.", st["caption"]))
    S.append(PageBreak())

    # --- Overall position ---------------------------------------------------
    S += section_head(st, "4 · Overall ARUI position", "Where the institution stands, domain by domain", ov["narrative"])
    S.append(MaturityBars(ov["domainPositions"]))
    S.append(Spacer(1, 10))
    S.append(tiles_row([
        tile(st, "Overall ARUI / 100", "Withheld", "partial coverage · see note", tone=AMBER_SOFT),
        tile(st, "Weighted coverage", f"{ov['weightedDomainCoverage']:.2f}", "of 1.00 index weight"),
        tile(st, "Evidence confidence", f"{ov['averageEvidenceConfidence']:.2f}", "0–1 · separate from capability"),
        tile(st, "Confidence band", "Not reported", "band rule pending decision", tone=AMBER_SOFT),
    ]))
    S.append(Spacer(1, 8))
    S.append(callout(st, esc(ov["withheldReason"]), tone=AMBER_SOFT, rule=AMBER))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Reading transformation distance", st["h3"]))
    S.append(Paragraph("A distance of +2 means the institution's context calls for a maturity two levels above the level it currently demonstrates. Distance directs attention and sequencing; it does not lower any score. Where required maturity could not be derived, the methodology's default level applies and is marked as such in the domain section.", st["body"]))
    S.append(PageBreak())

    # --- Domain sections ---------------------------------------------------
    for i, d in enumerate(p["domains"]):
        S += section_head(st, f"5.{i + 1} · Domain result", f"{d['code']} — {d['name']}")
        S.append(tiles_row([
            tile(st, "Current maturity", f"{d['currentMaturity']}", MATURITY[d["currentMaturity"]]),
            tile(st, "Required maturity", f"{d['requiredMaturity']}", f"{MATURITY[d['requiredMaturity']]} · {'context-derived' if d['requiredMaturitySource'] == 'engine' else d['requiredMaturitySource'].replace('_', ' ')}"),
            tile(st, "Distance", f"{d['transformationDistance']:+d}", "required − current · diagnostic"),
            tile(st, "Domain score", f"{d['domainScore']:.0f}", d["status"].capitalize(), tone=STATUS_SOFT[d["status"]]),
            tile(st, "Evidence confidence", f"{d['confidence']['averageEvidenceConfidence']:.2f}", f"coverage {round(d['confidence']['evidenceCoverage'] * 100)}%"),
        ]))
        S.append(Spacer(1, 8))
        ms = d["metricSummary"]
        ld = d["confidence"]["levelDistribution"]
        S.append(Paragraph(f"Metrics: {ms['total']} in domain · {ms['applicable']} applicable · {ms['scored']} scored · {ms['notApplicable']} not applicable (accepted) · {ms['incomplete']} incomplete · {ms['reviewFlags']} review flag(s).  Evidence levels across scored metrics: " + " · ".join(f"{k} {v}" for k, v in ld.items()), st["small"]))
        S.append(Spacer(1, 6))
        S.append(Paragraph("Capability positions", st["h3"]))
        rows = []
        for c in d["capabilities"]:
            rows.append([Paragraph(esc(c["label"]), st["cell"]), [ScoreBar(c["score"], c["status"], width=150), Paragraph(f"{c['score']} / 100" if c["score"] is not None else "Not scored", st["cellMuted"])], status_chip(st, c["status"]), c["evidenceLevel"] or "—"])
        S.append(data_table(st, ["Capability", "Score", "Status", "Evidence"], rows, [CONTENT_W * 0.40, CONTENT_W * 0.33, CONTENT_W * 0.15, CONTENT_W * 0.12]))
        S.append(Paragraph("Capability labels are the domain's derived outputs. Individual metric identities are held in the assessor record and are not printed in the institution copy.", st["caption"]))
        S.append(Spacer(1, 6))
        S.append(Paragraph("Strengths", st["h3"]))
        S.append(data_table(st, ["Finding", "Domains", "Evidence"], finding_rows(st, d["strengths"]), [CONTENT_W * 0.70, CONTENT_W * 0.13, CONTENT_W * 0.17], zebra=False))
        S.append(Spacer(1, 6))
        S.append(Paragraph("Gaps", st["h3"]))
        S.append(data_table(st, ["Finding", "Domains", "Evidence"], finding_rows(st, d["gaps"]), [CONTENT_W * 0.70, CONTENT_W * 0.13, CONTENT_W * 0.17], zebra=False))
        S.append(Spacer(1, 6))
        S.append(KeepTogether([
            Paragraph("Claims awaiting evidence", st["h3"]),
            data_table(st, ["Claim", "Evidence that would validate it"], [[u["claim"], u["evidenceRequired"]] for u in d["unvalidatedClaims"]], [CONTENT_W * 0.50, CONTENT_W * 0.50], zebra=False),
            Paragraph("Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available.", st["caption"]),
        ]))
        S.append(Spacer(1, 6))
        rows = []
        for it in d["institutionalData"]:
            state = it["state"].replace("_", " ")
            val = f"{it['value']:,}" if it["value"] is not None else "—"
            rows.append([it["id"], it["item"], val, Paragraph(esc(state.capitalize()), st["cellMuted"])])
        S.append(KeepTogether([
            Paragraph("Institutional data supplied", st["h3"]),
            data_table(st, ["Ref", "Item", "Value", "State"], rows, [CONTENT_W * 0.10, CONTENT_W * 0.56, CONTENT_W * 0.12, CONTENT_W * 0.22], align_right=(2,)),
            Paragraph("Not sure, not provided and not applicable are distinct states. None of them is treated as zero.", st["caption"]),
        ]))
        if d.get("assessorObservation"):
            S.append(Spacer(1, 8))
            S.append(KeepTogether([Paragraph("Assessor observation", st["h3"]), callout(st, esc(d["assessorObservation"]), tone=IVORY_DEEP, rule=NAVY)]))
        S.append(PageBreak())

    # --- Cross-domain ------------------------------------------------------
    cd = p["crossDomain"]
    S += section_head(st, "6 · Cross-domain dependencies and contradictions", "How the assessed domains relate to one another", "Cross-domain intelligence tests whether linked capabilities support or contradict each other. These findings prioritise verification and leadership attention. They have no direct score effect.")
    S.append(Paragraph(f"Rules computable within the assessed scope: {esc(', '.join(cd['computableRules']))}. {cd['incompleteRuleCount']} further rules require domains not yet assessed and are recorded as incomplete.", st["body"]))
    S.append(Paragraph("Contradictions", st["h3"]))
    rows = []
    for f in cd["contradictions"]:
        rows.append([Paragraph(f"<b>{f['ruleId']}</b><br/>{esc(f['severity'])}", st["cell"]), Paragraph(f"{f['upstream']['domainCode']} {esc(f['upstream']['label'])} → {f['downstream']['domainCode']} {esc(f['downstream']['label'])}", st["cell"]), Paragraph(esc(f["interpretation"]), st["cell"]), Paragraph(esc(f["recommendedVerification"]), st["cellMuted"])])
    S.append(data_table(st, ["Rule", "Link", "Interpretation", "Recommended verification"], rows, [CONTENT_W * 0.10, CONTENT_W * 0.24, CONTENT_W * 0.36, CONTENT_W * 0.30], zebra=False))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Dependency gaps", st["h3"]))
    rows = []
    for f in cd["dependencies"]:
        rows.append([Paragraph(f"<b>{f['ruleId']}</b><br/>{esc(f['severity'])}", st["cell"]), Paragraph(f"{f['upstream']['domainCode']} {esc(f['upstream']['label'])} → {f['downstream']['domainCode']} {esc(f['downstream']['label'])}", st["cell"]), Paragraph(esc(f["interpretation"]), st["cell"]), Paragraph(esc(f["recommendedVerification"]), st["cellMuted"])])
    S.append(data_table(st, ["Rule", "Link", "Interpretation", "Recommended verification"], rows, [CONTENT_W * 0.10, CONTENT_W * 0.24, CONTENT_W * 0.36, CONTENT_W * 0.30], zebra=False))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Institutional coherence diagnostics", st["h3"]))
    S.append(data_table(st, ["Diagnostic", "State", "Note"], [[c["diagnostic"], c["state"].capitalize(), c["note"]] for c in cd["coherence"]], [CONTENT_W * 0.34, CONTENT_W * 0.14, CONTENT_W * 0.52], zebra=False))
    S.append(Spacer(1, 6))
    S.append(callout(st, "<b>Score effect: none.</b> A contradiction or dependency gap never adjusts a metric, domain or overall position. It tells assessors where to look and leadership where coherence is at risk.", tone=TEAL_SOFT, rule=TEAL))
    S.append(PageBreak())

    # --- Validation & evidence ---------------------------------------------
    v = p["validation"]
    ev = p["evidence"]
    S += section_head(st, "7 · Validation, evidence and verification status", "How well the positions are supported", ev["stance"])
    S.append(tiles_row([
        tile(st, "Evidence items submitted", str(ev["counts"]["submitted"]), f"core target {ev['coreTarget']['min']}–{ev['coreTarget']['max']}"),
        tile(st, "Accepted", str(ev["counts"]["accepted"]), f"{ev['counts']['underReview']} under review · {ev['counts']['returned']} returned"),
        tile(st, "Claims awaiting evidence", str(ev["unvalidatedClaimCount"]), "across D01–D03"),
        tile(st, "Verification", v["verificationStatus"].replace("_", " ").capitalize(), "independent verification follows"),
    ]))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Validation flags", st["h3"]))
    S.append(data_table(st, ["Domain", "Flag", "Count", "Note"], [[f["domainCode"], f["flag"], str(f["count"]), f["note"]] for f in v["flags"]], [CONTENT_W * 0.10, CONTENT_W * 0.24, CONTENT_W * 0.08, CONTENT_W * 0.58], zebra=False))
    S.append(Spacer(1, 8))
    S.append(Paragraph("Not-applicable decisions", st["h3"]))
    S.append(data_table(st, ["Domain", "Item", "Documented reason", "Decision"], [[n["domainCode"], n["item"], n["reason"], n["decision"].capitalize()] for n in v["notApplicableDecisions"]], [CONTENT_W * 0.10, CONTENT_W * 0.28, CONTENT_W * 0.48, CONTENT_W * 0.14], zebra=False))
    S.append(Spacer(1, 6))
    cal = v["calibration"]
    S.append(Paragraph(f"Assessor calibration: {cal['doubleScoredMetrics']} metrics were double-scored blind; {cal['agreed']} agreed within one level and {cal['adjudicated']} went to adjudication. Assessor overrides recorded: {len(v['overrides'])}.", st["body"]))
    S.append(Spacer(1, 4))
    S.append(Paragraph("Evidence register", st["h3"]))
    rows = []
    for it in ev["items"]:
        rows.append([Paragraph(esc(it["title"]), st["cell"]), it["type"], it["period"] or "—", ", ".join(it["domainCodes"]), it["status"].replace("_", " ").capitalize(), it["level"] or "—", Paragraph(esc(it["temporalValidity"].replace("_", " ").capitalize()), st["cellMuted"])])
    S.append(data_table(st, ["Evidence item", "Type", "Period", "Domains", "Status", "Level", "Temporal validity"], rows, [CONTENT_W * 0.30, CONTENT_W * 0.15, CONTENT_W * 0.13, CONTENT_W * 0.09, CONTENT_W * 0.12, CONTENT_W * 0.06, CONTENT_W * 0.15]))
    S.append(Paragraph("Evidence levels E0–E4 express the strength of support for a claim. Items outside the methodology's temporal validity window are returned and do not support current-period claims.", st["caption"]))
    S.append(PageBreak())

    # --- Assessor observations & priority areas ----------------------------
    S += section_head(st, "8 · Assessor observations and priority areas", "What the assessors want leadership to notice")
    for o in p["assessorObservations"]:
        scope = o["domainCode"] or "Whole assessment"
        S.append(KeepTogether([callout(st, f"<b>{esc(scope)}</b> — {esc(o['text'])}<br/><font color='#5C6270'>{esc(o['author'])} · {esc(o['date'])}</font>", tone=IVORY_DEEP, rule=NAVY), Spacer(1, 5)]))
    S.append(Spacer(1, 6))
    pr = p["priorities"]
    S.append(Paragraph("Priority areas", st["h2"]))
    S.append(data_table(st, ["#", "Area", "Domain", "Why it is a priority"], [[str(a["rank"]), Paragraph(f"<b>{esc(a['area'])}</b>", st["cell"]), a["domainCode"], a["reason"]] for a in pr["areas"]], [CONTENT_W * 0.05, CONTENT_W * 0.33, CONTENT_W * 0.10, CONTENT_W * 0.52], zebra=False))
    S.append(Spacer(1, 6))
    S.append(Paragraph(esc(pr["note"]), st["caption"]))
    S.append(PageBreak())

    # --- Recommended actions -----------------------------------------------
    S += section_head(st, "9 · Recommended actions", "A sequenced direction of travel", "Actions are grouped by horizon. Each is linked to the gap it addresses so that progress can be read back against the assessment at reassessment.")
    for horizon, title, tone, rule in [("90_days", "Next 90 days", TEAL_SOFT, TEAL), ("12_months", "Within 12 months", BLUE_SOFT, BLUE), ("longer_term", "Longer-term direction", IVORY_DEEP, NAVY)]:
        acts = [x for x in pr["actions"] if x["horizon"] == horizon]
        rows = []
        for x in acts:
            rows.append([[Paragraph(esc(x["title"]), st["cellBold"]), Paragraph(esc(x["detail"]), st["cellMuted"])], ", ".join(x["domainCodes"]), Paragraph(esc(x["linkedGap"] or "—"), st["cellMuted"]), x["suggestedOwner"] or "—"])
        S.append(KeepTogether([
            Table([[Paragraph(esc(title).upper(), ParagraphStyle("hz", fontName="SansBold", fontSize=7.4, leading=9, textColor=rule))]], colWidths=[CONTENT_W], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), tone), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5)])),
            data_table(st, ["Action", "Domains", "Linked gap", "Suggested owner"], rows, [CONTENT_W * 0.46, CONTENT_W * 0.10, CONTENT_W * 0.26, CONTENT_W * 0.18], zebra=False),
            Spacer(1, 10),
        ]))
    S.append(PageBreak())

    # --- Methodology note, limitations, reassessment -----------------------
    mn = p["methodologyNote"]
    S += section_head(st, "10 · Methodology note", f"About the ARUI methodology · {mn['version']}")
    for para in mn["paragraphs"]:
        S.append(Paragraph(esc(para), st["body"]))
    S.append(Paragraph("Scoring in brief", st["h3"]))
    for b in mn["scoringSummary"]:
        S.append(Paragraph(esc(b), st["bullet"], bulletText="•"))
    S.append(Paragraph("Maturity scale", st["h3"]))
    S.append(data_table(st, ["Level", "Label", "Meaning"], [[str(m["level"]), m["label"], m["meaning"]] for m in mn["maturityScale"]], [CONTENT_W * 0.08, CONTENT_W * 0.18, CONTENT_W * 0.74], zebra=False))
    S.append(Paragraph("Limitations and provisional status", st["h2"]))
    for l in p["limitations"]:
        S.append(Paragraph(esc(l), st["bullet"], bulletText="•"))
    ra = p["reassessment"]
    S.append(Paragraph("Reassessment", st["h2"]))
    S.append(Paragraph(f"<b>Recommended window.</b> {esc(ra['recommendedWindow'])}", st["body"]))
    S.append(Paragraph("<b>Triggers for earlier reassessment</b>", st["body"]))
    for t in ra["triggers"]:
        S.append(Paragraph(esc(t), st["bullet"], bulletText="•"))
    S.append(Paragraph("<b>Next steps</b>", st["body"]))
    for i, t in enumerate(ra["nextSteps"], 1):
        S.append(Paragraph(esc(t), st["bullet"], bulletText=f"{i}."))
    S.append(Paragraph("<b>Remaining domains for a full-scope assessment</b>", st["body"]))
    S.append(Paragraph(esc(" · ".join(f"{d['code']} {d['name']}" for d in ra["remainingDomains"])), st["small"]))
    S.append(Spacer(1, 14))
    S.append(Rule())
    S.append(Paragraph("This document is a Preliminary ARUI Assessment Report generated from a single score run under the methodology version stated. It is not a certification, ranking or public benchmark. Assessment fees pay for assessment work and never influence score, rank, verification or recognition.", st["small"]))
    return S


# ----------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fonts", type=Path, default=None)
    ap.add_argument("--payload", type=Path, default=HERE / "report-payload.sample.json")
    ap.add_argument("--out", type=Path, default=HERE / "ARUI_Sample_Assessment_Report.pdf")
    args = ap.parse_args()

    register_fonts(args.fonts)
    st = build_styles()
    payload = json.loads(args.payload.read_text())
    cover_cb, body_cb = make_page_callbacks(payload)

    doc = BaseDocTemplate(str(args.out), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=MARGIN + 6 * mm, bottomMargin=MARGIN, title="ARUI Preliminary Assessment Report — Sample", author="AI Resilient University Index (sample generator)", subject="Sample report rendered from mock data")
    body_frame = Frame(MARGIN, MARGIN, CONTENT_W, PAGE_H - MARGIN - (MARGIN + 6 * mm), id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    cover_frame = Frame(MARGIN, MARGIN, CONTENT_W, PAGE_H - 2 * MARGIN, id="cover", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="cover", frames=[cover_frame], onPage=cover_cb), PageTemplate(id="body", frames=[body_frame], onPage=body_cb)])
    doc.build(build_story(payload, st))
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
