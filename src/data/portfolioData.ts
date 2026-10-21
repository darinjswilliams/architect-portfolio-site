export interface ArchitectureDoc {
  id: string;
  title: string;
  projectName: string;
  category: string;
  docType: string;
  description: string;
  tags: string[];
  filename: string;
  content: string;
}

export interface SystemDiagram {
  id: string;
  title: string;
  subtitle: string;
  svgPath: string;
  projectName: string;
}

// 1. Projects dropdown items
export const ALL_PROJECTS = [
  'All Projects',
  'Dual Lens',
  'Financial Analyst',
  'Under Writing',
] as const;

export type ProjectName = (typeof ALL_PROJECTS)[number];

// 2. Tab list in exact requested order (Diagrams is the last tab)
export const ALL_CATEGORIES = [
  'All',
  'Governance',
  'Reference Architecture',
  'Architecture Decision Records',
  'Cost Optimization',
  'Migration Roadmap',
  'Diagrams',
] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

// System Diagrams mapped to the 3 exact project names
export const SYSTEM_DIAGRAMS: SystemDiagram[] = [
  {
    id: 'dual-lens',
    title: 'Dual-Lens Analytics Architecture',
    subtitle: 'Real-time telemetry, model drift tracking, and dual-layer evaluation pipeline',
    svgPath: '/diagrams/dual_lens_analytics_architecture.svg',
    projectName: 'Dual Lens',
  },
  {
    id: 'financial-research',
    title: 'Financial Research Agent Architecture',
    subtitle: 'Multi-agent orchestration, RAG retrieval engine, and tool routing layers',
    svgPath: '/diagrams/financial_research_agent_architecture.svg',
    projectName: 'Financial Analyst',
  },
  {
    id: 'mortgage-underwriting',
    title: 'Mortgage Underwriting AI Architecture',
    subtitle: 'Policy evaluation, automated validation agents, and decision logging',
    svgPath: '/diagrams/mortgage_underwriting_ai_architecture.svg',
    projectName: 'Under Writing',
  },
];

// Import all markdown files under content/docs/ across Vite path variations
const rawModules = import.meta.glob(
  ['/content/docs/**/*.md', '../content/docs/**/*.md', '../../content/docs/**/*.md', './content/docs/**/*.md'],
  { eager: true, query: '?raw', import: 'default' }
);

function parseDocs(): ArchitectureDoc[] {
  const docs: ArchitectureDoc[] = [];

  for (const path in rawModules) {
    const fullContent = (rawModules[path] as string) || '';
    const pathParts = path.split('/');
    const fileName = pathParts[pathParts.length - 1] || 'document.md';
    const lowerPath = path.toLowerCase();
    const lowerFile = fileName.toLowerCase();

    // Map folder to exact project
    let projTitle: ProjectName = 'Dual Lens';
    if (lowerPath.includes('financial-analyst')) {
      projTitle = 'Financial Analyst';
    } else if (lowerPath.includes('under-writing')) {
      projTitle = 'Under Writing';
    } else {
      projTitle = 'Dual Lens';
    }

    // Map filename prefix to exact requested Category
    let category: Category = 'Reference Architecture';
    let docType = 'Reference Architecture';

    if (lowerFile.includes('governance')) {
      category = 'Governance';
      docType = 'Governance Framework';
    } else if (lowerFile.includes('reference architecture')) {
      category = 'Reference Architecture';
      docType = 'Reference Architecture';
    } else if (lowerFile.includes('decision records') || lowerFile.includes('adr')) {
      category = 'Architecture Decision Records';
      docType = 'ADR Record';
    } else if (lowerFile.includes('cost optimization')) {
      category = 'Cost Optimization';
      docType = 'Cost Optimization Plan';
    } else if (lowerFile.includes('migration roadmap')) {
      category = 'Migration Roadmap';
      docType = 'Migration Roadmap';
    }

    // Title from first Markdown # Header or clean filename
    const h1Match = fullContent.match(/^#\s+(.*)/m);
    const title = h1Match ? h1Match[1].trim() : fileName.replace('.md', '');

    docs.push({
      id: path,
      title,
      projectName: projTitle,
      category,
      docType,
      description: `Technical architectural blueprint and specification for ${projTitle}.`,
      tags: [projTitle, category, 'Enterprise'],
      filename: fileName,
      content: fullContent,
    });
  }

  // Fallback seed covering all 15 documents matching content/docs/ if Vite path is resolving elsewhere
  if (docs.length === 0) {
    const projects: ProjectName[] = ['Dual Lens', 'Financial Analyst', 'Under Writing'];
    const projectSuffixes: Record<string, string> = {
      'Dual Lens': 'DualLens Analytics',
      'Financial Analyst': 'Autonomous Financial Research Analyst',
      'Under Writing': 'Mortgage Underwriting',
    };

    const categories: Array<{ cat: Category; type: string; prefix: string }> = [
      { cat: 'Governance', type: 'Governance Framework', prefix: 'AI Governance Framework' },
      { cat: 'Reference Architecture', type: 'Reference Architecture', prefix: 'AI Reference Architecture' },
      { cat: 'Architecture Decision Records', type: 'ADR Record', prefix: 'Architecture Decision Records' },
      { cat: 'Cost Optimization', type: 'Cost Optimization Plan', prefix: 'Cost Optimization Plan' },
      { cat: 'Migration Roadmap', type: 'Migration Roadmap', prefix: 'Migration Roadmap' },
    ];

    projects.forEach((proj) => {
      const suffix = projectSuffixes[proj];
      categories.forEach(({ cat, type, prefix }) => {
        docs.push({
          id: `seed-${proj}-${cat}`,
          title: `${prefix} ${suffix}`,
          projectName: proj,
          category: cat,
          docType: type,
          description: `${type} for ${proj}.`,
          tags: [proj, cat, 'Production'],
          filename: `${prefix} ${suffix}.md`,
          content: `# ${prefix} ${suffix}\n\n## Overview\nProduction enterprise specification for ${proj}.\n\n### Architectural Scope\nFull end-to-end multi-agent execution pipeline.`,
        });
      });
    });
  }

  return docs;
}

export const ARCHITECTURE_DOCS: ArchitectureDoc[] = parseDocs();