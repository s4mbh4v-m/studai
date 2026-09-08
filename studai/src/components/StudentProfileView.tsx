import React, { useState } from 'react';
import {
  User,
  Zap,
  Flame,
  Clock,
  Shield,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Save,
  Check,
  GraduationCap,
  BookOpen,
  Target,
  FileText,
  HelpCircle,
  Brain
} from 'lucide-react';
import { StudentProfile, AssistanceMode, PreferredLearningStyle, PreferredAIAssistanceLevel } from '../types';
import { saveStudentProfile, resetDemoData } from '../lib/storage';
import { EditProfileModal } from './EditProfileModal';

interface StudentProfileViewProps {
  profile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onOpenEditProfile?: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  profile,
  onProfileUpdated,
  onOpenEditProfile,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleOpenEdit = () => {
    if (onOpenEditProfile) {
      onOpenEditProfile();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = (updated: StudentProfile) => {
    saveStudentProfile(updated);
    onProfileUpdated(updated);
    setIsEditModalOpen(false);
  };

  const handleResetDemo = () => {
    resetDemoData();
    window.location.reload();
  };

  const name = profile?.name || 'Jordan Vance';
  const major = profile?.major || 'Finance & Business Analytics';
  const university = profile?.university || 'University of Pennsylvania';
  const academicYear = profile?.academicYear || '3rd Year (Junior)';
  const subjects = profile?.subjectsOfStudy && profile.subjectsOfStudy.length > 0
    ? profile.subjectsOfStudy
    : (profile?.strongSubjects || ['Corporate Finance', 'Valuation Modeling', 'Econometrics']);
  const sessionLength = profile?.preferredSessionLengthMinutes ?? 15;
  const learningStyle = profile?.preferredLearningStyle || 'Practice questions';
  const aiAssistLevel = profile?.preferredAIAssistanceLevel || 'Balanced';
  const academicGoals = profile?.mainAcademicGoals || 'Maintain First-Class standing in Finance, master DCF and LBO modeling with minimal cognitive fatigue.';
  const triggers = profile?.procrastinationTriggers && profile.procrastinationTriggers.length > 0
    ? profile.procrastinationTriggers
    : ['Large/ambiguous tasks', 'Perfectionism', 'Anxiety about starting'];
  const otherNotes = profile?.otherStudyNotes || 'Prefers concrete worked examples and step-by-step guidance before tackling numerical problem sets. Thrives on short sprint milestones under 20 minutes.';

  const xp = profile?.xp ?? 0;
  const streakDays = profile?.streakDays ?? 0;
  const strongSubjects = profile?.strongSubjects || ['Financial Ratio Analysis', 'DCF Valuation'];
  const weakAreas = profile?.weakAreas || ['Weighted Average Cost of Capital (WACC)', 'LaTeX Formatting'];
  const commonFrictionPoints = profile?.commonFrictionPoints || [
    'Stalls on initial structure and financial framing.',
    'Overwhelmed by messy tables in 10-K filings.',
  ];
  const successfulInterventions = profile?.successfulInterventions || [
    { type: 'FIVE_MINUTE_START', count: 14 },
    { type: 'FOCUS_SPRINT', count: 11 },
    { type: 'TASK_DECOMPOSITION', count: 9 },
    { type: 'EXAMPLE_MODE', count: 8 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Prominent Edit Profile Button */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center text-xl font-extrabold shadow-inner">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{name}</h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                  Profile Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {major} • {university} • <span className="text-indigo-300">{academicYear}</span>
              </p>
            </div>
          </div>

          {/* Action & Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* PROMINENT EDIT PROFILE BUTTON */}
            <button
              id="profile-edit-button"
              onClick={handleOpenEdit}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Edit Profile</span>
            </button>

            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current XP</span>
              <span className="text-base font-bold text-indigo-300">{xp}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Streak</span>
              <span className="text-base font-bold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {streakDays}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Explicit Stated Preferences (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Stated Preferences</h3>
                <p className="text-xs text-slate-500">
                  Explicitly configured by you. StudyOS honors these in every mission.
                </p>
              </div>
            </div>

            {/* In-Card Edit Profile CTA */}
            <button
              id="profile-card-edit-btn"
              onClick={handleOpenEdit}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                Full Name
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{name}</span>
            </div>

            {/* Degree */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                Degree / Course
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">{major}</span>
            </div>

            {/* Academic Year */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                Current Academic Year
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{academicYear}</span>
            </div>

            {/* Preferred Session Length */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                Preferred Sprint Length
              </span>
              <span className="text-sm font-bold text-indigo-700 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {sessionLength} minutes
              </span>
            </div>

            {/* Preferred Learning Style */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                Preferred Learning Style
              </span>
              <span className="text-sm font-bold text-purple-700 mt-0.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {learningStyle}
              </span>
            </div>

            {/* AI Assistance Level */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
                AI Assistance Level
              </span>
              <span className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {aiAssistLevel} Mode
              </span>
            </div>
          </div>

          {/* Subjects of Study */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider">
              Subjects / Areas of Study
            </span>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Academic Goals */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              Main Academic Goals
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{academicGoals}</p>
          </div>

          {/* Procrastination Triggers */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-rose-800 block tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Known Procrastination Triggers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {triggers.map((trig, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-900 text-xs font-semibold"
                >
                  {trig}
                </span>
              ))}
            </div>
          </div>

          {/* Notes for StudyOS */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-600 block tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Additional Study Context
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">{otherNotes}</p>
          </div>
        </div>

        {/* Right Column: Inferred Cognitive Diagnostics & Friction Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">StudyOS Inferred Insights</h3>
                  <p className="text-[11px] text-slate-500">Learned from task unblocking and sprints</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                Autonomous
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-emerald-700 mb-2">
                  Demonstrated Cognitive Strengths
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {strongSubjects.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-amber-700 mb-2">
                  Cognitive Growth Areas (Protected Scaffolding)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {weakAreas.map((w, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 font-medium text-[11px]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-purple-700 mb-2">
                  Common Friction Triggers
                </span>
                <ul className="space-y-1.5 text-slate-600">
                  {commonFrictionPoints.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Intervention Success Tracking */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Adaptive Intervention Track Record</h3>
              <p className="text-xs text-slate-500">
                Interventions that effectively unblocked hesitation and catalyzed execution.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {successfulInterventions.map((si, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block truncate">
                    {si.type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 text-[11px]">
                    <span className="text-emerald-700 font-bold">{si.count} unblocks</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Reset Action */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Demonstration Reset Control
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Reset local database to pristine university demo scenario (Financial Analysis assignment with ready missions).
          </p>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-700 font-medium">Confirm reset?</span>
            <button
              onClick={handleResetDemo}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Yes, Reset
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        )}
      </div>

      {/* Modal is rendered here so clicking Edit Profile in this view always works */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
