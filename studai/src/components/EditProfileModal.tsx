import React, { useState } from 'react';
import {
  X,
  User,
  BookOpen,
  GraduationCap,
  Clock,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  FileText,
  Save,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import {
  StudentProfile,
  PreferredLearningStyle,
  PreferredAIAssistanceLevel,
  AssistanceMode
} from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updatedProfile: StudentProfile) => void;
}

const SESSION_LENGTH_OPTIONS = [
  { value: 5, label: '5 minutes', desc: 'Micro-start to bypass hesitation' },
  { value: 10, label: '10 minutes', desc: 'Fast initial momentum burst' },
  { value: 15, label: '15 minutes', desc: 'Recommended optimal sprint' },
  { value: 25, label: '25 minutes', desc: 'Classic Pomodoro focus block' },
  { value: 45, label: '45+ minutes', desc: 'Extended deep work session' },
];

const LEARNING_STYLE_OPTIONS: { style: PreferredLearningStyle; desc: string }[] = [
  { style: 'Examples', desc: 'Worked parallel case studies before drafting' },
  { style: 'Practice questions', desc: 'Retrieval drills and interactive quizzes' },
  { style: 'Explanations', desc: 'Clear conceptual breakdowns and causal mechanics' },
  { style: 'Reading', desc: 'Structured source texts, excerpts, and literature' },
  { style: 'Visual learning', desc: 'Diagrams, framework charts, and concept maps' },
  { style: 'Mixed', desc: 'Multi-modal adaptive combination' },
];

const AI_ASSISTANCE_OPTIONS: {
  level: PreferredAIAssistanceLevel;
  mode: AssistanceMode;
  tagline: string;
  desc: string;
}[] = [
  {
    level: 'Learn',
    mode: 'LEARN',
    tagline: 'Deep Cognitive Mastery',
    desc: 'Socratic questioning, guided hints, protect core learning at all costs.'
  },
  {
    level: 'Balanced',
    mode: 'BALANCED',
    tagline: 'Balanced Co-work',
    desc: 'Automates mechanical formatting; collaborates on outlines and analysis.'
  },
  {
    level: 'Deadline',
    mode: 'DEADLINE',
    tagline: 'High-Velocity Execution',
    desc: 'Rapid scaffolding, synthesized references, fast milestone acceleration.'
  },
];

const PROCRASTINATION_TRIGGER_OPTIONS = [
  'Large/ambiguous tasks',
  'Difficult material',
  'Boredom',
  'Distraction',
  'Perfectionism',
  'Anxiety about starting',
  'Low motivation',
  'Other',
];

const ACADEMIC_YEAR_OPTIONS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  "Master's / Graduate",
  'PhD / Doctorate',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  // Form State
  const [name, setName] = useState(profile.name || '');
  const [major, setMajor] = useState(profile.major || '');
  const [academicYear, setAcademicYear] = useState(profile.academicYear || '3rd Year (Junior)');
  const [subjectsText, setSubjectsText] = useState(
    (profile.subjectsOfStudy && profile.subjectsOfStudy.length > 0
      ? profile.subjectsOfStudy
      : profile.strongSubjects || []
    ).join(', ')
  );

  const [sessionLength, setSessionLength] = useState<number>(
    profile.preferredSessionLengthMinutes || 15
  );

  const [learningStyle, setLearningStyle] = useState<PreferredLearningStyle>(
    profile.preferredLearningStyle || 'Practice questions'
  );

  const [aiAssistanceLevel, setAiAssistanceLevel] = useState<PreferredAIAssistanceLevel>(
    profile.preferredAIAssistanceLevel || 'Balanced'
  );

  const [mainAcademicGoals, setMainAcademicGoals] = useState(
    profile.mainAcademicGoals || ''
  );

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(() => {
    if (profile.procrastinationTriggers && profile.procrastinationTriggers.length > 0) {
      return [...profile.procrastinationTriggers];
    }
    return ['Large/ambiguous tasks', 'Perfectionism'];
  });

  const [otherTriggerText, setOtherTriggerText] = useState('');
  const [otherNotes, setOtherNotes] = useState(profile.otherStudyNotes || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    if (!major.trim()) {
      setValidationError('Please enter your course or degree.');
      return;
    }

    // Parse subjects list
    const subjectsArray = subjectsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Map AI assistance level to mode
    let mappedMode: AssistanceMode = 'BALANCED';
    if (aiAssistanceLevel === 'Learn') mappedMode = 'LEARN';
    if (aiAssistanceLevel === 'Balanced') mappedMode = 'BALANCED';
    if (aiAssistanceLevel === 'Deadline') mappedMode = 'DEADLINE';

    // Compile triggers, including other trigger text if specified
    const finalTriggers = [...selectedTriggers];
    if (selectedTriggers.includes('Other') && otherTriggerText.trim()) {
      const otherIndex = finalTriggers.indexOf('Other');
      finalTriggers[otherIndex] = `Other: ${otherTriggerText.trim()}`;
    }

    const updatedProfile: StudentProfile = {
      ...profile,
      name: name.trim(),
      major: major.trim(),
      academicYear,
      subjectsOfStudy: subjectsArray.length > 0 ? subjectsArray : profile.subjectsOfStudy,
      preferredSessionLengthMinutes: sessionLength,
      preferredLearningStyle: learningStyle,
      preferredAIAssistanceLevel: aiAssistanceLevel,
      preferredLearningMode: mappedMode,
      mainAcademicGoals: mainAcademicGoals.trim(),
      procrastinationTriggers: finalTriggers,
      otherStudyNotes: otherNotes.trim(),
      // Also update observed preferences to mirror explicit student directives
      learningPreferences: [
        `Preferred style: ${learningStyle}`,
        `Sprints: ${sessionLength} minutes`,
        `Assistance level: ${aiAssistanceLevel}`,
      ],
    };

    onSave(updatedProfile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-profile-title" className="text-lg sm:text-xl font-bold tracking-tight">
                Edit Student Profile & Preferences
              </h2>
              <p className="text-xs text-slate-300">
                StudyOS prioritizes your explicit preferences when planning missions and coaching.
              </p>
            </div>
          </div>
          <button
            id="edit-profile-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Academic Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Academic Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="profile-input-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Course / Degree <span className="text-rose-500">*</span>
                </label>
                <input
                  id="profile-input-major"
                  type="text"
                  value={major}
                  onChange={(e) => {
                    setMajor(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. BSc Economics & Financial Computing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Current Academic Year
                </label>
                <select
                  id="profile-select-year"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  {ACADEMIC_YEAR_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Subjects / Areas of Study
                </label>
                <input
                  id="profile-input-subjects"
                  type="text"
                  value={subjectsText}
                  onChange={(e) => setSubjectsText(e.target.value)}
                  placeholder="e.g. Corporate Finance, Econometrics, Macro"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">Separate subject areas with commas</p>
              </div>
            </div>
          </div>

          {/* Section 2: Study Pace & Learning Style */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Preferred Study Session Length
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {SESSION_LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  id={`profile-session-${opt.value}`}
                  onClick={() => setSessionLength(opt.value)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    sessionLength === opt.value
                      ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 leading-tight block mt-1">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  3. Preferred Learning Style
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                {LEARNING_STYLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.style}
                    type="button"
                    id={`profile-style-${opt.style.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setLearningStyle(opt.style)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      learningStyle === opt.style
                        ? 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{opt.style}</span>
                      {learningStyle === opt.style && (
                        <Check className="w-3.5 h-3.5 text-purple-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 leading-snug">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Preferred AI Assistance Level */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Zap className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                4. Preferred AI Assistance Level
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AI_ASSISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.level}
                  type="button"
                  id={`profile-ai-${opt.level.toLowerCase()}`}
                  onClick={() => setAiAssistanceLevel(opt.level)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    aiAssistanceLevel === opt.level
                      ? 'border-indigo-600 bg-indigo-50/90 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                      {opt.level} Level
                    </span>
                    {aiAssistanceLevel === opt.level && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">{opt.tagline}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Main Academic Goals */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Target className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                5. Main Academic Goals
              </h3>
            </div>
            <textarea
              id="profile-input-goals"
              rows={2}
              value={mainAcademicGoals}
              onChange={(e) => setMainAcademicGoals(e.target.value)}
              placeholder="What are your key academic targets this semester? (e.g. Maintain First-Class Honours in Corporate Finance, master DCF modeling without burnout)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Section 5: Common Procrastination Triggers */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                6. Common Procrastination Triggers
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Select what usually triggers procrastination so StudyOS can deploy targeted interventions.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PROCRASTINATION_TRIGGER_OPTIONS.map((trigger) => {
                const isSelected =
                  selectedTriggers.includes(trigger) ||
                  (trigger === 'Other' && selectedTriggers.some((t) => t.startsWith('Other')));
                return (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => handleToggleTrigger(trigger)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-400/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    <span>{trigger}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {(selectedTriggers.includes('Other') ||
              selectedTriggers.some((t) => t.startsWith('Other'))) && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Specify other trigger:
                </label>
                <input
                  type="text"
                  value={otherTriggerText}
                  onChange={(e) => setOtherTriggerText(e.target.value)}
                  placeholder="e.g. Poor sleep, imposter syndrome, noisy environment"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-400/30"
                />
              </div>
            )}
          </div>

          {/* Section 6: Additional Student Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                7. Anything Else StudyOS Should Know About How You Study
              </h3>
            </div>
            <textarea
              id="profile-input-notes"
              rows={3}
              value={otherNotes}
              onChange={(e) => setOtherNotes(e.target.value)}
              placeholder="Tell StudyOS any specific habits, context, or learning preferences (e.g. I work better in early mornings; please challenge me with counter-examples; avoid walls of pure text)."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            id="edit-profile-cancel-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="edit-profile-save-btn"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile & Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
