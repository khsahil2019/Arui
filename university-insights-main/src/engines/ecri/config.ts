import type { DomainCode } from "@/lib/catalogue";

export interface EcriDimensionDefinition {
  code: DomainCode;
  name: string;
  shortName: string;
  theme: string;
  metricCount: number;
  description: string;
}

export const ECRI_CONFIG = {
  code: "ecri" as const,
  name: "Employability & Career Readiness Index",
  shortTitle: "ECRI",
  version: "ecri-v6.0",
  tagline: "Comprehensive Institutional Benchmark for Graduate Employability, Industry Alignment & Career Readiness",
  domainsLabel: "11 Dimensions · 132 Metrics",
  brandColor: "#0F766E", // Emerald/Teal 700
  accentColor: "#059669", // Emerald 600
  dimensions: [
    {
      code: "D01" as DomainCode,
      name: "Institutional Strategy, Employability Governance & Resourcing",
      shortName: "Employability Strategy",
      theme: "Governance & Leadership",
      metricCount: 12,
      description: "Board-level mandate, dedicated employability budget, and leadership accountability.",
    },
    {
      code: "D02" as DomainCode,
      name: "Industry Ecosystem, Partnerships & Employer Integration",
      shortName: "Industry Partnerships",
      theme: "Corporate Ecosystem",
      metricCount: 12,
      description: "Tier-1 corporate advisory councils, co-branded labs, and structured employer roundtables.",
    },
    {
      code: "D03" as DomainCode,
      name: "Curriculum Co-Design, Skills Forecasting & Modernization",
      shortName: "Curriculum Co-Design",
      theme: "Curricular Relevance",
      metricCount: 12,
      description: "Annual employer syllabus reviews, emerging tech/AI literacy, and practical lab weighting.",
    },
    {
      code: "D04" as DomainCode,
      name: "Experiential Learning, Internships & Work-Integrated Learning (WIL)",
      shortName: "WIL & Internships",
      theme: "Applied Learning",
      metricCount: 12,
      description: "Mandatory credit-bearing internships (>12 weeks), live capstones, and employer evaluations.",
    },
    {
      code: "D05" as DomainCode,
      name: "Career Services, Guidance, Mentorship & Student Agency",
      shortName: "Career Services & Navigation",
      theme: "Student Support",
      metricCount: 12,
      description: "4-year career navigation, 1-on-1 counseling, ATS resume clinics, and alumni mentorship.",
    },
    {
      code: "D06" as DomainCode,
      name: "Applied Competencies, Digital Proficiency & Transversal Skills",
      shortName: "Transversal & Digital Skills",
      theme: "Workplace Capabilities",
      metricCount: 12,
      description: "Critical thinking, domain digital software mastery, quantitative reasoning, and communication.",
    },
    {
      code: "D07" as DomainCode,
      name: "Assessment Integrity, Authentic Evaluation & Industry Certification",
      shortName: "Authentic Evaluation",
      theme: "Credibility",
      metricCount: 12,
      description: "Real-world performance evaluations, viva voce, simulation exams, and micro-credentials.",
    },
    {
      code: "D08" as DomainCode,
      name: "Entrepreneurship, Venture Creation & Innovation Ecosystem",
      shortName: "Venture Creation & Startups",
      theme: "Enterprise",
      metricCount: 12,
      description: "Campus incubator (TBI), seed funding access, startup mentoring, and academic IP support.",
    },
    {
      code: "D09" as DomainCode,
      name: "Faculty Industry Currency, Professional Practice & Staff Development",
      shortName: "Faculty Industry Currency",
      theme: "Faculty Development",
      metricCount: 12,
      description: "Faculty industry sabbaticals, corporate consulting experience, and practitioner guest lecturers.",
    },
    {
      code: "D10" as DomainCode,
      name: "Graduate Employment Outcomes, Quality of Placement & ROI",
      shortName: "Outcomes & ROI",
      theme: "Market Performance",
      metricCount: 12,
      description: "Verified 6-month placement rates, median salary benchmarks, and employer satisfaction surveys.",
    },
    {
      code: "D11" as DomainCode,
      name: "Lifelong Career Mobility, Alumni Engagement & Continuous Upskilling",
      shortName: "Alumni Mobility & Upskilling",
      theme: "Lifelong Success",
      metricCount: 12,
      description: "Longitudinal 3-to-5 year career tracking, executive upskilling discounts, and alumni networks.",
    },
  ],
};
