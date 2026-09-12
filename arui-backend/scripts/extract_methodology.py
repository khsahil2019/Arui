#!/usr/bin/env python3
"""
ARUI Methodology Registry Extractor
Parses P0-2 through P0-8 Excel workbooks from /data and produces clean, authoritative JSON files.
"""

import openpyxl
import json
import os

DATA_DIR = "/Users/sahilkhan/FlutterDev/Arui/data"
OUT_DIR = "/Users/sahilkhan/FlutterDev/Arui/arui-backend/src/methodology/registry"
os.makedirs(OUT_DIR, exist_ok=True)

P0_8_PATH = os.path.join(DATA_DIR, "AI_Resilient_University_Index_D01-D11_EXHAUSTIVE_MASTER_ENGINE_v4_P0-8_ASSESSMENT_EXECUTION_ADAPTIVE_ENGINE_EXCEL_LINK_CLEAN(1).xlsx")

def clean_val(v):
    if v is None:
        return None
    if isinstance(v, str):
        v = v.strip()
        return v if v else None
    return v

def extract_domains_and_capabilities(wb):
    domains = []
    capabilities = []
    
    ws = wb['Domains']
    rows = list(ws.iter_rows(values_only=True))
    for r in rows[1:]:
        if not r or not r[0]: continue
        d_id = clean_val(r[0])
        d_name = clean_val(r[1])
        d_purpose = clean_val(r[2]) if len(r) > 2 else ""
        domains.append({
            "code": d_id,
            "name": d_name,
            "purpose": d_purpose,
            "provisionalWeight": {
                "D01": 0.10, "D02": 0.12, "D03": 0.12, "D04": 0.10,
                "D05": 0.10, "D06": 0.10, "D07": 0.10, "D08": 0.08,
                "D09": 0.09, "D10": 0.05, "D11": 0.04
            }.get(d_id, 0.09)
        })

    ws_cap = wb['Capability_Areas']
    rows_cap = list(ws_cap.iter_rows(values_only=True))
    for r in rows_cap[1:]:
        if not r or not r[0] or not r[1]: continue
        c_dom = clean_val(r[0])
        c_id = clean_val(r[1])
        c_name = clean_val(r[2]) if len(r) > 2 else ""
        capabilities.append({
            "domainCode": c_dom,
            "code": c_id,
            "fullCode": f"{c_dom}-{c_id}",
            "name": c_name
        })

    return domains, capabilities

def extract_metrics_and_anchors(wb):
    metrics = []
    ws = wb['Indicators_Metrics']
    rows = list(ws.iter_rows(values_only=True))
    for r in rows[1:]:
        if not r or not r[0] or not r[1]: continue
        d_code = clean_val(r[0])
        m_id = clean_val(r[1])
        m_name = clean_val(r[2])
        what_measured = clean_val(r[3]) if len(r) > 3 else ""
        method = clean_val(r[4]) if len(r) > 4 else ""
        exposure = clean_val(r[5]) if len(r) > 5 else "Medium"
        
        full_code = f"{d_code}-{m_id}"
        metrics.append({
            "domainCode": d_code,
            "code": m_id,
            "fullCode": full_code,
            "name": m_name,
            "whatMeasured": what_measured,
            "measurementMethod": method,
            "exposure": exposure,
            "weight": 1.0,
            "hasOutcome": True
        })

    return metrics

def extract_anchors(wb):
    anchors = []
    ws = wb['Maturity_Anchors']
    rows = list(ws.iter_rows(values_only=True))
    for r in rows[1:]:
        if not r or r[0] is None: continue
        scope = clean_val(r[0])
        level = clean_val(r[1])
        label = clean_val(r[2])
        desc = clean_val(r[3]) if len(r) > 3 else ""
        anchors.append({
            "scope": scope,
            "level": int(level) if level is not None and str(level).isdigit() else 0,
            "label": label,
            "description": desc
        })
    return anchors

def extract_institutional_data(wb):
    items = []
    ws = wb['Institutional_Data']
    rows = list(ws.iter_rows(values_only=True))
    for r in rows[1:]:
        if not r or not r[0]: continue
        d_code = clean_val(r[0])
        i_id = clean_val(r[1])
        label = clean_val(r[2])
        input_type = clean_val(r[3]) if len(r) > 3 else "number"
        requirement = clean_val(r[4]) if len(r) > 4 else "Required"
        items.append({
            "domainCode": d_code,
            "code": i_id,
            "label": label,
            "inputType": input_type,
            "requirement": requirement
        })
    return items

def extract_questions_and_cards(wb):
    cards = []
    questions = []
    
    ws_cards = wb['Assessment_Cards']
    for r in list(ws_cards.iter_rows(values_only=True))[1:]:
        if not r or not r[0] or not r[1]: continue
        cards.append({
            "domainCode": clean_val(r[0]),
            "code": clean_val(r[1]),
            "name": clean_val(r[2]),
            "format": clean_val(r[3]),
            "respondentAction": clean_val(r[4]),
            "metricLink": clean_val(r[5])
        })
        
    ws_q = wb['Question_Bank']
    for r in list(ws_q.iter_rows(values_only=True))[1:]:
        if not r or not r[0] or not r[1]: continue
        questions.append({
            "domainCode": clean_val(r[0]),
            "code": clean_val(r[1]),
            "cardCode": clean_val(r[2]),
            "prompt": clean_val(r[3]),
            "inputType": clean_val(r[4]),
            "role": clean_val(r[5])
        })
        
    return cards, questions

def extract_evidence_requirements(wb):
    ev = []
    ws = wb['Evidence_Requirements']
    for r in list(ws.iter_rows(values_only=True))[1:]:
        if not r or not r[0]: continue
        ev.append({
            "domainCode": clean_val(r[0]),
            "code": clean_val(r[1]),
            "title": clean_val(r[2]),
            "quantity": clean_val(r[3]),
            "requirement": clean_val(r[4]),
            "metricLink": clean_val(r[5])
        })
    return ev

def extract_anti_gaming_rules(wb):
    rules = []
    ws = wb['P0-6_AntiGaming']
    for r in list(ws.iter_rows(values_only=True))[1:]:
        if not r or not r[0]: continue
        rules.append({
            "code": clean_val(r[0]),
            "riskPattern": clean_val(r[1]),
            "detectionLogic": clean_val(r[2]),
            "evidenceSignal": clean_val(r[3]),
            "action": clean_val(r[4]),
            "scoringProtection": clean_val(r[5])
        })
    return rules

def extract_cross_domain_rules(wb):
    rules = []
    ws = wb['P0-5_Contradiction_Engine']
    rows = list(ws.iter_rows(values_only=True))
    for r in rows[1:]:
        if not r or not r[0]: continue
        rules.append({
            "ruleId": clean_val(r[0]),
            "fromMetric": clean_val(r[1]),
            "toMetric": clean_val(r[2]),
            "fromScoreThreshold": clean_val(r[3]),
            "toScoreThreshold": clean_val(r[4]),
            "fromRequiredR": clean_val(r[5])
        })
    return rules

def extract_institution_profile_fields(wb):
    fields = []
    ws = wb['Institution_Profile']
    rows = list(ws.iter_rows(values_only=True))
    for r in rows[1:]:
        if not r or not r[0]: continue
        fields.append({
            "code": clean_val(r[0]),
            "label": clean_val(r[1]),
            "inputType": clean_val(r[2]),
            "requirement": clean_val(r[3]),
            "use": clean_val(r[4]) if len(r) > 4 else "Context"
        })
    return fields

def main():
    print(f"Loading master workbook from {P0_8_PATH}...")
    wb = openpyxl.load_workbook(P0_8_PATH, data_only=True)
    
    domains, capabilities = extract_domains_and_capabilities(wb)
    metrics = extract_metrics_and_anchors(wb)
    anchors = extract_anchors(wb)
    inst_data = extract_institutional_data(wb)
    profile_fields = extract_institution_profile_fields(wb)
    cards, questions = extract_questions_and_cards(wb)
    evidence_reqs = extract_evidence_requirements(wb)
    anti_gaming = extract_anti_gaming_rules(wb)
    cross_domain = extract_cross_domain_rules(wb)
    
    with open(os.path.join(OUT_DIR, "domains.json"), "w") as f:
        json.dump(domains, f, indent=2)
    with open(os.path.join(OUT_DIR, "capabilities.json"), "w") as f:
        json.dump(capabilities, f, indent=2)
    with open(os.path.join(OUT_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    with open(os.path.join(OUT_DIR, "anchors.json"), "w") as f:
        json.dump(anchors, f, indent=2)
    with open(os.path.join(OUT_DIR, "institutional_data_items.json"), "w") as f:
        json.dump(inst_data, f, indent=2)
    with open(os.path.join(OUT_DIR, "institution_profile_fields.json"), "w") as f:
        json.dump(profile_fields, f, indent=2)
    with open(os.path.join(OUT_DIR, "cards.json"), "w") as f:
        json.dump(cards, f, indent=2)
    with open(os.path.join(OUT_DIR, "question_bank.json"), "w") as f:
        json.dump(questions, f, indent=2)
    with open(os.path.join(OUT_DIR, "evidence_requirements.json"), "w") as f:
        json.dump(evidence_reqs, f, indent=2)
    with open(os.path.join(OUT_DIR, "anti_gaming_rules.json"), "w") as f:
        json.dump(anti_gaming, f, indent=2)
    with open(os.path.join(OUT_DIR, "cross_domain_rules.json"), "w") as f:
        json.dump(cross_domain, f, indent=2)
        
    print(f"Extraction complete! Files written to {OUT_DIR}:")
    print(f"  - Domains: {len(domains)}")
    print(f"  - Capabilities: {len(capabilities)}")
    print(f"  - Metrics: {len(metrics)}")
    print(f"  - Anchors: {len(anchors)}")
    print(f"  - Institutional Profile Fields: {len(profile_fields)}")
    print(f"  - Institutional Data Items: {len(inst_data)}")
    print(f"  - Assessment Cards: {len(cards)}")
    print(f"  - Question Bank: {len(questions)}")
    print(f"  - Evidence Requirements: {len(evidence_reqs)}")
    print(f"  - Anti-Gaming Rules: {len(anti_gaming)}")
    print(f"  - Cross-Domain Rules: {len(cross_domain)}")

if __name__ == "__main__":
    main()
