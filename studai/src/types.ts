export type ClassificationType = 'MECHANICAL' | 'SUPPORTIVE' | 'COGNITIVE';

export type AssistanceMode = 'LEARN' | 'BALANCED' | 'DEADLINE';

export type CoachMode = 'TEACHING' | 'COACHING' | 'HINT' | 'PRACTICE' | 'EXECUTION';

export type FrictionCause =
  | 'TASK_TOO_LARGE'
  | 'DONT_KNOW_WHERE_TO_START'
  | 'DONT_UNDERSTAND_MATERIAL'
  | 'TASK_IS_BORING'
  | 'DISTRACTED'
  | 'ANXIOUS_ABOUT_QUALITY'
  | 'TIRED'
  | 'LACK_MOTIVATION';

export type InterventionType =
  | 'TASK_DECOMPOSITION'
  | 'FIVE_MINUTE_START'
  | 'FOCUS_SPRINT'
  | 'TEACHING_MODE'
  | 'EXAMPLE_MODE'
  | 'HINT_MODE'
  | 'PRACTICE_MODE'
  | 'COMMITMENT_MODE'
  | 'REFRAME_MODE';

export interface TaskComponent {
  id: string;
  title: string;
  description: string;
  classification: ClassificationType;
  aiRole: string;
  studentRole: string;
  learningValueExplanation: string;
}

export interface Mission {
  id: string;
  missionNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  cognitiveImportance: 'LOW' | 'MEDIUM' | 'HIGH';
  classification: ClassificationType;
  aiAssistanceLevel: string;
  studentAction: string;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
  subTasks?: { id: string; title: string; completed: boolean }[];
  hints?: string[];
  workedExample?: string;
  notes?: string;
}

export interface ProjectAnalysis {
  projectTitle: string;
  whatToAccomplish: string;
  deliverables: string[];
  learningObjectives: string[];
  requiredKnowledge: string[];
  estimatedEffort: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Challenging';
  deadline: string;
  risksAndFriction: string[];
  components: TaskComponent[];
  recommendedMode: AssistanceMode;
  modeRecommendationReason: string;
}

export interface AcademicProject {
  id: string;
  title: string;
  course: string;
  deadline: string;
  rawPrompt: string;
  uploadedFileName?: string;
  instructions?: string;
  createdAt: string;
  status: 'analyzing' | 'ready_for_mode' | 'in_progress' | 'completed';
  selectedMode?: AssistanceMode;
  analysis?: ProjectAnalysis;
  missions: Mission[];
  currentMissionIndex: number;
  totalXpEarned: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'mission_complete' | 'sprint_complete' | 'practice_answered' | 'intervention_used' | 'project_created';
  title: string;
  xpGained: number;
  details?: string;
}

export type PreferredLearningStyle =
  | 'Examples'
  | 'Practice questions'
  | 'Explanations'
  | 'Reading'
  | 'Visual learning'
  | 'Mixed';

export type PreferredAIAssistanceLevel = 'Learn' | 'Balanced' | 'Deadline';

export interface StudentProfile {
  id: string;
  name: string;
  university: string;
  major: string;
  academicYear?: string;
  subjectsOfStudy?: string[];
  preferredLearningMode: AssistanceMode;
  preferredAIAssistanceLevel?: PreferredAIAssistanceLevel;
  preferredSessionLengthMinutes: number;
  preferredLearningStyle?: PreferredLearningStyle;
  mainAcademicGoals?: string;
  procrastinationTriggers?: string[];
  otherStudyNotes?: string;
  strongSubjects: string[];
  weakAreas: string[];
  commonFrictionPoints: string[];
  successfulInterventions: { type: InterventionType; count: number }[];
  unsuccessfulInterventions: { type: InterventionType; count: number }[];
  missionsCompleted: number;
  missionsAbandoned: number;
  totalStudyMinutes: number;
  averageCompletionMinutes: number;
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  learningPreferences: string[];
  behavioralInsights: string[];
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: string;
  text: string;
  mode?: CoachMode;
  suggestedActions?: { label: string; action: string; payload?: unknown }[];
  practiceQuestion?: {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    userAnswerIndex?: number;
    answered?: boolean;
    isCorrect?: boolean;
  };
  scaffoldingTier?: number;
}
