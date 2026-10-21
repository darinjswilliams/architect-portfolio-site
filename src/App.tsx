import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ExternalLink, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  GitBranch, 
  Menu, 
  X,
  Sun,
  Moon,
  Eye,
} from 'lucide-react';

import { 
  ARCHITECTURE_DOCS, 
  ALL_PROJECTS, 
  ALL_CATEGORIES, 
  SYSTEM_DIAGRAMS,
  type ArchitectureDoc,
} from './data/portfolioData';

import { ArchitectureDiagram, type DiagramItem } from './components/ArchitectureDiagram';

// Handle profanity filtering for contact form submissions (default import)
import { Filter } from 'bad-words';

// Rate Limiting and Spam Prevention
import { downloadResumeFile } from './utils/resumeDownload';

// Initialize the profanity filter once outside the component lifecycle
const contentFilter = new Filter();

interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: "kindra",
    title: "Kindra: Healthcare AI Multi-Agent Platform",
    summary: "Reasoning-based automated healthcare clinical workflow system orchestrating specialized agent swarms with strict HIPAA compliance guardrails.",
    tags: ["Multi-Agent AI", "FastAPI", "React", "Governance"],
    liveUrl: "https://autonami.ai"
  },
  {
    id: "digital-twin",
    title: "Cloud Digital Twin Application",
    summary: "Real-time digital twin platform deployed on AWS serverless infrastructure with dynamic event streams and state modeling.",
    tags: ["AWS", "React", "TypeScript", "IoT"],
    githubUrl: "https://github.com/darinjswilliams"
  },
  {
    id: "decision-engine",
    title: "Autonomous Decisioning & Claims System",
    summary: "Real-time claims validation dashboard featuring LLM policy verification and low-latency inference routing.",
    tags: ["Azure", "Python", "Vite", "TypeScript"],
    liveUrl: "https://insurance-agent-a8gsjomd7dcmvsvjijhz73.streamlit.app"
  }
];

function GithubIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}


export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [downloadNotice, setDownloadNotice] = useState<string>('');
  const [formStatus, setFormStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Default to 'All Projects' and 'Architecture' so initial landing displays only Reference Architecture docs
  const [selectedProject, setSelectedProject] = useState<string>('All Projects');
  // Initial landing tab is Reference Architecture (shows 3 Reference Architecture documents)
  const [selectedCategory, setSelectedCategory] = useState<string>('Reference Architecture'); 

  const [activeModalDoc, setActiveModalDoc] = useState<ArchitectureDoc | null>(null);
  const [activeDiagram, setActiveDiagram] = useState<DiagramItem | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [copiedDiagramId, setCopiedDiagramId] = useState<string | null>(null);

  const handleCopyMarkdown = (doc: ArchitectureDoc) => {
    navigator.clipboard.writeText(doc.content);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2500);
  };

  const handleCopyDiagramLink = (diagram: DiagramItem) => {
    const fullUrl = `${window.location.origin}${diagram.svgPath}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedDiagramId(diagram.id);
    setTimeout(() => setCopiedDiagramId(null), 2500);
  };

  // Exact project matching
  const isProjectMatch = (itemProjectName: string) => {
    if (selectedProject === 'All Projects') return true;
    return itemProjectName.trim().toLowerCase() === selectedProject.trim().toLowerCase();
  };

  // 1. Documents Filtering:
  // - Hidden if "Diagrams" is selected
  // - Otherwise, filter by selected Project and selected Category
  const filteredDocs = selectedCategory === 'Diagrams'
    ? []
    : ARCHITECTURE_DOCS.filter((doc) => {
        const matchesProj = isProjectMatch(doc.projectName);
        const matchesCat = selectedCategory === 'All' || doc.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesProj && matchesCat;
      });

  // 2. Diagrams Filtering:
  // - Visible when category is 'Diagrams' or 'All'
  // - Filtered strictly by selected Project
  const showDiagrams = selectedCategory === 'Diagrams' || selectedCategory === 'All';

  const filteredDiagrams = showDiagrams
    ? SYSTEM_DIAGRAMS.filter((diagram) => isProjectMatch(diagram.projectName))
    : [];

  const hasAnyResults = filteredDocs.length > 0 || filteredDiagrams.length > 0;

  const triggerResumeDownload = () => {
    downloadResumeFile(
      (waitMinutes) => {
        setDownloadNotice(`Download limit reached. Please retry in ${waitMinutes} minute(s).`);
        setTimeout(() => setDownloadNotice(''), 5000);
      },
      (errorMsg) => {
        setDownloadNotice(errorMsg);
        setTimeout(() => setDownloadNotice(''), 5000);
      }
    );
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const message = (formData.get("message") as string) || "";

    // Content Moderation Guardrail
    if (contentFilter.isProfane(name) || contentFilter.isProfane(message)) {
      setFormStatus("Your message could not be sent due to inappropriate language.");
      setTimeout(() => setFormStatus(""), 5000);
      return;
    }

    setIsSubmitting(true);

    formData.append("access_key", "");
    formData.append("subject", "New Inquiry via Portfolio: Darin Williams");
    formData.append("from_name", "Portfolio Contact Form");
    formData.append("replyto", email);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormStatus("Message sent successfully. Darin will follow up promptly.");
        form.reset();
      } else {
        setFormStatus(result.message || "Submission failed. Please connect via LinkedIn.");
      }
    } catch {
      setFormStatus("Network error. Please reach out directly on LinkedIn.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormStatus(""), 6000);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        
        {/* Sticky Header Navigation */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="#hero" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm tracking-wider">
                DW
              </span>
              <span className="font-bold text-lg tracking-tight">Darin Williams</span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About</a>
              <a href="#resume" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Resume</a>
              <a href="#architecture" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Architecture Library</a>
              <a href="#projects" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Featured Projects</a>
              <a href="#connect" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Connect</a>
            </nav>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-sm font-medium bg-white dark:bg-slate-900">
              <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#resume" onClick={() => setMobileMenuOpen(false)}>Resume</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>Architecture Library</a>
              <a href="#projects" onClick={() => setMobileMenuOpen(false)}>Featured Projects</a>
              <a href="#connect" onClick={() => setMobileMenuOpen(false)}>Connect</a>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              Available for Strategic Architect Roles & Advisory
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Agentic AI  <br className="hidden sm:inline" />
              <span className="text-teal-600 dark:text-teal-400">Business Solution Architect</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              I architect full-stack distributed systems, multi-agent AI ecosystems, and scalable AWS/Azure cloud infrastructure. My work bridges enterprise data governance with production-grade intelligence.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a 
                href="#architecture" 
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center gap-2 shadow-sm"
              >
                View Architecture Work <ChevronRight size={18} />
              </a>
              <button 
                type="button"
                onClick={triggerResumeDownload}
                className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                Download Resume <Download size={18} />
              </button>
            </div>
            {downloadNotice && (
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
                {downloadNotice}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 flex justify-center">
            <div className="relative w-64 sm:w-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900 aspect-[4/5]">
              <img 
                src="/headshot2.jpg" 
                alt="Darin Williams" 
                className="w-full h-full object-cover object-top block"
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">About Me</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                As an AI Architect holding a Master of Science in Software Engineering, I specialize in building mission-critical platforms from ideation through scaled operations. My core focus lies in multi-agent orchestration, deterministic RAG retrieval, and policy-driven guardrails for enterprise automation. I partner with healthcare and regulated industries to deliver performant full-stack solutions backed by disciplined FinOps principles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Layers className="text-teal-600" size={24} />, title: "Full-Stack & Cloud", desc: "React, Vite, TypeScript, Python FastAPI, AWS & Azure distributed architectures." },
                { icon: <GitBranch className="text-teal-600" size={24} />, title: "Multi-Agent AI & RAG", desc: "Autonomous agent teams, deterministic retrieval, vector stores, and prompt orchestration." },
                { icon: <ShieldCheck className="text-teal-600" size={24} />, title: "Governance & Safety", desc: "HIPAA compliance, automated red-teaming, model auditability, and guardrails." },
                { icon: <DollarSign className="text-teal-600" size={24} />, title: "FinOps & Optimization", desc: "Workload right-sizing, compute tier scheduling, and cost allocation models." }
              ].map((skill, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  {skill.icon}
                  <h3 className="font-bold text-base">{skill.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-normal">{skill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section id="resume" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Executive Resume</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Review credentials, certifications, and architectural history.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto shrink-0">
              <button 
                type="button"
                onClick={triggerResumeDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Download size={16} /> Download PDF
              </button>
              {downloadNotice && (
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2 text-left sm:text-right max-w-xs">
                  {downloadNotice}
                </p>
              )}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Darin Williams</h3>
                <p className="text-teal-600 dark:text-teal-400 font-medium">Senior Software & AI Architect</p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 md:text-right">
                <p>Master of Science in Software Engineering</p>
                <p>9 Active Professional Certifications</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Architectural Experience</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Architected and deployed multi-agent clinical workflow solutions under HIPAA constraints for healthcare automation.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Engineered distributed cloud microservices across AWS and Azure, reducing annual infrastructure overhead by over 30%.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-teal-600 mt-1 flex-shrink-0" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Established company-wide AI Governance Frameworks, standardizing ADRs, red-teaming validation, and tenant security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture Library */}
        <section id="architecture" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Architecture Library</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  Reference implementations, governance policies, ADRs, blueprints, and optimization plans.
                </p>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Project Selector (Always Accessible) */}
                <select 
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
                >
                  {ALL_PROJECTS.map((proj) => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                </select>

                {/* Category Pill Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        selectedCategory === category
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Unified Artifacts Container */}
            <div className="space-y-8">
              {/* Architecture Diagrams Block */}
              {filteredDiagrams.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      System Architecture Blueprints ({filteredDiagrams.length})
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">{selectedProject}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDiagrams.map((diagram) => (
                      <ArchitectureDiagram 
                        key={diagram.id} 
                        {...diagram} 
                        onSelect={setActiveDiagram}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Documents & ADRs Block */}
              {filteredDocs.length > 0 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      Technical Documents & Specifications ({filteredDocs.length})
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">{selectedProject}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                      <div 
                        key={doc.id}
                        className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between hover:shadow-md transition-shadow gap-6"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                              {doc.docType}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {doc.projectName}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-lg leading-snug">{doc.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-normal">{doc.description}</p>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {doc.tags.map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button 
                            type="button"
                            onClick={() => setActiveModalDoc(doc)}
                            className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-500/50 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                          >
                            <Eye size={15} className="text-teal-600 dark:text-teal-400" /> View Architecture Specification
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!hasAnyResults && (
                <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No artifacts or blueprints found matching the selected filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section id="projects" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Highlighted platforms and architectural solutions in production.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map((project) => (
              <div 
                key={project.id} 
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-lg leading-snug">{project.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-normal">{project.summary}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      Live Platform <ExternalLink size={14} />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      Source Code <GithubIcon size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connect & Contact */}
        <section id="connect" className="py-20 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">Connect</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you need technical advisory on enterprise AI systems, cloud migrations on AWS/Azure, or architecture evaluations, feel free to reach out directly.
              </p>

              <div className="space-y-3">
                <a 
                  href="https://www.linkedin.com/in/darinjeswilliams" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors"
                >
                  <LinkedinIcon className="text-teal-600" size={20} />
                  <span className="text-sm font-semibold">LinkedIn Profile</span>
                </a>
                <a 
                  href="https://github.com/darinjswilliams" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors"
                >
                  <GithubIcon className="text-teal-600" size={20} />
                  <span className="text-sm font-semibold">GitHub Organization & Repos</span>
                </a>
                <a 
                  href="https://autonami.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-colors"
                >
                  <ExternalLink className="text-teal-600" size={20} />
                  <span className="text-sm font-semibold">Autonami AI Platform</span>
                </a>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {/* Anti-spam honeypot */}
                <input 
                  type="checkbox" 
                  name="botcheck" 
                  className="hidden" 
                  style={{ display: 'none' }} 
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required 
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required 
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Message</label>
                  <textarea 
                    rows={4} 
                    name="message"
                    required 
                    placeholder="Discuss an architecture project, advisory role, or consultation..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/60 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Transmitting..." : "Send Message"}
                </button>
                {formStatus && (
                  <p className="text-center text-xs text-teal-600 dark:text-teal-400 font-semibold mt-2">
                    {formStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Darin Williams. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="https://www.linkedin.com/in/darinjeswilliams" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">LinkedIn</a>
              <a href="https://github.com/darinjswilliams" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">GitHub</a>
              <a href="https://autonami.ai" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600">Autonami.ai</a>
              <a href="#hero" className="hover:text-teal-600">Back to Top ↑</a>
            </div>
          </div>
        </footer>

        {/* Markdown Document Reader Modal */}
        {activeModalDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{activeModalDoc.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeModalDoc.projectName} • {activeModalDoc.tags.join(" • ")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => handleCopyMarkdown(activeModalDoc)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedDocId === activeModalDoc.id ? (
                      <>
                        <CheckCircle2 size={14} className="text-teal-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Layers size={14} /> Copy Spec
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveModalDoc(null)} 
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-950">
                <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-teal-600 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-table:border-collapse prose-th:border-b prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-td:border-b prose-td:border-slate-200 dark:prose-td:border-slate-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activeModalDoc.content}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          </div>
        )}

        {/* Diagram Blueprint Modal */}
        {activeDiagram && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">{activeDiagram.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeDiagram.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => handleCopyDiagramLink(activeDiagram)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedDiagramId === activeDiagram.id ? (
                      <>
                        <CheckCircle2 size={14} className="text-teal-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Layers size={14} /> Copy Blueprint Link
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveDiagram(null)} 
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <img 
                  src={activeDiagram.svgPath} 
                  alt={activeDiagram.title} 
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}