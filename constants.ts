import { ActionItem, ClientContact, Deliverable, DiscoveryActivity, GanttTask, Industry, TeamMember, SimpleListItem, Application } from './types';

export const CLIENT_CONTACTS: ClientContact[] = [
  { name: 'Brian Craig', role: 'VP Sales & Marketing', email: 'bcraig@tablex.com', phone: '317.452.3955' },
  { name: 'Jim Skillman', role: '(TBD)', email: 'jskillman@tablex.com', phone: '—' },
  { name: 'Mark Fleck', role: '(TBD)', email: 'mfleck@tablex.com', phone: '—' },
];

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Danny Breckenridge', role: 'UX & Digital Technologist (Lead)', company: 'ClearPH', initials: 'DB' },
  { name: 'Arabella Hughes', role: 'Marketing Coordinator / Account Manager', company: 'ClearPH', initials: 'AH' },
  { name: 'Richard Hughes', role: 'Oversight', company: 'ClearPH', initials: 'RH' },
];

export const INDUSTRIES: Industry[] = [
  { id: 'workplace', name: 'Workplace' },
  { id: 'education', name: 'Education' },
  { id: 'hospitality', name: 'Hospitality' },
  { id: 'healthcare', name: 'Healthcare' },
];

export const APPLICATIONS: Application[] = [
    { id: 'app-1', name: 'Training & Classroom' },
    { id: 'app-2', name: 'Cafe & Dining' },
    { id: 'app-3', name: 'Collaborative & Meeting' },
    { id: 'app-4', name: 'Height Adjustable' },
    { id: 'app-5', name: 'Nesting & Folding' },
    { id: 'app-6', name: 'Pull Up & Occasional' },
];

export const CURRENT_STATE_POINTS: SimpleListItem[] = [
    { id: 'cs-1', text: 'Platform: WordPress + Divi + WooCommerce' },
    { id: 'cs-2', text: 'Pain Point: Feels like a "base company" not a "table company".' },
    { id: 'cs-3', text: 'Confusion: No product series logic (options too open).' },
    { id: 'cs-4', text: 'Process: Sales reps avoid quoting due to complexity.' },
];

export const TIMELINE_TASKS: GanttTask[] = [
  { 
    id: 1, 
    name: "Kickoff & Artifact Setup", 
    owner: "Arabella, Brian", 
    start: 0, 
    duration: 2, 
    color: "bg-blue-500",
    description: "Aligning teams on goals, scope, and establishing shared repositories for digital assets."
  },
  { 
    id: 2, 
    name: "Digital Asset Review", 
    owner: "Danny", 
    start: 1, 
    duration: 2, 
    color: "bg-indigo-500",
    description: "Auditing existing high-res imagery and PDFs to identify content gaps before design begins."
  },
  { 
    id: 3, 
    name: "Product Data Audit", 
    owner: "Danny, Brian", 
    start: 2, 
    duration: 3, 
    color: "bg-indigo-500",
    description: "Analyzing SKU logic and attribute complexity to ensure the configurator can handle all variations."
  },
  { 
    id: 12, 
    name: "QuoteX: Buy vs Build Audit", 
    owner: "Brian, Danny", 
    start: 3, 
    duration: 4, 
    color: "bg-orange-500",
    description: "Critical Assessment: Evaluating off-the-shelf CPQ solutions vs. building the custom QuoteX portal."
  },
  { 
    id: 4, 
    name: "Stakeholder Interviews", 
    owner: "Arabella, Sales", 
    start: 3, 
    duration: 2, 
    color: "bg-pink-500",
    description: "Gathering insights from sales/support teams to uncover recurring customer pain points."
  },
  // Week 2 Starts Index 5
  { 
    id: 5, 
    name: "Competitive Analysis", 
    owner: "Arabella", 
    start: 5, 
    duration: 2, 
    color: "bg-pink-500",
    description: "Benchmarking against competitors (e.g., OFS) to identify market opportunities and differentiation."
  },
  { 
    id: 6, 
    name: "Journey Mapping", 
    owner: "Danny, Arabella", 
    start: 6, 
    duration: 3, 
    color: "bg-purple-500",
    description: "Visualizing the dealer/architect decision path to optimize the funnel and reduce drop-offs."
  },
  { 
    id: 7, 
    name: "Sitemap Finalization", 
    owner: "Arabella, Danny", 
    start: 8, 
    duration: 2, 
    color: "bg-purple-500",
    description: "Defining the information architecture to streamline navigation and product discovery."
  },
  // Week 3 Starts Index 10
  { 
    id: 8, 
    name: "Low-Fi Wireframes", 
    owner: "Danny", 
    start: 10, 
    duration: 4, 
    color: "bg-emerald-500",
    description: "Blueprinting key page layouts to secure agreement on structure without visual distraction."
  },
  { 
    id: 9, 
    name: "Tech Requirements (TRD)", 
    owner: "Danny", 
    start: 12, 
    duration: 2, 
    color: "bg-emerald-500",
    description: "Documenting hosting, stack, and integration specs. Decision dependent on Buy vs Build Audit."
  },
  { 
    id: 10, 
    name: "Content Strategy Guide", 
    owner: "Arabella", 
    start: 12, 
    duration: 3, 
    color: "bg-teal-500",
    description: "Planning voice, tone, and copy requirements to support the new brand narrative."
  },
  { 
    id: 11, 
    name: "Final Budget & Roadmap", 
    owner: "Team", 
    start: 14, 
    duration: 1, 
    color: "bg-slate-700",
    description: "Solidifying scope and investment for the Design and Development phases."
  }
];

export const DISCOVERY_ACTIVITIES: DiscoveryActivity[] = [
  { id: 'da-1', title: "Stakeholder Interviews", desc: "Internal sales & CS reps. Identify common questions & process pain points." },
  { id: 'da-2', title: "Digital Asset Review", desc: "Audit PDFs, brochures, images. Catalog existing vs. missing assets." },
  { id: 'da-3', title: "Product Data Audit", desc: "Assess SKU logic, configurator feasibility, and map all product options." },
  { id: 'da-4', title: "Competitive Analysis", desc: "Analyze Indiana Furniture, OFS. Benchmark aspirational brands." },
  { id: 'da-5', title: "Journey Mapping", desc: "Map Dealer/Architect path from need to order. Find drop-off points." }
];

export const DELIVERABLES: Deliverable[] = [
  { id: 'del-1', name: 'Sitemap', desc: 'Visual flowchart. Hierarchy incorporating Industry → Application funnel.' },
  { id: 'del-2', name: 'Low-Fi Wireframes', desc: 'Blueprints: Homepage, Product Series Page, Single Product Page.' },
  { id: 'del-3', name: 'Technical Requirements (TRD)', desc: 'Stack (WP/Other), Hosting, CRM/QuoteX Integrations.' },
  { id: 'del-4', name: 'Content Strategy Guide', desc: 'Plan for photography, copy, and content needed for launch.' },
  { id: 'del-5', name: 'Roadmap & Budget', desc: 'Finalized timeline/budget for Phase 2 (Design) & 3 (Dev).' }
];

export const QUOTEX_ARTIFACTS: SimpleListItem[] = [
    { id: 'qa-1', text: 'Spreadsheets & Pricing Calculations' },
    { id: 'qa-2', text: 'SKU Logic Documentation' },
    { id: 'qa-3', text: 'Metrics for quoting volume/types' },
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  { id: 1, text: "Finalize revised sitemap based on Brian's funnel feedback", isCompleted: false },
  { id: 2, text: "Schedule stakeholder interviews (Sales & CS)", isCompleted: false },
  { id: 3, text: "Set up shared Google Drive for artifact collection", isCompleted: false },
  { id: 4, text: "Collect pricing spreadsheets & SKU logic from Brian", isCompleted: false },
  { id: 5, text: "Begin competitive analysis (Indiana Furniture, OFS)", isCompleted: false },
  { id: 6, text: "Begin journey mapping (Dealer & Architect personas)", isCompleted: false },
  { id: 7, text: "Establish regular meeting cadence", isCompleted: false }
];