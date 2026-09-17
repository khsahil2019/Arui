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
      name: "Employer Demand Intelligence",
      shortName: "Demand Intelligence",
      theme: "Market Demand & Intelligence",
      metricCount: 12,
      description: "Institutional evaluation of labor market forecasting, employer demand sensing, and strategic industry intelligence.",
    },
    {
      code: "D02" as DomainCode,
      name: "Employability Capability Framework",
      shortName: "Capability Framework",
      theme: "Institutional Capabilities",
      metricCount: 12,
      description: "Comprehensive institutional capability taxonomy, institutional learning outcomes, and graduate attribute articulation.",
    },
    {
      code: "D03" as DomainCode,
      name: "Industry-Aligned Curriculum",
      shortName: "Industry Curriculum",
      theme: "Curricular Relevance",
      metricCount: 12,
      description: "Structured industry advisory boards, syllabus co-creation, emerging industry skills integration, and modular course design.",
    },
    {
      code: "D04" as DomainCode,
      name: "Experiential & Practice-Based Learning",
      shortName: "Experiential Learning",
      theme: "Work-Integrated Learning",
      metricCount: 12,
      description: "Work-Integrated Learning (WIL), structured credit-bearing internships, live industry capstones, and simulated workplace labs.",
    },
    {
      code: "D05" as DomainCode,
      name: "Career Development Infrastructure",
      shortName: "Career Infrastructure",
      theme: "Career Services & Navigation",
      metricCount: 12,
      description: "Institutional career services, 4-year career pathways, personalized navigation, mentoring systems, and employer clinics.",
    },
    {
      code: "D06" as DomainCode,
      name: "Professional & Human Capabilities",
      shortName: "Professional Capabilities",
      theme: "Workplace Capabilities",
      metricCount: 12,
      description: "Leadership, critical enquiry, teamwork, ethical reasoning, cross-cultural communication, and executive presence.",
    },
    {
      code: "D07" as DomainCode,
      name: "Digital & AI-Era Work Readiness",
      shortName: "Digital Work Readiness",
      theme: "Digital & AI Proficiency",
      metricCount: 12,
      description: "Digital fluency, workflow automation, modern tech toolkits, AI tools for domain problems, and data literacy.",
    },
    {
      code: "D08" as DomainCode,
      name: "Portfolio & Capability Signalling",
      shortName: "Capability Signalling",
      theme: "Authentic Credentials & Portfolio",
      metricCount: 12,
      description: "Evidence-backed portfolios, verified digital credentials, authentic project artifacts, and employer-facing capability profiles.",
    },
    {
      code: "D09" as DomainCode,
      name: "Employer Engagement & Recruitment Ecosystem",
      shortName: "Employer Ecosystem",
      theme: "Corporate Ecosystem & Placement",
      metricCount: 12,
      description: "Corporate recruitment networks, on-campus talent days, high-trust employer partnerships, and hiring conversion.",
    },
    {
      code: "D10" as DomainCode,
      name: "Employment Outcome Quality",
      shortName: "Outcome Quality",
      theme: "Market Performance & ROI",
      metricCount: 12,
      description: "6-month verified graduate outcomes, compensation benchmarking, role quality, and employer retention rates.",
    },
    {
      code: "D11" as DomainCode,
      name: "Career Adaptability, Lifelong Readiness & Employability Intelligence",
      shortName: "Career Adaptability",
      theme: "Lifelong Mobility & Intelligence",
      metricCount: 12,
      description: "Longitudinal alumni career trajectories, lifelong reskilling access, alumni career network, and employability research.",
    },
  ],
};

