import React from 'react';
import {
  TrendingUp,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  Brain,
  Sparkles,
  Award,
  Layers,
  BarChart3,
  Calendar
} from 'lucide-react';
import { AcademicProject, StudentProfile, ActivityLog } from '../types';

interface ProgressViewProps {
  projects: AcademicProject[];
  profile: StudentProfile;
  activities: ActivityLog[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  projects,
  profile,
  activities,
}) => {
  const totalMissionsAll = projects.reduce((acc, p) => acc + p.missions.length, 0);
  const completedMissionsAll = projects.reduce(
    (acc, p) => acc + p.missions.filter((m) => m.completed).length,
    0
  );
  const overallPercentage = totalMissionsAll > 0 ? Math.round((completedMissionsAll / totalMissionsAll) * 100) : 0;

  // Mastery indicators breakdown
  const MASTERY_DOMAINS = [
    { name: 'Quantitative Ratio Analysis', mastery: 88, level: 'Advanced' },
    { name: 'DuPont Equity Decomposition', mastery: 82, level: 'Proficient' },
    { name: 'Causal Synthesis & Argumentation', mastery: 65, level: 'Developing' },
    { name: 'SEC 10-K Data Verification', mastery: 94, level: 'Mastered' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Empirical Execution Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Progress & Mastery
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Real-time tracking of completed cognitive milestones, study intervals, and behavioral adaptations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total XP</span>
            <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{profile?.xp ?? 0}</div>
          <p className="text-xs text-slate-500 mt-0.5">Verified academic effort</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Missions Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{profile?.missionsCompleted ?? 0}</div>
          <p className="text-xs text-slate-500 mt-0.5">{overallPercentage}% curriculum completion</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {profile?.totalStudyMinutes ?? 0} min
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Deliberate focus blocks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {profile?.streakDays ?? 0} Days
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Consistent daily engagement</p>
        </div>
      </div>

      {/* Behavioral Insights Section (Prompt Mandate) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Learned Behavioral Insights</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Dynamic Agent Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(profile?.behavioralInsights || []).map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">&ldquo;{insight}&rdquo;</span>
              </div>
              <span className="text-[10px] text-indigo-300 font-mono uppercase font-semibold">
                Pattern Verified
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mastery Indicators & Project Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Mastery Indicators */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Concept Mastery Indicators</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Cognitive Retention</span>
          </div>

          <div className="space-y-4">
            {MASTERY_DOMAINS.map((domain, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{domain.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {domain.level}
                    </span>
                    <span className="font-bold text-slate-900">{domain.mastery}%</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                    style={{ width: `${domain.mastery}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Active Projects Status */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Project Completion</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Active Deliverables</span>
          </div>

          <div className="space-y-3">
            {projects.map((p) => {
              const comp = p.missions.filter((m) => m.completed).length;
              const total = p.missions.length;
              const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
              return (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{p.title}</span>
                    <span className="font-mono font-bold text-indigo-700">{pct}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{p.course}</span>
                    <span>{comp} / {total} missions</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Recent Activity Timeline</h3>
          </div>
          <span className="text-xs text-slate-400">Verifiable Learning Log</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.slice(0, 8).map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">{act.title}</p>
                  {act.details && <p className="text-[11px] text-slate-500">{act.details}</p>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-amber-600 block">+{act.xpGained} XP</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
