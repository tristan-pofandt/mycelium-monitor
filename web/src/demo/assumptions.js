// Every guess the demo makes about the real company's systems and structure. Each one shows in the demo as a dashed
// "Assumed" tag wherever it is used, and all of them are listed on the Your systems page, where reviewers correct them.
// Answers go to the demo server (demo/server.py), which shares them with every reviewer and logs them in FEEDBACK.md.

export const ASSUMPTIONS = [
  // Systems
  { id: "sso", area: "Systems", topic: "Sign-in and staff directory", assumed: "Microsoft Entra ID (Azure AD)", why: "Most large companies on Microsoft 365 use it for sign-in and the staff directory.", question: "Which system handles staff sign-in and the directory (managers, departments)?" },
  { id: "email", area: "Systems", topic: "Email and calendars", assumed: "Microsoft 365 (Outlook)", why: "Common for multinationals.", question: "Which email and calendar system do staff use?" },
  { id: "chat", area: "Systems", topic: "Chat and meetings", assumed: "Microsoft Teams", why: "Usually comes with Microsoft 365.", question: "What do teams use for chat and online meetings?" },
  { id: "devices", area: "Systems", topic: "Device management", assumed: "Microsoft Intune and Group Policy", why: "Screen-lock and encryption settings are usually set here.", question: "How are company computers and phones managed (screen lock, encryption, updates)?" },
  { id: "erp", area: "Systems", topic: "ERP", assumed: "SAP S/4HANA", why: "Common in large German-headquartered manufacturers.", question: "Which ERP runs orders, stock and finance?" },
  { id: "maintenance", area: "Systems", topic: "Maintenance work orders", assumed: "SAP Plant Maintenance (PM)", why: "Usually part of the ERP.", question: "Where are maintenance work orders raised and tracked?" },
  { id: "quality", area: "Systems", topic: "Quality issues (NCRs)", assumed: "SAP Quality Management (QM)", why: "Usually part of the ERP.", question: "Where are non-conformances and quality issues recorded?" },
  { id: "plantdata", area: "Systems", topic: "Production data (output, OEE, downtime)", assumed: "A plant historian or MES, such as AVEVA PI", why: "OEE and downtime usually come from the machines, through a historian or MES.", question: "Where do output, OEE and downtime figures come from? Is there an MES or historian?" },
  { id: "hr", area: "Systems", topic: "HR and payroll", assumed: "SAP SuccessFactors", why: "Often paired with SAP ERP.", question: "Which HR and payroll system holds employee records?" },
  { id: "rostering", area: "Systems", topic: "Rostering and time and attendance", assumed: "UKG (Kronos)", why: "Common for large shift-based workforces. Tanda and Deputy are alternatives.", question: "Which system builds rosters and records clock-ins?" },
  { id: "tasks", area: "Systems", topic: "Tasks and projects", assumed: "Microsoft Planner", why: "Comes with Microsoft 365.", question: "Where do managers assign and track tasks (Planner, Trello, Jira, spreadsheets, email)?" },
  { id: "itsm", area: "Systems", topic: "IT tickets", assumed: "ServiceNow", why: "Common for group IT functions.", question: "Where do staff log IT and facilities tickets?" },
  { id: "whs", area: "Systems", topic: "Safety incidents and hazards", assumed: "A dedicated WHS system, such as Donesafe", why: "Many manufacturers use a separate safety system.", question: "Where are safety incidents, near misses and hazards reported?" },
  { id: "access_control", area: "Physical security", topic: "Door access and cards", assumed: "Gallagher Command Centre", why: "The most common access control system in Australia. Salto is another option.", question: "Which access control system runs the doors and staff cards? Is it the same at every site?" },
  { id: "cctv", area: "Physical security", topic: "Cameras (CCTV)", assumed: "Milestone XProtect", why: "A widely used video management system.", question: "Which camera or video management system is used, and who looks after it?" },
  { id: "alarms", area: "Physical security", topic: "Intruder alarms", assumed: "Inner Range Integriti", why: "Common in Australian commercial sites.", question: "Which alarm system protects the sites, and who monitors it?" },
  { id: "visitors", area: "Physical security", topic: "Visitor sign-in", assumed: "SwipedOn", why: "Common tablet-based sign-in. Many sites still use a paper book.", question: "How do visitors and contractors sign in and get inducted?" },
  { id: "guards", area: "Physical security", topic: "Security guards and patrols", assumed: "A contracted guard service with patrol tour logs", why: "Typical for factories.", question: "Are there security guards or patrols, and how are their checks recorded?" },
  { id: "inspections", area: "Physical security", topic: "Security and safety inspections", assumed: "Paper checklists or spreadsheets", why: "Often not in a system yet.", question: "How are checks such as \"comms room locked\" recorded today?" },
  { id: "cloud", area: "IT", topic: "Where a pilot could run", assumed: "Your own Azure tenant", why: "Keeps data inside your environment.", question: "If a pilot ever went ahead, where would IT want it hosted?" },
  { id: "approval_it", area: "IT", topic: "Approving new software", assumed: "A security review by Group IT before any trial", why: "Usual for large groups.", question: "What would IT need to see before trialling a tool like this?" },
  // Structure
  { id: "s_sites", area: "Structure", topic: "Sites", assumed: "4 sites (Acacia Ridge, Ipswich, Toowoomba, Townsville) plus a Brisbane office", why: "Made up for the demo.", question: "How many sites are there, and what does each one do?" },
  { id: "s_entities", area: "Structure", topic: "Legal entities", assumed: "3 entities under one regional group", why: "Made up for the demo.", question: "Do the sites sit under different legal entities or divisions?" },
  { id: "s_staff", area: "Structure", topic: "Number of staff", assumed: "About 600 across Queensland", why: "Made up for the demo.", question: "Roughly how many staff, and how many per site?" },
  { id: "s_levels", area: "Structure", topic: "Management levels", assumed: "GM → Site Manager → Department Manager → Shift Supervisor → Employee", why: "A typical plant hierarchy.", question: "What are the management levels between you and the shop floor?" },
  { id: "s_shifts", area: "Structure", topic: "Shift pattern", assumed: "Three 8-hour shifts at the largest site, two elsewhere", why: "A typical pattern.", question: "What shift patterns run at each site?" },
  { id: "s_leave", area: "Structure", topic: "Who approves leave", assumed: "Shift Supervisor, then the Site Manager for more than 5 days", why: "A typical rule.", question: "Who approves leave and roster changes, and when does it go higher?" },
  { id: "s_events", area: "Structure", topic: "Who approves shutdowns and audits", assumed: "GM Operations", why: "Large, costly events usually go to the top of operations.", question: "Who signs off planned shutdowns, audits and long training sessions?" },
  { id: "s_it", area: "Structure", topic: "IT reporting line", assumed: "IT reports to Group IT, not to Operations", why: "Common in multinationals.", question: "Who does the local IT team report to?" },
  { id: "s_security", area: "Structure", topic: "Security staffing", assumed: "A Security Coordinator in the Brisbane office, contracted guards at each site", why: "Made up for the demo.", question: "Who is responsible for physical security at each site?" },
  { id: "s_kpis", area: "Structure", topic: "What you track per site", assumed: "OEE, downtime, safety incidents, overdue maintenance, quality issues, on-time delivery, roster coverage", why: "Common plant KPIs.", question: "Which numbers do you look at first for each site? Anything missing here?" },
];

export const assumption = (id) => ASSUMPTIONS.find((a) => a.id === id);
// The order reviewers answer in: the systems first (what everything else hangs on), then IT's two questions, then the rest.
export const AREAS = ["Systems", "IT", "Physical security", "Structure"];
export const AREA_NOTES = {
  Systems: "The tools your sites already run. Everything in Mycelium would read from these.",
  IT: "How a trial would be hosted and approved.",
  "Physical security": "Doors, cameras, alarms, visitors and guards.",
  Structure: "How the sites and the management levels are organised.",
};
