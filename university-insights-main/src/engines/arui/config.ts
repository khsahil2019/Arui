import type { DomainCode } from "@/lib/catalogue";

export interface AruiDomainDefinition {
  code: DomainCode;
  name: string;
  shortName: string;
  theme: string;
  metricCount: number;
  description: string;
}

export const ARUI_CONFIG = {
  code: "arui" as const,
  name: "AI-Resilient University Index",
  shortTitle: "ARUI",
  version: "v4.0",
  tagline: "Institutional Benchmark for AI Resilience, Governance & Transformation",
  domainsLabel: "11 Domains · 143 Metrics",
  brandColor: "#0F172A", // Deep Navy
  accentColor: "#0D9488", // Teal
  domains: [
    {
      code: "D01" as DomainCode,
      name: "Institutional Strategy & AI Direction",
      shortName: "Strategy & AI Direction",
      theme: "Governance & Leadership",
      metricCount: 13,
      description: "Executive vision, senior leadership mandate, AI Advisory Council, and strategic roadmap.",
    },
    {
      code: "D02" as DomainCode,
      name: "AI Governance, Ethics & Policy Framework",
      shortName: "Governance & Ethics",
      theme: "Policy & Compliance",
      metricCount: 13,
      description: "Responsible AI guidelines, data privacy, IP safeguards, and risk management.",
    },
    {
      code: "D03" as DomainCode,
      name: "Academic Integrity & Assessment Adaptation",
      shortName: "Assessment Adaptation",
      theme: "Evaluation Protocols",
      metricCount: 13,
      description: "Authentic viva, project demonstration, and invigilation redesign against automated cheating.",
    },
    {
      code: "D04" as DomainCode,
      name: "Teaching, Learning & Curriculum Resilience",
      shortName: "Curriculum Resilience",
      theme: "Pedagogy",
      metricCount: 13,
      description: "Coursework integration of generative AI tools across all faculties.",
    },
    {
      code: "D05" as DomainCode,
      name: "Faculty AI Capability & Workforce Readiness",
      shortName: "Faculty AI Readiness",
      theme: "Human Capability",
      metricCount: 13,
      description: "Structured pedagogical training, AI innovation grants, and faculty literacy.",
    },
    {
      code: "D06" as DomainCode,
      name: "Student Agency, AI Literacy & Safe Access",
      shortName: "Student AI Literacy",
      theme: "Student Experience",
      metricCount: 13,
      description: "Universal student access to enterprise LLMs and student AI ethics codes.",
    },
    {
      code: "D07" as DomainCode,
      name: "Research Integrity, AI Augmentation & Discovery",
      shortName: "Research Integrity",
      theme: "Research & Innovation",
      metricCount: 13,
      description: "AI-augmented laboratory tools, data provenance, and grant proposal integrity.",
    },
    {
      code: "D08" as DomainCode,
      name: "Digital Infrastructure, High-Speed Compute & Security",
      shortName: "Compute & Infrastructure",
      theme: "Digital Infrastructure",
      metricCount: 13,
      description: "Campus GPU clusters, cloud AI gateways, and cyber defense against automated adversarial threats.",
    },
    {
      code: "D09" as DomainCode,
      name: "Operational & Administrative AI Integration",
      shortName: "Administrative AI",
      theme: "Operations",
      metricCount: 13,
      description: "Automated student advising chatbots, admissions triage, and administrative automation.",
    },
    {
      code: "D10" as DomainCode,
      name: "Community Engagement, Ethics & Societal Impact",
      shortName: "Community & Societal Impact",
      theme: "Public Impact",
      metricCount: 13,
      description: "Public interest AI initiatives and regional workforce transition workshops.",
    },
    {
      code: "D11" as DomainCode,
      name: "Strategic Adaptability & Future-Proofing",
      shortName: "Strategic Adaptability",
      theme: "Horizon Planning",
      metricCount: 13,
      description: "Horizon scanning mechanisms, agile degree revision protocols, and continuous AI benchmarking.",
    },
  ],
};
