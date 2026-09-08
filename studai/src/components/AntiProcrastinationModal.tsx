import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Brain,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowRight,
  HelpCircle,
  X,
  Target,
  FileCheck,
  Flame
} from 'lucide-react';
import { Mission, FrictionCause, InterventionType } from '../types';
import { recordInterventionUsage, recordSprintCompletion } from '../lib/storage';

interface AntiProcrastinationModalProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
  onDeconstructMission?: () => void;
  onRequestHint?: () => void;
  onRequestExample?: () => void;
  onRequestPractice?: () => void;
  onFocusSprintStarted?: (minutes: number) => void;
}

export const AntiProcrastinationModal: React.FC<AntiProcrastinationModalProps> = ({
  mission,
  isOpen,
  onClose,
  onDeconstructMission,
  onRequestHint,
  onRequestExample,
  onRequestPractice,
  onFocusSprintStarted,
}) => {
  const [selectedFriction, setSelectedFriction] = useState<FrictionCause | null>(null);
  const [activeIntervention, setActiveIntervention] = useState<InterventionType | null>(null);

  // Focus sprint timer state
  const [sprintMinutes, setSprintMinutes] = useState<number>(15);
  const [sprintSecondsRemaining, setSprintSecondsRemaining] = useState<number>(15 * 60);
  const [sprintRunning, setSprintRunning] = useState<boolean>(false);
  const [sprintComplete, setSprintComplete] = useState<boolean>(false);

  // Five-minute start state
  const [microCommitment, setMicroCommitment] = useState('');
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (sprintRunning && sprintSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSprintSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (sprintSecondsRemaining === 0 && sprintRunning) {
      setSprintRunning(false);
      setSprintComplete(true);
      recordSprintCompletion(sprintMinutes);
      recordInterventionUsage('FOCUS_SPRINT', true);
    }
    return () => clearInterval(interval);
  }, [sprintRunning, sprintSecondsRemaining, sprintMinutes]);

  if (!isOpen) return null;

  const FRICTIONS: { id: FrictionCause; label: string; diagnosis: string; recommended: InterventionType }[] = [
    {
      id: 'TASK_TOO_LARGE',
      label: '1. Task feels too large',
      diagnosis: 'Perceived scope is triggering cognitive paralysis and avoidance.',
      recommended: 'TASK_DECOMPOSITION',
    },
    {
      id: 'DONT_KNOW_WHERE_TO_START',
      label: '2. Don’t know where to start',
      diagnosis: 'First-sentence inertia. You need a zero-friction starting line.',
      recommended: 'FIVE_MINUTE_START',
    },
    {
      id: 'DONT_UNDERSTAND_MATERIAL',
      label: '3. Don’t understand the material',
      diagnosis: 'Conceptual knowledge gap making synthesis intimidating.',
      recommended: 'TEACHING_MODE',
    },
    {
      id: 'ANXIOUS_ABOUT_QUALITY',
      label: '4. Anxious about doing it badly',
      diagnosis: 'Perfectionism causing hesitance to write imperfect drafts.',
      recommended: 'REFRAME_MODE',
    },
    {
      id: 'DISTRACTED',
      label: '5. Distracted or attention fragmented',
      diagnosis: 'Low cognitive friction threshold inviting phone/browser browsing.',
      recommended: 'FOCUS_SPRINT',
    },
    {
      id: 'TASK_IS_BORING',
      label: '6. Task feels mechanical / boring',
      diagnosis: 'Low dopamine task. Needs gamified micro-sprint and AI offload.',
      recommended: 'FOCUS_SPRINT',
    },
    {
      id: 'LACK_MOTIVATION',
      label: '7. Lacks motivation / Why does this matter?',
      diagnosis: 'Disconnect between academic assignment and real-world utility.',
      recommended: 'REFRAME_MODE',
    },
    {
      id: 'TIRED',
      label: '8. Low energy / tired',
      diagnosis: 'Depleted executive function. High need for 5-min micro-action.',
      recommended: 'FIVE_MINUTE_START',
    },
  ];

  const handleSelectFriction = (cause: FrictionCause) => {
    setSelectedFriction(cause);
    const item = FRICTIONS.find((f) => f.id === cause);
    if (item) {
      setActiveIntervention(item.recommended);
    }
  };

  const startSprint = (minutes: number) => {
    setSprintMinutes(minutes);
    setSprintSecondsRemaining(minutes * 60);
    setSprintRunning(true);
    setSprintComplete(false);
    if (onFocusSprintStarted) onFocusSprintStarted(minutes);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Anti-Procrastination Intervention</h3>
              <p className="text-xs text-slate-500">Mission {mission.missionNumber}: {mission.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Diagnose Friction */}
          {!selectedFriction && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Step 1: Diagnose Friction
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  What is the primary friction stopping you right now?
                </h4>
                <p className="text-xs text-slate-600">
                  Procrastination is rarely laziness—it is a protective emotional response to cognitive ambiguity or friction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FRICTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFriction(f.id)}
                    className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all text-xs group"
                  >
                    <div className="font-bold text-slate-900 group-hover:text-indigo-700">
                      {f.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{f.diagnosis}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Selected Intervention Execution */}
          {selectedFriction && (
            <div className="space-y-5">
              {/* Back to diagnose */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedFriction(null);
                    setActiveIntervention(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                >
                  ← Change friction diagnosis
                </button>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Intervention: {activeIntervention?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* INTERVENTION: TASK DECOMPOSITION */}
              {activeIntervention === 'TASK_DECOMPOSITION' && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-indigo-950">
                      Task Decomposition: 3 Micro-Actions
                    </h4>
                    <p className="text-xs text-indigo-800">
                      Instead of tackling &ldquo;{mission.title}&rdquo; as a monolith, execute only the very first 3-minute sub-step:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 flex items-center justify-between">
                      <span>1. Open draft document & paste assignment rubric question</span>
                      <span className="text-[10px] font-bold text-indigo-600">2 min</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 flex items-center justify-between">
                      <span>2. Highlight the 2 most contrasting data points or arguments</span>
                      <span className="text-[10px] font-bold text-indigo-600">3 min</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 flex items-center justify-between">
                      <span>3. Write a 1-sentence draft hypothesis</span>
                      <span className="text-[10px] font-bold text-indigo-600">5 min</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      recordInterventionUsage('TASK_DECOMPOSITION', true);
                      if (onDeconstructMission) onDeconstructMission();
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Apply Micro-Steps to Mission Plan
                  </button>
                </div>
              )}

              {/* INTERVENTION: FIVE-MINUTE START */}
              {activeIntervention === 'FIVE_MINUTE_START' && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-950">
                      The Five-Minute Micro-Start Rule
                    </h4>
                    <p className="text-xs text-emerald-800">
                      You are NOT required to complete the entire mission. You only need to work for exactly 5 minutes.
                      If you want to stop after 5 minutes, you have permission to stop. (92% of students continue).
                    </p>
                  </div>

                  {!committed ? (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Commit to ONE simple sentence you will type right now:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 'Apple gross margins expanded primarily due to services revenue mix.'"
                        value={microCommitment}
                        onChange={(e) => setMicroCommitment(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white outline-hidden focus:border-emerald-500"
                      />
                      <button
                        disabled={!microCommitment.trim()}
                        onClick={() => {
                          setCommitted(true);
                          recordInterventionUsage('FIVE_MINUTE_START', true);
                          startSprint(5);
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Lock in 5-Minute Micro-Sprint
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-center">
                      <div className="text-3xl font-mono font-bold text-emerald-900">
                        {formatTimer(sprintSecondsRemaining)}
                      </div>
                      <p className="text-xs text-emerald-800">
                        Focus purely on your sentence: &ldquo;{microCommitment}&rdquo;
                      </p>
                      <button
                        onClick={onClose}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                      >
                        Return to Mission & Execute
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* INTERVENTION: FOCUS SPRINT */}
              {activeIntervention === 'FOCUS_SPRINT' && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        Focused Deliberate Practice Sprint
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Close all distracting tabs. Uninterrupted academic focus block.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-400">+15 XP on finish</span>
                  </div>

                  {/* Timer Display */}
                  <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-wider text-indigo-300">
                      {formatTimer(sprintSecondsRemaining)}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {sprintRunning ? 'Sprint active — protect your attention' : 'Sprint paused'}
                    </p>
                  </div>

                  {/* Sprint Duration Selector */}
                  {!sprintRunning && !sprintComplete && (
                    <div className="flex items-center justify-center gap-2">
                      {[5, 10, 15, 25].map((m) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSprintMinutes(m);
                            setSprintSecondsRemaining(m * 60);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            sprintMinutes === m
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white/10 text-slate-300 hover:bg-white/20'
                          }`}
                        >
                          {m} Min
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timer Controls */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {sprintRunning ? (
                      <button
                        onClick={() => setSprintRunning(false)}
                        className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause Timer
                      </button>
                    ) : (
                      <button
                        onClick={() => setSprintRunning(true)}
                        className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Start {sprintMinutes}-Min Sprint
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSprintRunning(false);
                        setSprintSecondsRemaining(sprintMinutes * 60);
                      }}
                      className="p-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 text-xs"
                      title="Reset Sprint"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* INTERVENTION: REFRAME MODE */}
              {activeIntervention === 'REFRAME_MODE' && (
                <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-purple-950">
                      Cognitive Reframe: Why this mission matters
                    </h4>
                    <p className="text-xs text-purple-800">
                      When we are anxious about grades, our working memory drops by ~30%. Let&apos;s shift the frame:
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-800">
                    <div className="p-3 bg-white rounded-xl border border-purple-100">
                      <strong>1. Permitted Imperfection:</strong> A mediocre first draft can be revised; a blank screen cannot. Write rough bullet points first.
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-purple-100">
                      <strong>2. Real-World Currency:</strong> The ability to interpret messy data and formulate a defensible opinion is the exact skill top employers and researchers pay for.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      recordInterventionUsage('REFRAME_MODE', true);
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    I&apos;m Ready: Return to Mission with Fresh Lens
                  </button>
                </div>
              )}

              {/* Quick alternatives */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    recordInterventionUsage('HINT_MODE', true);
                    if (onRequestHint) onRequestHint();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Give Me a Socratic Hint
                </button>

                <button
                  onClick={() => {
                    recordInterventionUsage('EXAMPLE_MODE', true);
                    if (onRequestExample) onRequestExample();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 flex items-center gap-1"
                >
                  <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Show Worked Example
                </button>

                <button
                  onClick={() => {
                    recordInterventionUsage('PRACTICE_MODE', true);
                    if (onRequestPractice) onRequestPractice();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 flex items-center gap-1"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-500" />
                  Test Me (Active Recall)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
