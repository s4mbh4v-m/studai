import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { generateGroqJSON, isGroqConfigured, GROQ_MODEL } from './server/groq.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    provider: 'groq',
    aiAvailable: isGroqConfigured(),
    model: GROQ_MODEL,
  });
});

// 2. Task / Document Analysis Endpoint
app.post('/api/analyze-task', async (req, res) => {
  const { title, course, prompt, instructions, deadline, studentProfile } = req.body || {};

  const explicitProfileSummary = studentProfile
    ? `
STUDENT EXPLICIT PREFERENCES (HIGH PRIORITY):
- Student Name: ${studentProfile.name || 'Student'}
- Course / Degree: ${studentProfile.major || 'University Studies'}
- Academic Year: ${studentProfile.academicYear || 'Undergraduate'}
- Subjects / Focus: ${(studentProfile.subjectsOfStudy || []).join(', ') || 'General'}
- Preferred Session Length: ${studentProfile.preferredSessionLengthMinutes || 15} minutes
- Preferred Learning Style: ${studentProfile.preferredLearningStyle || 'Practice questions'}
- Preferred AI Assistance Level: ${studentProfile.preferredAIAssistanceLevel || 'Balanced'}
- Main Academic Goals: ${studentProfile.mainAcademicGoals || 'Academic distinction and understanding'}
- Procrastination Triggers: ${(studentProfile.procrastinationTriggers || []).join(', ') || 'Large/ambiguous tasks'}
- Student Study Notes: ${studentProfile.otherStudyNotes || 'None'}

STUDYOS INFERRED INSIGHTS (ACTIVITY PATTERNS):
- Behavioral Insights: ${(studentProfile.behavioralInsights || []).join('; ') || 'None recorded'}
- Common Friction Points: ${(studentProfile.commonFrictionPoints || []).join('; ') || 'None recorded'}`
    : '';

  if (isGroqConfigured()) {
    try {
      const systemInstruction = `You are StudAI's Academic Task & Learning Objectives Analyzer.
Your core philosophy is: "AI should automate low-learning-value work while protecting high-learning-value work."
You break assignments into distinct components and classify every component as:
- MECHANICAL: Low learning value (data gathering, repetitive formatting, transcription, arithmetic checks). AI can usually perform this.
- SUPPORTIVE: AI assists with scaffolding, checks, or structure, but the student remains actively involved.
- COGNITIVE: High learning value (interpretation, evaluation, original argumentation, causal reasoning, synthesis). The student must perform the core reasoning.

${explicitProfileSummary}

PERSONALIZATION INSTRUCTIONS:
1. "estimatedEffort": Frame effort in terms of the student's preferred study sprint (${studentProfile?.preferredSessionLengthMinutes || 15}-minute sessions).
2. "recommendedMode": Align with student's preferred AI assistance level:
   - "Learn" -> recommend LEARN
   - "Balanced" -> recommend BALANCED
   - "Deadline" -> recommend DEADLINE
   Provide a clear reason that acknowledges both the task and their preference.
3. "risksAndFriction": Explicitly anticipate their stated procrastination triggers (${(studentProfile?.procrastinationTriggers || []).join(', ') || 'ambiguity, perfectionism'}) and note how StudyOS protects them.
4. "aiRole" & "studentRole": Calibrate towards their preferred learning style (${studentProfile?.preferredLearningStyle || 'Practice questions'}).

Respond ONLY with valid JSON matching this exact structure:
{
  "projectTitle": "string",
  "whatToAccomplish": "string",
  "deliverables": ["string", "string"],
  "learningObjectives": ["string", "string"],
  "requiredKnowledge": ["string", "string"],
  "estimatedEffort": "string (e.g. 3-4 hours divided into ${studentProfile?.preferredSessionLengthMinutes || 15}-min sprints)",
  "difficulty": "Beginner" | "Intermediate" | "Advanced" | "Challenging",
  "deadline": "string",
  "risksAndFriction": ["string", "string"],
  "components": [
    {
      "id": "comp-1",
      "title": "string",
      "description": "string",
      "classification": "MECHANICAL" | "SUPPORTIVE" | "COGNITIVE",
      "aiRole": "string",
      "studentRole": "string",
      "learningValueExplanation": "string"
    }
  ],
  "recommendedMode": "LEARN" | "BALANCED" | "DEADLINE",
  "modeRecommendationReason": "string"
}`;

      const userPrompt = `Analyze this university task:
Course: ${course || 'General'}
Title: ${title || 'Academic Task'}
Deadline: ${deadline || 'Flexible'}
Raw Task / Description: ${prompt}
Additional Instructions: ${instructions || 'None provided'}`;

      const parsed = await generateGroqJSON<any>({
        systemInstruction,
        userPrompt,
        temperature: 0.2,
      });

      if (parsed && typeof parsed === 'object' && parsed.projectTitle) {
        return res.json({ success: true, data: parsed, source: 'groq' });
      }
    } catch (err) {
      console.warn('Groq analysis error, using intelligent domain fallback:', err);
    }
  }

  // Graceful domain fallback based on prompt content and student profile
  const fallback = generateFallbackAnalysis(title, course, prompt, deadline, studentProfile);
  return res.json({ success: true, data: fallback, source: 'fallback' });
});

// 3. Mission Generation Endpoint
app.post('/api/generate-missions', async (req, res) => {
  const { analysis, selectedMode, studentProfile } = req.body || {};

  const targetMinutes = studentProfile?.preferredSessionLengthMinutes || 15;
  const learningStyle = studentProfile?.preferredLearningStyle || 'Practice questions';

  if (isGroqConfigured() && analysis) {
    try {
      const systemInstruction = `You are StudAI's Mission & Execution Plan Generator.
Given a project analysis and the selected assistance mode (${selectedMode || 'BALANCED'}), generate a sequence of 5 to 7 concrete, bite-sized academic missions that respect the mode.

STUDENT PROFILE PREFERENCES:
- Target sprint duration: ${targetMinutes} minutes (calibrate mission estimatedMinutes near this target).
- Preferred learning style: ${learningStyle}.
- Procrastination triggers to avoid: ${(studentProfile?.procrastinationTriggers || []).join(', ') || 'ambiguity'}.
- Mission 1 MUST be a small, low-friction entry point under ${Math.min(targetMinutes, 15)} minutes to overcome inertia.

Rules:
- Respect the classification (MECHANICAL, SUPPORTIVE, COGNITIVE).
- If mode is LEARN: student actions are demanding and deep, AI teaches and quizzes.
- If mode is BALANCED: AI handles mechanical data extraction and calculations, student focuses on interpretation, synthesis, and conclusions.
- If mode is DEADLINE: AI provides ready structures and drafts, but highlights the key points the student must grasp.
- Keep missions sized appropriately (typically 10 to 25 minutes).
- Assign mature XP: Mechanical (10-15 XP), Supportive (25 XP), Cognitive (35-45 XP).

Return ONLY valid JSON matching this exact structure:
{
  "missions": [
    {
      "id": "m-1",
      "missionNumber": 1,
      "title": "string",
      "description": "string",
      "estimatedMinutes": 15,
      "cognitiveImportance": "LOW" | "MEDIUM" | "HIGH",
      "classification": "MECHANICAL" | "SUPPORTIVE" | "COGNITIVE",
      "aiAssistanceLevel": "string explaining what StudyOS does",
      "studentAction": "string specifying exactly what the student does",
      "xpReward": 30,
      "completed": false,
      "hints": ["hint 1", "hint 2"],
      "subTasks": [{"id": "st-1", "title": "sub task 1", "completed": false}]
    }
  ]
}`;

      const userPrompt = `Project: ${analysis.projectTitle}\nTask: ${analysis.whatToAccomplish}\nSelected Mode: ${selectedMode}\nComponents: ${JSON.stringify(analysis.components)}`;

      const parsed = await generateGroqJSON<{ missions: any[] }>({
        systemInstruction,
        userPrompt,
        temperature: 0.2,
      });

      if (parsed && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
        return res.json({ success: true, missions: parsed.missions, source: 'groq' });
      }
    } catch (err) {
      console.warn('Groq mission generation error, using fallback:', err);
    }
  }

  const missions = generateFallbackMissions(analysis, selectedMode || 'BALANCED', studentProfile);
  return res.json({ success: true, missions, source: 'fallback' });
});

// 4. Study Coach & Academic Integrity Guardrail Endpoint
app.post('/api/coach', async (req, res) => {
  const { query, project, currentMission, mode, studentProfile } = req.body || {};

  if (isGroqConfigured()) {
    try {
      const studentContext = studentProfile ? `
STUDENT EXPLICIT PREFERENCES (HIGH PRIORITY):
- Student Name: ${studentProfile.name || 'Student'}
- Academic Year & Major: ${studentProfile.academicYear || ''} ${studentProfile.major || ''}
- Preferred Study Sprint: ${studentProfile.preferredSessionLengthMinutes || 15} minutes
- Preferred Learning Style: ${studentProfile.preferredLearningStyle || 'Practice questions'}
- Preferred Assistance Level: ${studentProfile.preferredAIAssistanceLevel || 'Balanced'}
- Academic Goals: ${studentProfile.mainAcademicGoals || ''}
- Known Procrastination Triggers: ${(studentProfile.procrastinationTriggers || []).join(', ') || 'ambiguity'}
- Student Notes on Studying: ${studentProfile.otherStudyNotes || 'None'}

STUDYOS INFERRED INSIGHTS:
- Behavioral Patterns: ${(studentProfile.behavioralInsights || []).join('; ') || 'None recorded'}

COACHING ADAPTATION:
- Directly tailor your explanations and hints to the student's preferred style (${studentProfile.preferredLearningStyle || 'Practice questions'}):
  * If "Examples", prioritize worked parallel models.
  * If "Practice questions", prioritize quiz / retrieval checks.
  * If "Explanations", prioritize clear causal breakdowns.
  * If "Visual learning", prioritize matrices, markdown tables, or step diagrams.
- If the student is feeling stuck or overwhelmed, acknowledge their triggers (${(studentProfile?.procrastinationTriggers || []).join(', ')}) and prescribe a tiny action matching their preferred session length (${studentProfile?.preferredSessionLengthMinutes || 15} min).` : '';

      const systemInstruction = `You are StudAI's Adaptive Study Coach and Academic Execution Agent for university students.
Current Coach Mode: ${mode || 'COACHING'}
Project: "${project?.title || 'Academic Task'}" in ${project?.course || 'University Course'}
Current Mission: ${currentMission?.title ? `Mission ${currentMission.missionNumber}: ${currentMission.title} (${currentMission.classification})` : 'General Project Strategy'}
Current Student Action: ${currentMission?.studentAction || 'Reading / Research'}
Assistance Mode: ${project?.selectedMode || 'BALANCED'}

${studentContext}

CRITICAL ACADEMIC INTEGRITY DIRECTIVE:
If the student asks "Just do this for me" or asks you to write an entire answer or essay:
1. Assess whether the requested task is MECHANICAL, SUPPORTIVE, or COGNITIVE.
2. If MECHANICAL (formatting, data conversion, grammar checking): You can assist directly.
3. If COGNITIVE (interpreting, synthesizing, proving, arguing): DO NOT write the answer for them!
   Politely and constructively explain why this step contains the high-value learning outcome.
   Instead, offer scaffolding: a worked parallel example, a Socratic hint, a 3-step breakdown, or a practice question.
   Be encouraging and professional, never preachy or scolding.

LEARNING SCIENCE PRINCIPLES:
- Active recall & retrieval practice
- Goal decomposition (tiny first actions)
- Metacognition & cognitive load reduction
- Progressive hints (start with a nudge, only escalate if they are still stuck)

FORMAT RESPONSE AS JSON:
{
  "text": "Your clear, supportive, high-utility response in markdown formatting",
  "mode": "TEACHING" | "COACHING" | "HINT" | "PRACTICE" | "EXECUTION",
  "suggestedActions": [
    {"label": "Break into 5-min step", "action": "breakdown"},
    {"label": "Test me with a quiz", "action": "test_me"},
    {"label": "Give me another hint", "action": "hint"}
  ],
  "practiceQuestion": {
    "question": "string (optional test question)",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0,
    "explanation": "Why this is correct"
  }
}`;

      const userPrompt = `Student Query: ${query}`;

      const parsed = await generateGroqJSON<any>({
        systemInstruction,
        userPrompt,
        temperature: 0.3,
      });

      if (parsed && typeof parsed === 'object' && parsed.text) {
        return res.json({ success: true, data: parsed, source: 'groq' });
      }
    } catch (err) {
      console.warn('Groq coach error, using fallback:', err);
    }
  }

  const fallback = generateFallbackCoachResponse(query, currentMission, mode, studentProfile);
  return res.json({ success: true, data: fallback, source: 'fallback' });
});

// Helper: Intelligent Fallback Generator for Task Analysis
function generateFallbackAnalysis(
  title: string,
  course: string,
  prompt: string,
  deadline?: string,
  studentProfile?: any
) {
  const cleanTitle = title || (prompt ? prompt.slice(0, 40) + '...' : 'Academic Coursework Project');
  const cleanCourse = course || 'University Coursework';
  const pace = studentProfile?.preferredSessionLengthMinutes || 15;
  const preferredLevel = studentProfile?.preferredAIAssistanceLevel || 'Balanced';

  let recommendedMode: 'LEARN' | 'BALANCED' | 'DEADLINE' = 'BALANCED';
  if (preferredLevel === 'Learn') recommendedMode = 'LEARN';
  if (preferredLevel === 'Deadline') recommendedMode = 'DEADLINE';

  const triggers = studentProfile?.procrastinationTriggers || [
    'Large/ambiguous tasks',
    'Perfectionism',
  ];

  return {
    projectTitle: cleanTitle,
    whatToAccomplish: `Successfully complete ${cleanTitle} by executing structured research, data/evidence synthesis, and cognitive argumentation aligned with ${cleanCourse} standards.`,
    deliverables: [
      'Preliminary outline and structured evidence compilation',
      'Core analysis, calculation or argumentation drafts',
      'Comparative evaluation and causal interpretation',
      'Final synthesized academic submission with validated citations',
    ],
    learningObjectives: [
      `Demonstrate mastery of core principles in ${cleanCourse}`,
      'Synthesize raw data and literature into clear, evidence-backed arguments',
      'Develop critical discernment between surface observations and root causal drivers',
      'Defend strategic academic conclusions under rigorous peer standards',
    ],
    requiredKnowledge: [
      `Foundational theories and methodologies of ${cleanCourse}`,
      'Standard academic citation and methodological frameworks',
      'Evidence appraisal and qualitative/quantitative interpretation',
    ],
    estimatedEffort: `3.5 - 4.5 hours across structured ${pace}-minute micro-sprints`,
    difficulty: 'Intermediate' as const,
    deadline: deadline || 'Within 7 days',
    risksAndFriction: [
      `Potential hesitation from known trigger: ${triggers[0] || 'ambiguous start'}`,
      'Over-investing time in mechanical formatting while rushing the core cognitive synthesis',
      'Superficial summary rather than deep analytical interpretation',
    ],
    components: [
      {
        id: 'comp-1',
        title: 'Compile Source Materials & Primary Literature',
        description: 'Gathering required readings, lecture transcripts, datasets, and citation metadata.',
        classification: 'MECHANICAL' as const,
        aiRole: 'Auto-extract key quotes, summarize data tables, and check citation formats.',
        studentRole: 'Verify relevance of selected literature and filter out peripheral sources.',
        learningValueExplanation: 'Low learning value. Collecting files is logistical; the intellectual engagement begins with analysis.',
      },
      {
        id: 'comp-2',
        title: 'Synthesize Core Arguments & Analytical Models',
        description: 'Structuring the theoretical frameworks and mapping evidence to rubric criteria.',
        classification: 'SUPPORTIVE' as const,
        aiRole: 'Suggest outline scaffolding, highlight structural gaps, and check rubric coverage.',
        studentRole: 'Choose the theoretical lens and define the core thesis claim.',
        learningValueExplanation: 'Moderate learning value. Structuring is collaborative, but thesis ownership must remain yours.',
      },
      {
        id: 'comp-3',
        title: 'Interpret Results & Develop Original Arguments',
        description: 'Providing original synthesis, critical analysis, and answering the assignment prompt directly.',
        classification: 'COGNITIVE' as const,
        aiRole: 'Provide Socratic counters, critique logical jumps, and challenge superficial claims.',
        studentRole: 'Formulate, defend, and author the core causal interpretation in your own words.',
        learningValueExplanation: 'High learning value. This is the primary objective of your university course.',
      },
      {
        id: 'comp-4',
        title: 'Review, Tone Calibration & Academic Integrity Audit',
        description: 'Polishing grammar, verifying citations, and confirming alignment with university academic integrity rules.',
        classification: 'MECHANICAL' as const,
        aiRole: 'Perform grammar sweep, citation audit, and formatting layout checks.',
        studentRole: 'Final read-through to confirm voice authenticity and rigorous argumentation.',
        learningValueExplanation: 'Low learning value. Minor copyediting should not block academic demonstration.',
      },
    ],
    recommendedMode,
    modeRecommendationReason: `Configured to match your explicit "${preferredLevel}" assistance preference and ${pace}-minute study intervals. Automates mechanical data formatting while protecting your intellectual reasoning.`,
  };
}

function generateFallbackMissions(analysis: any, mode: string, studentProfile?: any) {
  const pace = studentProfile?.preferredSessionLengthMinutes || 15;
  const learningStyle = studentProfile?.preferredLearningStyle || 'Practice questions';
  const trigger = (studentProfile?.procrastinationTriggers || ['Ambiguous tasks'])[0];

  // Adjust mission durations around student pace
  const m1Time = Math.min(pace, 10);
  const m2Time = Math.min(pace, 15);
  const m3Time = Math.max(pace, 15);
  const m4Time = Math.max(pace, 20);

  return [
    {
      id: 'm-1',
      missionNumber: 1,
      title: 'Deconstruct Assignment Rubric & Core Objectives',
      description: `Fast ${m1Time}-min entry designed to defuse hesitation from "${trigger}". Review grading criteria and frame the guiding question.`,
      estimatedMinutes: m1Time,
      cognitiveImportance: 'HIGH' as const,
      classification: 'COGNITIVE' as const,
      aiAssistanceLevel: 'StudyOS isolates rubric weights and highlights key evaluation criteria.',
      studentAction: 'Write a 2-sentence thesis statement that directly answers the core prompt.',
      xpReward: 30,
      completed: false,
      hints: [
        learningStyle === 'Examples'
          ? 'Check the worked parallel example in the coach sidebar before writing.'
          : 'Review the assignment verbs (e.g. "critique", "evaluate", "compare").',
      ],
      subTasks: [
        { id: 'st-1', title: 'Identify primary grading criteria', completed: false },
        { id: 'st-2', title: 'Define the 3 primary questions to answer', completed: false },
      ],
    },
    {
      id: 'm-2',
      missionNumber: 2,
      title: 'Gather & Standardize Required Source Evidence',
      description: 'Collect key data points, academic citations, and reference materials.',
      estimatedMinutes: m2Time,
      cognitiveImportance: 'LOW' as const,
      classification: 'MECHANICAL' as const,
      aiAssistanceLevel: 'StudyOS extracts relevant data tables and verifies source links.',
      studentAction: 'Confirm selected sources address the prompt requirements.',
      xpReward: 15,
      completed: false,
      subTasks: [
        { id: 'st-3', title: 'Collect verified academic sources or datasets', completed: false },
        { id: 'st-4', title: 'Flag key empirical evidence', completed: false },
      ],
    },
    {
      id: 'm-3',
      missionNumber: 3,
      title: 'Structure the Analytical Outline & Methodology',
      description: 'Map each section of your paper or submission directly to the grading rubric.',
      estimatedMinutes: m3Time,
      cognitiveImportance: 'MEDIUM' as const,
      classification: 'SUPPORTIVE' as const,
      aiAssistanceLevel: 'StudyOS generates a structured section scaffolding with word count budgets.',
      studentAction: 'Assign your key arguments to each section header.',
      xpReward: 25,
      completed: false,
      hints: ['Ensure each body paragraph begins with a strong topic claim, not a descriptive statistic.'],
    },
    {
      id: 'm-4',
      missionNumber: 4,
      title: 'Execute Deep Analytical Synthesis (Core Argument)',
      description: `Author the core intellectual heart of the work. Aligned with your ${learningStyle} learning style.`,
      estimatedMinutes: m4Time,
      cognitiveImportance: 'HIGH' as const,
      classification: 'COGNITIVE' as const,
      aiAssistanceLevel: 'StudyOS asks Socratic questions and challenges weak reasoning without writing text.',
      studentAction: 'Draft the core analytical sections in your original academic voice.',
      xpReward: 40,
      completed: false,
      hints: ['Connect observed findings back to the core theoretical models taught in your lectures.'],
    },
    {
      id: 'm-5',
      missionNumber: 5,
      title: 'Formulate Strategic Conclusions & Implications',
      description: 'Summarize the broader significance of your findings and suggest practical recommendations.',
      estimatedMinutes: m3Time,
      cognitiveImportance: 'HIGH' as const,
      classification: 'COGNITIVE' as const,
      aiAssistanceLevel: 'StudyOS tests your conclusion for logical continuity with the opening thesis.',
      studentAction: 'Write the 250-word conclusion highlighting strategic takeaways.',
      xpReward: 40,
      completed: false,
    },
    {
      id: 'm-6',
      missionNumber: 6,
      title: 'Academic Integrity, Citation Audit & Submission Polish',
      description: 'Ensure accurate references, consistent formatting, and final quality assurance.',
      estimatedMinutes: Math.min(pace, 15),
      cognitiveImportance: 'LOW' as const,
      classification: 'MECHANICAL' as const,
      aiAssistanceLevel: 'StudyOS formats citations and checks formatting alignment.',
      studentAction: 'Perform final proofread and confirm submission checklist.',
      xpReward: 15,
      completed: false,
    },
  ];
}

function generateFallbackCoachResponse(
  query: string,
  currentMission: any,
  currentMode: string,
  studentProfile?: any
) {
  const q = (query || '').toLowerCase();
  const studentName = studentProfile?.name ? studentProfile.name.split(' ')[0] : 'there';
  const pace = studentProfile?.preferredSessionLengthMinutes || 15;
  const learningStyle = studentProfile?.preferredLearningStyle || 'Practice questions';
  const triggers = (studentProfile?.procrastinationTriggers || ['Large/ambiguous tasks']).join(', ');

  // Academic integrity guardrail: "just do it for me" or "write this for me"
  if (q.includes('just do this') || q.includes('do it for me') || q.includes('write this for me') || q.includes('write my')) {
    const isCognitive = currentMission?.classification === 'COGNITIVE';
    if (isCognitive) {
      return {
        text: `### Academic Integrity & Learning Protection 🛡️\n\nHey ${studentName}, I know you want to push through **"${currentMission?.title || 'this section'}"** quickly.\n\nHowever, this component is classified as **COGNITIVE (High Learning Value)**. Your course grading rubric evaluates your original synthesis and causal reasoning.\n\n**Tailored scaffolding based on your preferences (${learningStyle}):**\n1. **Parallel worked example** demonstrating the exact structure.\n2. **${pace}-minute micro-outline** tailored to your preferred sprint length.\n3. **Socratic question** to trigger your core argument.\n\nWhich one would help you make progress right now?`,
        mode: 'COACHING',
        suggestedActions: [
          { label: 'Show me an example', action: 'example' },
          { label: 'Give me a hint', action: 'hint' },
          { label: `Break into ${Math.min(pace, 10)}-min step`, action: 'breakdown' },
        ],
      };
    } else {
      return {
        text: `### Mechanical Task Assistance ⚡\n\nSince this step (**"${currentMission?.title || 'Data Step'}"**) is classified as **MECHANICAL**, I can take care of the data compilation, formatting, and citation layout so you can save your cognitive energy for your core analysis.\n\nHere is the formatted structure ready for your review:`,
        mode: 'EXECUTION',
        suggestedActions: [
          { label: 'Apply verified data', action: 'apply' },
          { label: 'Proceed to next mission', action: 'next' },
        ],
      };
    }
  }

  // Diagnostic / Procrastination queries
  if (q.includes('procrastinat') || q.includes('stuck') || q.includes('cant focus') || q.includes('tired') || q.includes('overwhelm')) {
    return {
      text: `### Execution Coach Diagnostic 🎯\n\nHey ${studentName}, getting stuck is cognitive friction, not a lack of motivation. Looking at your profile, your primary hurdles often stem from **${triggers}**.\n\nLet's apply your calibrated **${pace}-minute focus sprint**:\n1. Open your draft and write just **one imperfect sentence**.\n2. We'll refine it together using your **${learningStyle}** preference.\n3. Stop after ${pace} minutes with momentum preserved.\n\nReady to do a quick ${Math.min(pace, 10)}-minute warm-up?`,
      mode: 'COACHING',
      suggestedActions: [
        { label: `Start ${pace}-Min Focus Sprint`, action: 'sprint_10' },
        { label: '5-Minute Micro-Action', action: 'five_min' },
        { label: 'Deconstruct this mission', action: 'breakdown' },
      ],
    };
  }

  // Hints
  if (q.includes('hint') || q.includes('clue')) {
    return {
      text: `### Socratic Hint 💡 (Level 1 Scaffolding)\n\nLook at the relationship between **operating margins** and **inventory turnover**.\n\n- If margins expanded while inventory turnover stayed flat, what does that tell you about **pricing power** versus **volume growth**?\n- Consider how supply-chain stabilization in late 2023 allowed tech hardware manufacturers to reduce freight surcharges.\n\n*Try writing one sentence explaining that dynamic in your draft.*`,
      mode: 'HINT',
      suggestedActions: [
        { label: 'Give me stronger Hint 2', action: 'hint_2' },
        { label: 'Show me an example', action: 'example' },
        { label: 'Test my hypothesis', action: 'test_me' },
      ],
    };
  }

  // Practice / Quiz
  if (q.includes('test') || q.includes('quiz') || q.includes('practice')) {
    return {
      text: `### Active Recall & Retrieval Practice 🧠\n\nTesting yourself produces stronger long-term retention than passive reading. Answer this conceptual question:`,
      mode: 'PRACTICE',
      practiceQuestion: {
        question: 'When performing a DuPont Analysis, if a company shows a rising Return on Equity (ROE) but flat Net Profit Margin and Asset Turnover, what is the primary driver of the increase?',
        options: [
          'A) Increased operational cost efficiency',
          'B) Increased financial leverage (equity multiplier / debt)',
          'C) Expansion into higher-margin software services',
          'D) Accelerated inventory turnover rate',
        ],
        correctAnswerIndex: 1,
        explanation: 'According to the DuPont 3-stage model (ROE = Net Margin × Asset Turnover × Equity Multiplier), if margin and turnover are unchanged, ROE can only rise through higher leverage (debt shrinking the equity denominator).',
      },
      suggestedActions: [
        { label: 'Another practice question', action: 'test_me' },
        { label: 'Return to mission draft', action: 'resume' },
      ],
    };
  }

  // General explanation
  return {
    text: `### Academic Concept Insight 📖\n\nFor **"${currentMission?.title || 'this mission'}"**, the key focus is bridging empirical evidence with academic theory.\n\n- **Mechanical side:** The formulas and references are tools.\n- **Cognitive side:** Your evaluation depends on demonstrating **why** the findings matter in the context of ${studentProfile?.major || 'your coursework'}.\n\nWould you like me to provide a worked ${learningStyle === 'Examples' ? 'example case' : 'conceptual breakdown'} or start a ${pace}-minute sprint?`,
    mode: 'TEACHING',
    suggestedActions: [
      { label: 'Show worked example', action: 'example' },
      { label: 'Break into 3 micro-steps', action: 'breakdown' },
      { label: 'Give me a hint', action: 'hint' },
    ],
  };
}

// Start Server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`StudAI server running on port ${PORT}`);
  });
}

startServer();
