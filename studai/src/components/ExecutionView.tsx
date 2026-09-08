import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  HelpCircle,
  SplitSquareVertical,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Cpu,
  UserCheck,
  ShieldCheck,
  Flame,
  FileText,
  Layers,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { AcademicProject, Mission } from '../types';
import { recordMissionCompletion, updateProject } from '../lib/storage';
import { AntiProcrastinationModal } from './AntiProcrastinationModal';

interface ExecutionViewProps {
  project: AcademicProject;
  onProjectUpdated: (updated: AcademicProject) => void;
  onOpenCoachWithContext: (query: string, mode?: any) => void;
  onNavigate: (view: 'dashboard' | 'analysis' | 'coach' | 'progress' | 'profile') => void;
}

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  project,
  onProjectUpdated,
  onOpenCoachWithContext,
  onNavigate,
}) => {
  const missions = project.missions;
  const currentIdx = project.currentMissionIndex;
  const mission = missions[currentIdx] || missions[0];

  const [activeTab, setActiveTab] = useState<'workspace' | 'hints' | 'example'>('workspace');
  const [studentNotes, setStudentNotes] = useState(mission?.notes || '');
  const [missionActive, setMissionActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionFeedback, setCompletionFeedback] = useState<{
    xp: number;
    newTotal: number;
    streak: number;
    remaining: number;
  } | null>(null);

  // Anti-procrastination modal
  const [isAntiProcrastinationOpen, setIsAntiProcrastinationOpen] = useState(false);

  // Progressive hint index
  const [hintRevealTier, setHintRevealTier] = useState<number>(0);

  if (!mission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-8 rounded-2xl bg-white border border-slate-200">
          <p className="text-slate-600">No missions generated yet.</p>
          <button
            onClick={() => onNavigate('analysis')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Go to Task Analysis
          </button>
        </div>
      </div>
    );
  }

  const handleToggleSubTask = (subTaskId: string) => {
    if (!mission.subTasks) return;
    const updatedSubtasks = mission.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    const updatedMission = { ...mission, subTasks: updatedSubtasks };
    const updatedMissions = [...missions];
    updatedMissions[currentIdx] = updatedMission;
    const updatedProject = { ...project, missions: updatedMissions };
    updateProject(updatedProject);
    onProjectUpdated(updatedProject);
  };

  const handleCompleteMission = () => {
    const timeSpent = mission.estimatedMinutes || 15;
    const res = recordMissionCompletion(project.id, mission.id, timeSpent);

    const remaining = missions.filter((m) => !m.completed && m.id !== mission.id).length;
    setCompletionFeedback({
      xp: res.xpEarned,
      newTotal: res.newTotalXp,
      streak: res.streakDays,
      remaining,
    });
    setShowCompletionModal(true);

    const updatedMissions = [...missions];
    updatedMissions[currentIdx] = { ...mission, completed: true, completedAt: new Date().toISOString() };
    const nextIdx = currentIdx < missions.length - 1 ? currentIdx + 1 : currentIdx;
    const updatedProj: AcademicProject = {
      ...project,
      missions: updatedMissions,
      currentMissionIndex: nextIdx,
      totalXpEarned: (project.totalXpEarned || 0) + res.xpEarned,
    };
    onProjectUpdated(updatedProj);
  };

  const handleNextMission = () => {
    setShowCompletionModal(false);
    if (currentIdx < missions.length - 1) {
      const updatedProj: AcademicProject = {
        ...project,
        currentMissionIndex: currentIdx + 1,
      };
      updateProject(updatedProj);
      onProjectUpdated(updatedProj);
      setHintRevealTier(0);
      setMissionActive(false);
    }
  };

  const handlePrevMission = () => {
    if (currentIdx > 0) {
      const updatedProj: AcademicProject = {
        ...project,
        currentMissionIndex: currentIdx - 1,
      };
      updateProject(updatedProj);
      onProjectUpdated(updatedProj);
      setHintRevealTier(0);
    }
  };

  const handleBreakDownFurther = () => {
    setIsAntiProcrastinationOpen(true);
  };

  const handleGiveHint = () => {
    setHintRevealTier((prev) => Math.min(prev + 1, (mission.hints?.length || 1) + 1));
    onOpenCoachWithContext(`Give me a graduated Socratic hint for Mission: ${mission.title}`, 'HINT');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Progress Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {project.course}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium truncate max-w-xs">{project.title}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Mission Execution Pipeline
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentIdx === 0}
            onClick={handlePrevMission}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl font-mono">
            MISSION {currentIdx + 1} OF {missions.length}
          </span>

          <button
            disabled={currentIdx === missions.length - 1}
            onClick={handleNextMission}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-50"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Dots Ribbon */}
      <div className="grid grid-cols-7 gap-2">
        {missions.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => {
              const updatedProj: AcademicProject = {
                ...project,
                currentMissionIndex: idx,
              };
              updateProject(updatedProj);
              onProjectUpdated(updatedProj);
            }}
            className={`p-2 rounded-xl text-left border transition-all text-xs ${
              idx === currentIdx
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100'
                : m.completed
                ? 'border-emerald-200 bg-emerald-50/40 text-emerald-800'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span>M{idx + 1}</span>
              {m.completed ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <span>{m.estimatedMinutes}m</span>
              )}
            </div>
            <p className="truncate font-medium mt-1 text-[11px] text-slate-900">{m.title}</p>
          </button>
        ))}
      </div>

      {/* Main Mission Execution Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  mission.classification === 'COGNITIVE'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : mission.classification === 'SUPPORTIVE'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {mission.classification}
              </span>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {mission.estimatedMinutes} minutes
              </span>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                +{mission.xpReward} XP
              </span>

              {mission.completed && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed
                </span>
              )}
            </div>

            {/* Cognitive Importance Meter */}
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span>Cognitive Importance:</span>
              <span
                className={`font-bold ${
                  mission.cognitiveImportance === 'HIGH'
                    ? 'text-purple-700'
                    : mission.cognitiveImportance === 'MEDIUM'
                    ? 'text-blue-700'
                    : 'text-slate-600'
                }`}
              >
                {mission.cognitiveImportance}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">
              MISSION {currentIdx + 1}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {mission.title}
            </h1>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Academic Integrity Role Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5" />
                AI Assistance Level (What StudyOS Does)
              </span>
              <p className="text-slate-700 leading-relaxed">{mission.aiAssistanceLevel}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-xs">
              <span className="font-bold text-purple-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                Student Action (Your Intellectual Ownership)
              </span>
              <p className="text-purple-950 font-medium leading-relaxed">{mission.studentAction}</p>
            </div>
          </div>
        </div>

        {/* Card Body: Interactive Workspace / Subtasks */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Subtasks checklist */}
          {mission.subTasks && mission.subTasks.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Actionable Micro-Steps
              </span>
              <div className="space-y-2">
                {mission.subTasks.map((st) => (
                  <label
                    key={st.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubTask(st.id)}
                      className="mt-0.5 w-4 h-4 rounded-md text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className={`font-medium ${st.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {st.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Student Scratchpad / Draft Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Your Work & Synthesis Notes
              </label>
              <span className="text-[11px] text-slate-400">Auto-saved to local memory</span>
            </div>
            <textarea
              rows={4}
              placeholder="Record your reasoning, draft paragraphs, or calculation notes here..."
              value={studentNotes}
              onChange={(e) => {
                setStudentNotes(e.target.value);
                const updatedMissions = [...missions];
                updatedMissions[currentIdx] = { ...mission, notes: e.target.value };
                const updatedProj = { ...project, missions: updatedMissions };
                updateProject(updatedProj);
              }}
              className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden font-mono leading-relaxed"
            />
          </div>

          {/* Revealed Socratic Hints (if any) */}
          {hintRevealTier > 0 && mission.hints && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                Socratic Hint Scaffolding
              </span>
              <div className="space-y-1.5 text-xs text-amber-900">
                {mission.hints.slice(0, hintRevealTier).map((h, i) => (
                  <div key={i} className="p-2 bg-white/70 rounded-lg border border-amber-100">
                    <strong>Hint {i + 1}:</strong> {h}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Support Actions Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => onOpenCoachWithContext(`Explain how to approach Mission ${mission.missionNumber}: ${mission.title}`, 'TEACHING')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              Ask StudyOS
            </button>

            <button
              onClick={handleBreakDownFurther}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-emerald-600" />
              Break This Down Further
            </button>

            <button
              onClick={handleGiveHint}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Give Me a Hint
            </button>

            <button
              onClick={() => setIsAntiProcrastinationOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-colors ml-auto"
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              I&apos;m Stuck / Procrastinating
            </button>
          </div>
        </div>

        {/* Card Footer: Primary Mission Execution Actions */}
        <div className="p-6 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {!missionActive ? (
              <button
                onClick={() => {
                  setMissionActive(true);
                  setIsAntiProcrastinationOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
              >
                Start Mission / Focus Sprint
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-900">Sprint in Progress</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCompleteMission}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Mission (+{mission.xpReward} XP)
          </button>
        </div>
      </div>

      {/* Mature Gamification Completion Modal (Prompt Mandate) */}
      {showCompletionModal && completionFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                Mission Complete
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {mission.title}
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Intellectual milestone achieved. Your cognitive synthesis is preserved.
              </p>
            </div>

            {/* Reward Stats Box */}
            <div className="grid grid-cols-3 gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward</span>
                <span className="text-base font-extrabold text-indigo-700">+{completionFeedback.xp} XP</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Streak</span>
                <span className="text-base font-extrabold text-amber-600 flex items-center justify-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  {completionFeedback.streak}d
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Remaining</span>
                <span className="text-base font-extrabold text-slate-800">
                  {completionFeedback.remaining}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 italic">
              &ldquo;{completionFeedback.remaining > 0
                ? `${completionFeedback.remaining} missions remaining in this project. You've maintained your streak.`
                : 'All missions complete! You have finished this academic deliverable.'}&rdquo;
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Stay on Mission
              </button>
              <button
                onClick={handleNextMission}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Next Mission
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Procrastination System Drawer/Modal */}
      <AntiProcrastinationModal
        mission={mission}
        isOpen={isAntiProcrastinationOpen}
        onClose={() => setIsAntiProcrastinationOpen(false)}
        onRequestHint={handleGiveHint}
        onRequestExample={() => onOpenCoachWithContext(`Show me a worked out example for ${mission.title}`, 'TEACHING')}
        onRequestPractice={() => onOpenCoachWithContext(`Test me with an active recall question for ${mission.title}`, 'PRACTICE')}
        onDeconstructMission={() => {
          // Add default micro subtasks if none existed
          if (!mission.subTasks || mission.subTasks.length === 0) {
            const newSubTasks = [
              { id: 'st-decomp-1', title: 'Open draft file & paste rubric constraints (2 min)', completed: false },
              { id: 'st-decomp-2', title: 'Isolate 2 primary factual metrics or references (3 min)', completed: false },
              { id: 'st-decomp-3', title: 'Author first draft paragraph (5 min)', completed: false },
            ];
            const updatedMissions = [...missions];
            updatedMissions[currentIdx] = { ...mission, subTasks: newSubTasks };
            const updatedProj = { ...project, missions: updatedMissions };
            updateProject(updatedProj);
            onProjectUpdated(updatedProj);
          }
        }}
      />
    </div>
  );
};
