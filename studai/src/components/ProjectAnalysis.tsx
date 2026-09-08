import React, { useState } from 'react';
import {
  ShieldAlert,
  Brain,
  Sparkles,
  CheckCircle2,
  Clock,
  Gauge,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle,
  Cpu,
  UserCheck,
  AlertTriangle,
  Lightbulb,
  Zap,
  Target,
  ListTodo,
  BookOpen
} from 'lucide-react';
import { AcademicProject, AssistanceMode, ClassificationType, TaskComponent, Mission, ProjectAnalysis as AnalysisType } from '../types';
import { generateProjectMissions } from '../lib/api';
import { updateProject, getStudentProfile } from '../lib/storage';

interface ProjectAnalysisProps {
  project: AcademicProject;
  onMissionsGenerated: (updatedProject: AcademicProject) => void;
  onSwitchToCoach: () => void;
}

/**
 * Calibrates assignment components and intellectual roles based on the selected mode:
 * - LEARN: More cognitive tasks assigned to student; AI provides explanations, hints, and practice; minimal direct AI completion.
 * - BALANCED: Mechanical tasks delegated to AI; student retains interpretation, reasoning, and key learning objectives.
 * - DEADLINE: AI handles more mechanical and supportive work; student is still shown the key concepts they should understand.
 */
function calibrateComponentsForMode(
  components: TaskComponent[],
  mode: AssistanceMode
): TaskComponent[] {
  return components.map((comp) => {
    if (mode === 'LEARN') {
      if (comp.classification === 'MECHANICAL') {
        return {
          ...comp,
          aiRole: 'Provides source search query templates, citation styles, and retrieval operators.',
          studentRole: 'Inspect sources, extract evidence manually, and populate tables to build research discipline.',
          learningValueExplanation: 'Elevated practice: Manual data compilation builds methodological rigor.',
        };
      } else if (comp.classification === 'SUPPORTIVE') {
        return {
          ...comp,
          classification: 'COGNITIVE' as ClassificationType,
          aiRole: 'Poses Socratic inquiry, provides formula hints, and quizzes conceptual understanding.',
          studentRole: 'Derive models, structure essay sections, and solve calculations independently.',
          learningValueExplanation: 'High learning value: Independent scaffolding solidifies conceptual mastery.',
        };
      } else {
        return {
          ...comp,
          classification: 'COGNITIVE' as ClassificationType,
          aiRole: 'Socratic challenger: critiques logical leaps, tests counter-theses, and gives active recall drills.',
          studentRole: 'Author 100% of thesis arguments, causal reasoning, and analytical conclusions.',
          learningValueExplanation: 'Maximum cognitive value: Core intellectual inquiry strictly reserved for you.',
        };
      }
    } else if (mode === 'DEADLINE') {
      if (comp.classification === 'MECHANICAL') {
        return {
          ...comp,
          classification: 'MECHANICAL' as ClassificationType,
          aiRole: 'Auto-extracts data tables, formats citations, and standardizes document styling.',
          studentRole: 'Quick sanity-check of key statistics and figures.',
          learningValueExplanation: 'Full automation: Zero time lost on administrative formatting.',
        };
      } else if (comp.classification === 'SUPPORTIVE') {
        return {
          ...comp,
          classification: 'SUPPORTIVE' as ClassificationType,
          aiRole: 'Generates ready-to-use outline templates, calculation spreadsheets, and draft frameworks.',
          studentRole: 'Review pre-populated structures and input your specific course takeaways.',
          learningValueExplanation: 'Accelerated execution: AI handles boilerplate while you review.',
        };
      } else {
        return {
          ...comp,
          classification: 'COGNITIVE' as ClassificationType,
          aiRole: 'Drafts structured analytical sections and highlights essential concepts you must understand.',
          studentRole: 'Review highlighted key takeaways, validate claims, and approve final conclusions.',
          learningValueExplanation: 'High-speed synthesis: Key concepts highlighted for rapid retention.',
        };
      }
    } else {
      // BALANCED MODE
      if (comp.classification === 'MECHANICAL') {
        return {
          ...comp,
          classification: 'MECHANICAL' as ClassificationType,
          aiRole: 'Standardizes references, formats datasets, and checks arithmetic consistency.',
          studentRole: 'Review compiled figures and verify relevance to grading prompt.',
          learningValueExplanation: 'Low learning value delegated to AI so you can preserve cognitive energy.',
        };
      } else if (comp.classification === 'SUPPORTIVE') {
        return {
          ...comp,
          classification: 'SUPPORTIVE' as ClassificationType,
          aiRole: 'Suggests section outline templates and verifies formula mechanics.',
          studentRole: 'Select which frameworks to apply and interpret the trends.',
          learningValueExplanation: 'Collaborative scaffolding: Speeds up progress without bypassing your thinking.',
        };
      } else {
        return {
          ...comp,
          classification: 'COGNITIVE' as ClassificationType,
          aiRole: 'Acts as Socratic challenger, checking logic and asking probing questions.',
          studentRole: 'Formulate core thesis, defend evidence, and author original arguments.',
          learningValueExplanation: 'High learning value protected: AI assists while you drive the academic reasoning.',
        };
      }
    }
  });
}

export const ProjectAnalysis: React.FC<ProjectAnalysisProps> = ({
  project,
  onMissionsGenerated,
  onSwitchToCoach,
}) => {
  const analysis = project.analysis;
  const initialMode: AssistanceMode =
    project.selectedMode || analysis?.recommendedMode || 'BALANCED';

  const [selectedMode, setSelectedMode] = useState<AssistanceMode>(initialMode);
  const [isBuildingPlan, setIsBuildingPlan] = useState(false);

  // Determine whether the study plan has already been generated
  const [hasBuiltPlan, setHasBuiltPlan] = useState<boolean>(
    Boolean(project.selectedMode && project.missions && project.missions.length > 0)
  );

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisType | undefined>(
    project.analysis
  );
  const [currentMissions, setCurrentMissions] = useState<Mission[]>(project.missions || []);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="text-slate-600">No cognitive analysis found for this project.</p>
        </div>
      </div>
    );
  }

  const studentProfile = getStudentProfile();
  const recommendedMode: AssistanceMode = analysis.recommendedMode || 'BALANCED';

  // Build recommendation explanation combining assignment and student profile context
  const getRecommendationExplanation = () => {
    if (analysis.modeRecommendationReason) {
      return analysis.modeRecommendationReason;
    }
    if (recommendedMode === 'LEARN') {
      return 'Based on your preference for conceptual depth and ample time before deadline. Maximizes intellectual challenge, quizzes, and self-derived arguments.';
    }
    if (recommendedMode === 'DEADLINE') {
      return 'Based on approaching due date and high volume of deliverables. Maximizes AI assistance on mechanical tasks while highlighting key concepts you need to grasp.';
    }
    return 'Based on assignment difficulty and your profile preferences. Balances automated data compilation with your core critical reasoning.';
  };

  const handleBuildStudyPlan = async () => {
    setIsBuildingPlan(true);
    try {
      // 1. Calibrate components for the selected mode
      const calibratedComponents = calibrateComponentsForMode(
        analysis.components,
        selectedMode
      );
      const calibratedAnalysis: AnalysisType = {
        ...analysis,
        components: calibratedComponents,
      };

      // 2. Generate project missions influenced by the selected mode
      const missions = await generateProjectMissions(
        calibratedAnalysis,
        selectedMode,
        studentProfile
      );

      // 3. Persist updated project with selectedMode, calibrated analysis, and missions
      const updated: AcademicProject = {
        ...project,
        selectedMode,
        status: 'in_progress',
        analysis: calibratedAnalysis,
        missions,
        currentMissionIndex: 0,
      };

      updateProject(updated);
      setCurrentAnalysis(calibratedAnalysis);
      setCurrentMissions(missions);
      setHasBuiltPlan(true);
    } catch (err) {
      console.error('Failed to build study plan:', err);
    } finally {
      setIsBuildingPlan(false);
    }
  };

  const handleStartExecution = () => {
    const updated: AcademicProject = {
      ...project,
      selectedMode,
      status: 'in_progress',
      analysis: currentAnalysis || analysis,
      missions: currentMissions,
      currentMissionIndex: 0,
    };
    updateProject(updated);
    onMissionsGenerated(updated);
  };

  const activeAnalysis = currentAnalysis || analysis;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {project.course}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {hasBuiltPlan ? `Plan Active (${selectedMode} Mode)` : 'Awaiting Mode Selection'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {activeAnalysis.projectTitle || project.title}
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            {activeAnalysis.whatToAccomplish}
          </p>
        </div>

        {hasBuiltPlan && (
          <button
            id="header-start-execution-btn"
            onClick={handleStartExecution}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span>Start Execution (Mission 1)</span>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
          </button>
        )}
      </div>

      {/* Meta Specs Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Estimated Effort
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1">{activeAnalysis.estimatedEffort}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            Difficulty
          </span>
          <p className="text-sm font-bold text-indigo-700 mt-1">{activeAnalysis.difficulty}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Deadline
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1">{activeAnalysis.deadline || project.deadline}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-slate-500" />
            Selected Strategy
          </span>
          <p className="text-sm font-bold text-purple-700 mt-1">
            {selectedMode} Mode
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MANDATED SECTION 1: MODE SELECTION APPEARS BEFORE ASSIGNMENT BREAKDOWN */}
      {/* Prominent heading: "How do you want to approach this?" */}
      {/* ========================================================================= */}
      <section
        id="mode-selection-section"
        className="bg-white border-2 border-indigo-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Assistance Strategy Configuration
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              How do you want to approach this?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Choose how much AI executes versus guides. StudAI will adapt the task decomposition and mission plan to your choice.
            </p>
          </div>

          {hasBuiltPlan && (
            <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Current Plan: {selectedMode}
            </span>
          )}
        </div>

        {/* StudAI Recommendation Banner */}
        <div
          id="studai-recommendation-banner"
          className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 text-indigo-950 flex items-start gap-3.5 shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-indigo-900 tracking-tight">
                StudAI recommends: {recommendedMode}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold uppercase tracking-wider">
                Personalized Recommendation
              </span>
              {selectedMode !== recommendedMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                  Custom Choice: {selectedMode}
                </span>
              )}
            </div>
            <p className="text-indigo-900/90 leading-relaxed font-normal text-xs pt-0.5">
              {getRecommendationExplanation()}
            </p>
          </div>
        </div>

        {/* The Three Modes Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MODE 1: LEARN MODE */}
          <div
            id="mode-card-learn"
            onClick={() => setSelectedMode('LEARN')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMode === 'LEARN'
                ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-4 ring-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  Deep Mastery
                </span>
                {selectedMode === 'LEARN' ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Selected
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">LEARN MODE</h3>

              <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-2 rounded-xl border border-slate-100">
                &ldquo;Maximum learning. StudAI teaches, explains, quizzes and gives hints. You perform most of the intellectual work.&rdquo;
              </p>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>More cognitive tasks assigned to the student</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>AI provides explanations, hints and practice</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Less direct completion by AI</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Ideal for foundational courses, exams, and core major subjects.
            </div>
          </div>

          {/* MODE 2: BALANCED MODE */}
          <div
            id="mode-card-balanced"
            onClick={() => setSelectedMode('BALANCED')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMode === 'BALANCED'
                ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-4 ring-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                  Standard Split
                </span>
                {selectedMode === 'BALANCED' ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Selected
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">BALANCED MODE</h3>

              <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-2 rounded-xl border border-slate-100">
                &ldquo;AI handles repetitive work while you perform the reasoning and interpretation.&rdquo;
              </p>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Mechanical tasks can be delegated to AI</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Student retains interpretation, reasoning and key learning objectives</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Scaffolding and checks for complex calculations</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Standard university productivity: data + arithmetic handled by AI, insights by you.
            </div>
          </div>

          {/* MODE 3: DEADLINE MODE */}
          <div
            id="mode-card-deadline"
            onClick={() => setSelectedMode('DEADLINE')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              selectedMode === 'DEADLINE'
                ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-4 ring-indigo-500/10'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                  High Velocity
                </span>
                {selectedMode === 'DEADLINE' ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-indigo-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    Selected
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-300" />
                )}
              </div>

              <h3 className="text-lg font-extrabold text-slate-900">DEADLINE MODE</h3>

              <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-2 rounded-xl border border-slate-100">
                &ldquo;Maximum assistance when time is limited. StudAI handles more of the work while highlighting what you should understand.&rdquo;
              </p>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>AI handles more mechanical and supportive work</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>Student is still shown the key concepts they should understand</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>Accelerated turnkey outlines and formatting</span>
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Rapid delivery under tight deadlines with executive concept summaries.
            </div>
          </div>
        </div>

        {/* Action Button: Build My Study Plan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-600">
            {hasBuiltPlan ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Active Study Plan built for <strong>{selectedMode} Mode</strong>. You can switch modes and rebuild at any time.
              </span>
            ) : (
              <span>
                Click below to calibrate the cognitive boundaries and generate your tailored mission plan based on <strong>{selectedMode} Mode</strong>.
              </span>
            )}
          </div>

          <button
            id="build-study-plan-btn"
            onClick={handleBuildStudyPlan}
            disabled={isBuildingPlan}
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 shrink-0 self-stretch sm:self-auto cursor-pointer"
          >
            {isBuildingPlan ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating {selectedMode} Study Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{hasBuiltPlan ? `Rebuild Study Plan (${selectedMode})` : 'Build My Study Plan'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MANDATED FLOW: ONLY AFTER MODE IS SELECTED & PLAN BUILT DO WE SHOW BREAKDOWN */}
      {/* ========================================================================= */}
      {!hasBuiltPlan ? (
        /* Pre-Selection Guide Placeholder */
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              Assignment Ready for Approach Calibration
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select how you want to approach this assignment in the section above and click{' '}
              <strong className="text-slate-900">Build My Study Plan</strong>. StudAI will decompose the tasks, define intellectual boundaries, and generate your step-by-step missions based on your chosen mode.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">1. Select Mode</span>
              <span className="text-slate-500 text-[11px]">Choose Learn, Balanced, or Deadline above.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">2. Build Study Plan</span>
              <span className="text-slate-500 text-[11px]">Generate the breakdown & AI boundaries.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <span className="font-bold text-slate-800 block mb-0.5">3. Execute Sprints</span>
              <span className="text-slate-500 text-[11px]">Tackle bite-sized missions with AI coaching.</span>
            </div>
          </div>
        </div>
      ) : (
        /* Post-Selection Detailed Assignment Breakdown & Missions influenced by mode */
        <div className="space-y-8">
          {/* Mode Influence Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 text-indigo-300">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white block">
                  Detailed Breakdown Influenced by {selectedMode} Mode
                </span>
                <span className="text-slate-300 text-[11px]">
                  {selectedMode === 'LEARN'
                    ? 'Elevated cognitive tasks assigned to you. StudAI acts as Socratic tutor providing hints, retrieval checks, and explanations.'
                    : selectedMode === 'DEADLINE'
                    ? 'Maximum assistance velocity. StudAI automates mechanical formatting and scaffolds supportive work while highlighting key concepts to master.'
                    : 'Balanced collaboration. Repetitive mechanical tasks delegated to StudAI while you retain interpretation, reasoning, and key learning objectives.'}
                </span>
              </div>
            </div>

            <button
              onClick={handleStartExecution}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Begin Execution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Deliverables & Learning Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Core Deliverables
              </h3>
              <ul className="space-y-2">
                {activeAnalysis.deliverables.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Learning Objectives Protected ({selectedMode} Mode)
              </h3>
              <ul className="space-y-2">
                {activeAnalysis.learningObjectives.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Friction Risks */}
          {activeAnalysis.risksAndFriction && activeAnalysis.risksAndFriction.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-900 uppercase tracking-wider">
                  Anticipated Execution Friction & Pitfalls
                </span>
                <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                  {activeAnalysis.risksAndFriction.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Component Breakdown & Classification */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                  Academic Integrity & Cognitive Boundaries
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Task Decomposition ({selectedMode} Mode Calibration)
                </h2>
                <p className="text-xs text-slate-600">
                  StudAI classifies every element of the assignment so AI handles low-learning-value mechanical work while keeping the high-learning-value reasoning with you.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeAnalysis.components.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            comp.classification === 'COGNITIVE'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : comp.classification === 'SUPPORTIVE'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {comp.classification}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{comp.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 pt-0.5">{comp.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-slate-400">Value Assessment:</span>
                      <span className="text-xs font-medium text-slate-700 italic">
                        {comp.classification === 'COGNITIVE'
                          ? 'High Learning Value'
                          : comp.classification === 'SUPPORTIVE'
                          ? 'Moderate Value (Collaborative)'
                          : 'Low Learning Value (Automate)'}
                      </span>
                    </div>
                  </div>

                  {/* AI Handled vs You Handled Badges (Mandated in Prompt) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                      <Cpu className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block text-indigo-700">
                          AI Handled
                        </span>
                        <p className="text-slate-600 mt-0.5">{comp.aiRole}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/70 flex items-start gap-2.5">
                      <UserCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase text-[10px] tracking-wider block text-purple-800">
                          You Handled (Protected)
                        </span>
                        <p className="text-purple-950 font-medium mt-0.5">{comp.studentRole}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Academic Missions */}
          {currentMissions.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
                    <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                    Generated Execution Missions
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Step-by-Step Study Missions ({currentMissions.length} Sprints)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Calibrated specifically for {selectedMode} Mode and your preferred study pace.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {currentMissions.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {m.missionNumber}
                      </span>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              m.classification === 'COGNITIVE'
                                ? 'bg-purple-100 text-purple-800'
                                : m.classification === 'SUPPORTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {m.classification}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{m.description}</p>
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {m.estimatedMinutes} mins
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Zap className="w-3 h-3 text-amber-500" />
                            +{m.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleStartExecution}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-all shrink-0 self-start sm:self-center"
                    >
                      Start Mission
                    </button>
                  </div>
                ))}
              </div>

              {/* Ready to Execute Callout Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-base font-bold flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Study Plan Ready for Execution
                  </h4>
                  <p className="text-xs text-slate-300">
                    Your missions are calibrated for {selectedMode} Mode. Jump into Mission 1 with your personalized AI study coach.
                  </p>
                </div>
                <button
                  id="bottom-start-execution-btn"
                  onClick={handleStartExecution}
                  className="px-7 py-3 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Begin Execution Now</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
