import { AcademicProject, StudentProfile, ActivityLog } from '../types';

export const INITIAL_DEMO_PROJECT: AcademicProject = {
  id: 'demo-finance-101',
  title: 'Financial Analysis Assignment',
  course: 'Financial Engineering',
  deadline: '2026-09-14',
  rawPrompt: 'Analyze Apple Inc. (AAPL) vs. Microsoft (MSFT) 3-year financial performance using liquidity, solvency, profitability, and asset efficiency ratios. Provide an analytical interpretation of the trends and derive strategic executive conclusions.',
  instructions: 'Ensure calculations are grounded in official 10-K filings. The core grade weighting focuses on the rationale for why margin shifts occurred and strategic implications, rather than pure arithmetic.',
  createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  status: 'in_progress',
  selectedMode: 'BALANCED',
  totalXpEarned: 70,
  currentMissionIndex: 1, // Mission 2 (0-indexed 1) is active: Collect Financial Data / Calculate Ratios
  analysis: {
    projectTitle: 'Financial Analysis Assignment',
    whatToAccomplish: 'Conduct a multi-year comparative ratio analysis between two tech leaders to evaluate operational efficiency, capital allocation, and risk profile, culminating in a structured executive recommendation.',
    deliverables: [
      'Comparative financial ratio dataset (Liquidity, Solvency, Profitability, Efficiency)',
      '3-Year trend variance analysis table',
      'Cognitive interpretation of gross margin & ROIC divergences',
      'Strategic executive conclusion and capital structure synthesis'
    ],
    learningObjectives: [
      'Apply financial statement analysis concepts to real-world corporate balance sheets and income statements',
      'Distinguish between operational efficiency and debt-fueled return on equity (DuPont Analysis)',
      'Synthesize qualitative industry context with quantitative metrics to form defensible conclusions',
      'Defend financial arguments with clear evidence-backed reasoning'
    ],
    requiredKnowledge: [
      'Financial Statement Structure (10-K Income Statement, Balance Sheet, Cash Flows)',
      'Key Ratio Formulae (Current, Quick, Debt-to-Equity, Net Margin, ROE, ROIC, Asset Turnover)',
      'DuPont 3-way framework',
      'Macroeconomic tech sector headwinds and supply chain cost structures'
    ],
    estimatedEffort: '4 - 5.5 hours across structured micro-sessions',
    difficulty: 'Intermediate',
    deadline: 'Due in 6 days (Sep 14)',
    risksAndFriction: [
      'Over-focusing on mechanical ratio math while running out of time for deep analytical interpretation',
      'Getting overwhelmed pulling unstructured data from lengthy 100+ page 10-K disclosures',
      'Writing superficial descriptions of numbers ("margin went up 2%") without explaining causal business drivers'
    ],
    components: [
      {
        id: 'comp-1',
        title: 'Extract 10-K Line Items & Financial Data',
        description: 'Locating balance sheet, income statement, and free cash flow line items for 2022-2024 from SEC EDGAR filings.',
        classification: 'MECHANICAL',
        aiRole: 'Auto-extract, tabulate, and standardize GAAP line items into clean structured tables.',
        studentRole: 'Verify line item continuity and identify non-recurring extraordinary charges.',
        learningValueExplanation: 'Low learning value. Finding numbers in tables is administrative; the learning begins once the numbers are ready for analysis.'
      },
      {
        id: 'comp-2',
        title: 'Compute Standard Financial & DuPont Ratios',
        description: 'Applying arithmetic formulas for Current Ratio, Quick Ratio, D/E, ROIC, Gross Margin, and Asset Turnover.',
        classification: 'SUPPORTIVE',
        aiRole: 'Run formula calculations, auto-generate checks, and highlight formula variations.',
        studentRole: 'Select which ratios are relevant for evaluating technology & SaaS business models.',
        learningValueExplanation: 'Moderate learning value. While knowing formulas is essential, pure arithmetic is better augmented with AI checks so focus shifts to analysis.'
      },
      {
        id: 'comp-3',
        title: 'Interpret Why Ratios Changed Over Time',
        description: 'Connecting margin fluctuations and inventory turnover variations to R&D expenditures, supply chain shocks, and pricing power.',
        classification: 'COGNITIVE',
        aiRole: 'Provide Socratic prompting, offer relevant macroeconomic context, and critique student hypotheses.',
        studentRole: 'Formulate and defend the core causal explanation of why operational metrics shifted.',
        learningValueExplanation: 'High learning value. This is the core cognitive outcome your professor is testing: analytical synthesis and financial intuition.'
      },
      {
        id: 'comp-4',
        title: 'Synthesize Comparative Position & Strategic Conclusion',
        description: 'Weighing trade-offs between aggressive capital return (buybacks) vs. balance sheet resilience and reinvestment in AI infrastructure.',
        classification: 'COGNITIVE',
        aiRole: 'Challenge assertions, generate counter-arguments, and check for cognitive leaps or unfounded assumptions.',
        studentRole: 'Craft the final managerial synthesis and justify strategic trade-offs in original prose.',
        learningValueExplanation: 'Maximum learning value. Teaches executive decision-making under financial ambiguity.'
      },
      {
        id: 'comp-5',
        title: 'Format, Footnote, and Citation Audit',
        description: 'Ensuring APA/Harvard styling, auditing SEC source URLs, and formatting academic tables.',
        classification: 'MECHANICAL',
        aiRole: 'Format tables according to academic standards and verify footnote consistency.',
        studentRole: 'Final read-through for visual clarity and academic submission integrity.',
        learningValueExplanation: 'Low learning value. Administrative formatting should not consume valuable study energy.'
      }
    ],
    recommendedMode: 'BALANCED',
    modeRecommendationReason: 'This assignment specifically evaluates analytical interpretation and strategic synthesis. Balanced Mode automates data tabulation and ratio calculations while strictly keeping causal interpretation and conclusions in your hands.'
  },
  missions: [
    {
      id: 'm-1',
      missionNumber: 1,
      title: 'Deconstruct Assignment Rubric & Core Objectives',
      description: 'Review the grading criteria, isolate the required ratios, and clarify what constitutes an A-grade analytical interpretation.',
      estimatedMinutes: 10,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS highlights the rubric weights and guides you in framing your analytical thesis question.',
      studentAction: 'Define the 3 primary financial questions your analysis will answer for executive leadership.',
      xpReward: 30,
      completed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Focus questions identified: 1) How sustainable is Apple cash flow with declining hardware cycles? 2) How does Microsoft cloud growth offset capex expansion?'
    },
    {
      id: 'm-2',
      missionNumber: 2,
      title: 'Collect Financial Data & Verify Line Items',
      description: 'Assemble 3 years of standardized revenue, COGS, operating income, total debt, and cash equivalents for AAPL and MSFT.',
      estimatedMinutes: 15,
      cognitiveImportance: 'LOW',
      classification: 'MECHANICAL',
      aiAssistanceLevel: 'StudyOS provides verified GAAP 10-K data points and flags any restatements or one-off tax adjustments.',
      studentAction: 'Review the data table and confirm that balance sheet dates match fiscal calendar year ends.',
      xpReward: 15,
      completed: true,
      completedAt: new Date(Date.now() - 40000000).toISOString(),
      subTasks: [
        { id: 'st-1', title: 'Verify AAPL 2022-2024 Revenue and Gross Profit', completed: true },
        { id: 'st-2', title: 'Verify MSFT 2022-2024 Operating Income and Debt', completed: true },
        { id: 'st-3', title: 'Confirm Free Cash Flow reconciliation', completed: true }
      ]
    },
    {
      id: 'm-3',
      missionNumber: 3,
      title: 'Calculate Key Financial & DuPont Ratios',
      description: 'Compute Liquidity (Current & Quick), Solvency (Debt/Equity), Profitability (Gross & Net Margin, ROIC), and DuPont breakdown.',
      estimatedMinutes: 20,
      cognitiveImportance: 'MEDIUM',
      classification: 'SUPPORTIVE',
      aiAssistanceLevel: 'StudyOS pre-computes arithmetic verification checks and flags arithmetic anomalies.',
      studentAction: 'Inspect the resulting variance: identify which 2 ratios experienced the sharpest year-over-year shift.',
      xpReward: 25,
      completed: false,
      subTasks: [
        { id: 'st-4', title: 'Compute AAPL & MSFT Gross Margin and Operating Margin', completed: false },
        { id: 'st-5', title: 'Calculate DuPont 3-stage ROE components', completed: false },
        { id: 'st-6', title: 'Identify the top 2 divergent metrics for investigation', completed: false }
      ],
      hints: [
        'Notice how Apple ROE is extraordinarily high—check whether that is driven by net profit margin or massive treasury share buybacks shrinking equity.',
        'Compare Microsoft Capex-to-Operating-Cash-Flow ratio between 2022 and 2024 to see the impact of AI infrastructure buildout.'
      ]
    },
    {
      id: 'm-4',
      missionNumber: 4,
      title: 'Interpret Why Ratios Diverged (Root-Cause Analysis)',
      description: 'Explain the economic and operational catalysts behind margin movements rather than just stating numbers.',
      estimatedMinutes: 25,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS serves as a Socratic sparring partner, asking probing questions on your explanatory hypotheses.',
      studentAction: 'Draft 2 substantive paragraphs analyzing how supply chain stabilization and cloud pricing power drove the observed trends.',
      xpReward: 40,
      completed: false
    },
    {
      id: 'm-5',
      missionNumber: 5,
      title: 'Compare Performance Against Tech Industry Benchmarks',
      description: 'Benchmark AAPL and MSFT metrics against the broader S&P 500 Technology Sector average.',
      estimatedMinutes: 20,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS summarizes peer quartile distributions while you evaluate relative competitive advantage.',
      studentAction: 'Determine whether AAPL or MSFT possesses stronger economic moats based on ROIC persistence.',
      xpReward: 40,
      completed: false
    },
    {
      id: 'm-6',
      missionNumber: 6,
      title: 'Develop Strategic Conclusions & Executive Recommendations',
      description: 'Synthesize the findings into forward-looking guidance for portfolio managers and company directors.',
      estimatedMinutes: 25,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS critiques your thesis for confirmation bias and points out unaddressed financial risks.',
      studentAction: 'Write the 300-word executive takeaway weighing capital allocation efficiency against debt levels.',
      xpReward: 45,
      completed: false
    },
    {
      id: 'm-7',
      missionNumber: 7,
      title: 'Academic Audit & Professional Submission Polish',
      description: 'Format tables, verify numerical citations against source filings, and audit academic integrity compliance.',
      estimatedMinutes: 10,
      cognitiveImportance: 'LOW',
      classification: 'MECHANICAL',
      aiAssistanceLevel: 'StudyOS generates clean formatted tables and checks citation alignment.',
      studentAction: 'Final verification that your original cognitive interpretation is prominent and clearly defended.',
      xpReward: 15,
      completed: false
    }
  ]
};

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'profile-alex-01',
  name: 'Alex Rivera',
  university: 'University College London',
  major: 'BSc Economics & Financial Computing',
  academicYear: '3rd Year (Junior)',
  subjectsOfStudy: ['Corporate Finance', 'Econometrics', 'Financial Accounting', 'Algorithmic Trading'],
  preferredLearningMode: 'BALANCED',
  preferredAIAssistanceLevel: 'Balanced',
  preferredSessionLengthMinutes: 15,
  preferredLearningStyle: 'Practice questions',
  mainAcademicGoals: 'Master core valuation methodologies and deliver high-rigor financial analyses while avoiding last-minute cramming.',
  procrastinationTriggers: [
    'Large/ambiguous tasks',
    'Difficult material',
    'Perfectionism',
    'Anxiety about starting'
  ],
  otherStudyNotes: 'I focus best when theoretical formulas are paired with concrete real-company examples (like Apple or Microsoft filings) rather than abstract symbols.',
  strongSubjects: ['Quantitative Problem Solving', 'Financial Modeling', 'Data Structures'],
  weakAreas: ['Ambiguous Qualitative Synthesis', 'Academic Literature Reviews'],
  commonFrictionPoints: [
    'Large ambiguous tasks with no clear first step',
    'Perfectionist hesitation on drafting initial paragraphs'
  ],
  successfulInterventions: [
    { type: 'TASK_DECOMPOSITION', count: 12 },
    { type: 'FIVE_MINUTE_START', count: 9 },
    { type: 'EXAMPLE_MODE', count: 8 },
    { type: 'FOCUS_SPRINT', count: 7 },
    { type: 'HINT_MODE', count: 5 }
  ],
  unsuccessfulInterventions: [
    { type: 'REFRAME_MODE', count: 2 }
  ],
  missionsCompleted: 14,
  missionsAbandoned: 1,
  totalStudyMinutes: 245,
  averageCompletionMinutes: 14.8,
  xp: 380,
  streakDays: 4,
  lastActiveDate: new Date().toISOString(),
  learningPreferences: [
    'Learn through structured examples + active practice',
    'Short 10-15 minute focused execution sprints',
    'Socratic hints instead of spoiler answers'
  ],
  behavioralInsights: [
    'You tend to complete tasks 40% faster when the first step takes less than 15 minutes.',
    'Your strongest learning mode appears to be learning through worked examples followed by retrieval practice.',
    'You frequently request Socratic hints before attempting unfamiliar qualitative synthesis.'
  ]
};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'mission_complete',
    title: 'Collected Financial Data & Line Items',
    xpGained: 15,
    details: 'Completed verified GAAP data extraction for Apple and Microsoft.'
  },
  {
    id: 'act-2',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    type: 'sprint_complete',
    title: '15-Minute Focus Sprint',
    xpGained: 15,
    details: 'Maintained uninterrupted focus on DuPont decomposition analysis.'
  },
  {
    id: 'act-3',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'mission_complete',
    title: 'Deconstruct Assignment Rubric & Core Objectives',
    xpGained: 30,
    details: 'Defined core research questions and executive thesis.'
  },
  {
    id: 'act-4',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'practice_answered',
    title: 'Active Recall: ROIC vs ROE Distinctions',
    xpGained: 20,
    details: 'Correctly identified how leverage distorts ROE without improving operational returns.'
  }
];
