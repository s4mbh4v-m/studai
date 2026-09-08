import { AcademicProject, ProjectAnalysis, Mission, AssistanceMode, CoachMode, StudentProfile, CoachMessage } from '../types';
import { getStudentProfile } from './storage';

export async function analyzeAcademicTask(params: {
  title: string;
  course: string;
  prompt: string;
  instructions?: string;
  deadline?: string;
  studentProfile?: StudentProfile;
}): Promise<ProjectAnalysis> {
  const profile = params.studentProfile || getStudentProfile();
  try {
    const res = await fetch('/api/analyze-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, studentProfile: profile }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('API call failed, falling back to local academic parser:', err);
  }

  // Local fallback
  let recMode: AssistanceMode = 'BALANCED';
  let recReason = 'StudAI recommends BALANCED Mode: The optimal split between speed and academic integrity. StudAI automates repetitive data formatting while you lead interpretation and critical reasoning.';
  
  if (profile?.preferredAIAssistanceLevel === 'Learn') {
    recMode = 'LEARN';
    recReason = 'StudAI recommends LEARN Mode: Aligned with your stated preference for maximum learning. StudAI will quiz, explain, and guide with hints while keeping all intellectual work with you.';
  } else if (profile?.preferredAIAssistanceLevel === 'Deadline') {
    recMode = 'DEADLINE';
    recReason = 'StudAI recommends DEADLINE Mode: Calibrated for deadline velocity. StudAI accelerates supportive drafting and data extraction while highlighting key concepts you should understand.';
  }

  return {
    projectTitle: params.title || 'Academic Research & Synthesis Task',
    whatToAccomplish: `Successfully analyze and draft a comprehensive submission for ${params.course || 'this course'}, resolving core theoretical inquiries and delivering grounded evidence.`,
    deliverables: [
      'Preliminary empirical data/literature compilation table',
      'Structural outline mapped to course evaluation criteria',
      'Cognitive analysis defending the core thesis',
      'Academic citation audit and formatted submission',
    ],
    learningObjectives: [
      `Master core methodological standards in ${params.course || 'the subject area'}`,
      'Distinguish surface metrics from underlying causal business/scientific mechanisms',
      'Formulate and defend an original thesis under academic scrutiny',
    ],
    requiredKnowledge: [
      `Foundational principles of ${params.course || 'the discipline'}`,
      'Primary literature retrieval and citation protocols',
      'Critical analysis and qualitative/quantitative argumentation',
    ],
    estimatedEffort: `4 - 5 hours divided into ${profile?.preferredSessionLengthMinutes || 15}-minute execution sprints`,
    difficulty: 'Intermediate',
    deadline: params.deadline || 'Upcoming 7 days',
    risksAndFriction: [
      'Procrastination driven by ambiguous initial requirements',
      'Spending too much effort on formatting before locking in core arguments',
      'Descriptive summaries that fail to offer critical evaluation',
    ],
    components: [
      {
        id: 'comp-1',
        title: 'Information & Literature Gathering',
        description: 'Locating relevant data sources, datasets, and primary academic references.',
        classification: 'MECHANICAL',
        aiRole: 'Standardize references and extract key summary data tables.',
        studentRole: 'Verify relevance to the prompt guidelines.',
        learningValueExplanation: 'Low learning value. Gathering files is administrative.',
      },
      {
        id: 'comp-2',
        title: 'Analytical Modeling & Framework Scaffolding',
        description: 'Setting up formulas, frameworks, or essay section structures.',
        classification: 'SUPPORTIVE',
        aiRole: 'Provide scaffolding templates and check calculations.',
        studentRole: 'Select which frameworks best explain the problem.',
        learningValueExplanation: 'Moderate learning value. Guided structuring helps you focus.',
      },
      {
        id: 'comp-3',
        title: 'Deep Causal Interpretation & Argumentation',
        description: 'Explaining why patterns occur and connecting evidence to conclusions.',
        classification: 'COGNITIVE',
        aiRole: 'Ask Socratic questions and critique logical gaps.',
        studentRole: 'Author original thesis arguments in your own academic voice.',
        learningValueExplanation: 'High learning value. The core assessment of your intellect.',
      },
      {
        id: 'comp-4',
        title: 'Final Academic Polish & Integrity Check',
        description: 'Proofreading, checking footnotes, and confirming originality.',
        classification: 'MECHANICAL',
        aiRole: 'Automate formatting consistency checks and citation audit.',
        studentRole: 'Final read-through for intellectual clarity.',
        learningValueExplanation: 'Low learning value. Formatting should not cause stress.',
      },
    ],
    recommendedMode: recMode,
    modeRecommendationReason: recReason,
  };
}

export async function generateProjectMissions(
  analysis: ProjectAnalysis,
  selectedMode: AssistanceMode,
  studentProfile?: StudentProfile
): Promise<Mission[]> {
  const profile = studentProfile || getStudentProfile();
  try {
    const res = await fetch('/api/generate-missions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis, selectedMode, studentProfile: profile }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.missions)) {
      return data.missions;
    }
  } catch (err) {
    console.warn('Mission generation API call failed, generating local missions:', err);
  }

  // Fallback missions
  return [
    {
      id: 'm-1',
      missionNumber: 1,
      title: 'Deconstruct Assignment Rubric & Core Objectives',
      description: 'Review grading criteria, isolate deliverables, and frame the analytical thesis question.',
      estimatedMinutes: 10,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS isolates rubric weights and clarifies what examiners look for.',
      studentAction: 'Write the 2-sentence thesis question your submission will answer.',
      xpReward: 30,
      completed: false,
      hints: ['Pay close attention to verbs like "evaluate" or "defend" in the prompt.'],
      subTasks: [
        { id: 'st-1', title: 'Highlight primary grading criteria', completed: false },
        { id: 'st-2', title: 'Draft your working thesis question', completed: false },
      ],
    },
    {
      id: 'm-2',
      missionNumber: 2,
      title: 'Collect & Standardize Source Evidence',
      description: 'Gather verified data points, academic citations, and source documents.',
      estimatedMinutes: 15,
      cognitiveImportance: 'LOW',
      classification: 'MECHANICAL',
      aiAssistanceLevel: 'StudyOS extracts and tabulates source data points.',
      studentAction: 'Confirm data integrity and select the most authoritative sources.',
      xpReward: 15,
      completed: false,
    },
    {
      id: 'm-3',
      missionNumber: 3,
      title: 'Structure the Analytical Framework & Outline',
      description: 'Map each section of your draft directly to the grading rubric.',
      estimatedMinutes: 20,
      cognitiveImportance: 'MEDIUM',
      classification: 'SUPPORTIVE',
      aiAssistanceLevel: 'StudyOS suggests a section breakdown with target word budgets.',
      studentAction: 'Align your chosen evidence points with each section heading.',
      xpReward: 25,
      completed: false,
    },
    {
      id: 'm-4',
      missionNumber: 4,
      title: 'Execute Deep Analytical Synthesis (Core Argument)',
      description: 'Draft the core intellectual heart of the work, defending the "why" and "how".',
      estimatedMinutes: 25,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS provides Socratic challenges and tests for confirmation bias.',
      studentAction: 'Author the primary analytical paragraphs in your own words.',
      xpReward: 40,
      completed: false,
    },
    {
      id: 'm-5',
      missionNumber: 5,
      title: 'Synthesize Conclusions & Strategic Implications',
      description: 'Draw actionable takeaways and address limitations or counter-arguments.',
      estimatedMinutes: 20,
      cognitiveImportance: 'HIGH',
      classification: 'COGNITIVE',
      aiAssistanceLevel: 'StudyOS checks logical alignment between your opening thesis and conclusion.',
      studentAction: 'Write a 250-word conclusion summarizing key implications.',
      xpReward: 40,
      completed: false,
    },
    {
      id: 'm-6',
      missionNumber: 6,
      title: 'Academic Citation & Submission Polish',
      description: 'Perform final grammar checks, verify references, and format tables.',
      estimatedMinutes: 10,
      cognitiveImportance: 'LOW',
      classification: 'MECHANICAL',
      aiAssistanceLevel: 'StudyOS validates citation syntax and verifies formatting.',
      studentAction: 'Final read-through for intellectual authenticity and flow.',
      xpReward: 15,
      completed: false,
    },
  ];
}

export async function askStudyCoach(params: {
  query: string;
  project?: AcademicProject;
  currentMission?: Mission;
  mode: CoachMode;
  studentProfile?: StudentProfile;
}): Promise<Partial<CoachMessage>> {
  const profile = params.studentProfile || getStudentProfile();
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, studentProfile: profile }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
  } catch (err) {
    console.warn('Coach API call failed, using local heuristic coach:', err);
  }

  const pace = profile?.preferredSessionLengthMinutes || 15;
  const learningStyle = profile?.preferredLearningStyle || 'Practice questions';

  // Client-side fallback response
  return {
    text: `### StudyOS Academic Coach 🎓\n\nI am reviewing **${params.currentMission?.title || 'your academic task'}**.\n\n* **Classification:** ${params.currentMission?.classification || 'COGNITIVE'}\n* **Your Role:** ${params.currentMission?.studentAction || 'Analyze and synthesize findings'}\n* **AI Role:** ${params.currentMission?.aiAssistanceLevel || 'Scaffolding and Socratic feedback'}\n* **Your Learning Preference:** ${learningStyle}\n* **Target Sprint Length:** ${pace} minutes\n\nWhat specific friction can I help reduce right now?`,
    mode: params.mode,
    suggestedActions: [
      { label: `Break into ${Math.min(pace, 10)}-min step`, action: 'breakdown' },
      { label: 'Give me a hint', action: 'hint' },
      { label: 'Test my knowledge', action: 'test_me' },
    ],
  };
}
