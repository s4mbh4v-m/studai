import React from 'react';
import {
  Sparkles,
  PlusCircle,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight,
  Calendar,
  AlertCircle,
  UserCheck,
  Sliders
} from 'lucide-react';
import { AcademicProject, StudentProfile, Mission } from '../types';

export interface DashboardProps {
  projects: AcademicProject[];
  activeProject?: AcademicProject | null;
  profile?: StudentProfile;
  onSelectProject?: (id: string) => void;
  onNavigate?: (view: 'dashboard' | 'new_project' | 'analysis' | 'execution' | 'coach' | 'progress' | 'profile') => void;
  onNewProject?: () => void;
  onOpenCoach?: (query?: string) => void;
  onOpenEditProfile?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects = [],
  activeProject,
  profile,
  onSelectProject,
  onNavigate,
  onNewProject,
  onOpenCoach,
  onOpenEditProfile,
}) => {
  const navigateTo = (view: 'dashboard' | 'new_project' | 'analysis' | 'execution' | 'coach' | 'progress' | 'profile') => {
    if (onNavigate) {
      onNavigate(view);
    } else if (view === 'new_project' && onNewProject) {
      onNewProject();
    }
  };

  const handleSelect = (id: string) => {
    if (onSelectProject) {
      onSelectProject(id);
    }
  };

  // Collect uncompleted missions across active projects
  const activeMissions: { project: AcademicProject; mission: Mission }[] = [];
  projects.forEach((p) => {
    if (p.missions) {
      p.missions.forEach((m) => {
        if (!m.completed && activeMissions.length < 4) {
          activeMissions.push({ project: p, mission: m });
        }
      });
    }
  });

  const totalMissionsAll = projects.reduce((acc, p) => acc + (p.missions?.length || 0), 0);
  const completedMissionsAll = projects.reduce(
    (acc, p) => acc + (p.missions ? p.missions.filter((m) => m.completed).length : 0),
    0
  );
  const overallPercentage = totalMissionsAll > 0 ? Math.round((completedMissionsAll / totalMissionsAll) * 100) : 0;

  const studentName = profile?.name ? profile.name.split(' ')[0] : 'Student';
  const xp = profile?.xp ?? 0;
  const streak = profile?.streakDays ?? 0;
  const missionsDone = profile?.missionsCompleted ?? completedMissionsAll;
  const pace = profile?.preferredSessionLengthMinutes ?? 15;
  const insights = profile?.behavioralInsights && profile.behavioralInsights.length > 0
    ? profile.behavioralInsights
    : [
        'Your execution speed doubles when initial milestones are broken into <15 minute micro-actions.',
        'You demonstrate highest cognitive synthesis when provided with parallel worked examples before drafting.',
      ];
  const strongDomains = profile?.strongSubjects && profile.strongSubjects.length > 0
    ? profile.strongSubjects
    : ['Quantitative Ratio Analysis', 'SEC Financial Filings'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            StudAI Academic Execution Engine Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {studentName}.
          </h1>
          <p className="text-slate-600 text-base mt-1 font-normal">
            What are we working on today? Let&apos;s automate the mechanical work and protect your core learning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-edit-profile-hero-btn"
            onClick={() => {
              if (onOpenEditProfile) {
                onOpenEditProfile();
              } else {
                navigateTo('profile');
              }
            }}
            className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            Edit Profile
          </button>
          <button
            id="dashboard-new-task-btn"
            onClick={() => navigateTo('new_project')}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            + New Academic Task
          </button>
        </div>
      </div>

      {/* Global Academic Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total XP</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Zap className="w-4 h-4 fill-indigo-600" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{xp}</div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Cognitive Mastery Points</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{streak} Days</div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Consecutive execution</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missions Done</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{missionsDone}</div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{overallPercentage}% overall curriculum</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Pace</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{pace} min</div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Optimal sprint interval</p>
          </div>
        </div>
      </div>

      {/* "StudyOS noticed..." Section (Prompt Mandate) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
            <Brain className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                StudyOS noticed...
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Real-time learning pattern</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {insights.slice(0, 2).map((insight, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-slate-200 flex items-start gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>&ldquo;{insight}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Projects & Today's Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Active Academic Projects</h2>
            </div>
            <button
              onClick={() => navigateTo('new_project')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              + Add Project
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const completedCount = proj.missions ? proj.missions.filter((m) => m.completed).length : 0;
              const totalCount = proj.missions?.length || 0;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const isSelected = activeProject?.id === proj.id;

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    handleSelect(proj.id);
                  }}
                  className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer hover:border-indigo-300 hover:shadow-md ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-xs'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {proj.course}
                        </span>
                        {proj.selectedMode && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {proj.selectedMode} Mode
                          </span>
                        )}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {proj.deadline}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{proj.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(proj.id);
                          navigateTo('execution');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
                      >
                        Launch Missions
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(proj.id);
                          navigateTo('analysis');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                      >
                        Analysis
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>
                        {completedCount} of {totalCount} missions executed
                      </span>
                      <span className="font-semibold text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Today's Missions & Learning Insights */}
        <div className="space-y-6">
          {/* Today's Missions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Missions</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Prioritized</span>
            </div>

            {activeMissions.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                All scheduled missions completed! Create a new task or review past assignments.
              </div>
            ) : (
              <div className="space-y-3">
                {activeMissions.map(({ project, mission }) => (
                  <div
                    key={mission.id}
                    onClick={() => {
                      handleSelect(project.id);
                      navigateTo('execution');
                    }}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-indigo-700">{project.course}</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {mission.estimatedMinutes}m
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {mission.title}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px]">
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded-md ${
                          mission.classification === 'COGNITIVE'
                            ? 'bg-purple-100 text-purple-700'
                            : mission.classification === 'SUPPORTIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {mission.classification}
                      </span>
                      <span className="font-semibold text-amber-600">+{mission.xpReward} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Profile & Personalization Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Profile & Personalization
                  </h4>
                  <p className="text-[11px] text-slate-500">Explicit preferences + inferred signals</p>
                </div>
              </div>
              <button
                id="dashboard-edit-profile-btn"
                onClick={() => {
                  if (onOpenEditProfile) {
                    onOpenEditProfile();
                  } else {
                    navigateTo('profile');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>

            {/* Explicit Preferences */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Your Explicit Preferences
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-600 block uppercase font-medium">Session Pace</span>
                  <span className="font-semibold text-slate-800">{pace} min sprints</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-600 block uppercase font-medium">Learning Style</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {profile?.preferredLearningStyle || 'Practice questions'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-600 block uppercase font-medium">AI Assist Level</span>
                  <span className="font-semibold text-slate-800">
                    {profile?.preferredAIAssistanceLevel || 'Balanced'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-600 block uppercase font-medium">Academic Standing</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {profile?.academicYear || 'Year 2'}
                  </span>
                </div>
              </div>
            </div>

            {/* Inferred StudyOS Insights */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                StudyOS Inferred Insights
              </div>
              <div className="space-y-2 text-xs text-slate-600 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/60">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-900 font-semibold">Strongest Domains:</strong>{' '}
                    {strongDomains.slice(0, 2).join(', ')}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-900 font-semibold">Top Unblock Tactic:</strong> Task decomposition (12 successful unblocks)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-slate-900 font-semibold">Integrity Shield:</strong> Protecting high-value synthesis across {missionsDone} missions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
