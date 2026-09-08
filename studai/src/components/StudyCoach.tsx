import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Brain,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Flame,
  ShieldCheck,
  SplitSquareVertical,
  RotateCcw,
  Zap,
  Check,
  X
} from 'lucide-react';
import { AcademicProject, Mission, CoachMode, CoachMessage, StudentProfile } from '../types';
import { askStudyCoach } from '../lib/api';
import { recordPracticeAnswer } from '../lib/storage';

interface StudyCoachProps {
  project: AcademicProject | null;
  activeMission: Mission | null;
  profile: StudentProfile;
  initialQuery?: string;
  initialMode?: CoachMode;
}

export const StudyCoach: React.FC<StudyCoachProps> = ({
  project,
  activeMission,
  profile,
  initialQuery,
  initialMode,
}) => {
  const [mode, setMode] = useState<CoachMode>(initialMode || 'COACHING');
  const [inputQuery, setInputQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'agent',
      timestamp: new Date().toISOString(),
      mode: 'COACHING',
      text: `### Welcome to your Academic Execution Coach 🎓\n\nI am synced to your current task: **${project?.title || 'Academic Assignment'}**${
        activeMission ? ` (Active Mission: **${activeMission.title}**)` : ''
      }.\n\nMy directive is to **automate mechanical friction** while **protecting your high-learning-value cognitive synthesis**. I won't write your conclusions for you, but I will provide Socratic hints, worked examples, active retrieval practice, and anti-procrastination interventions.\n\nHow can I help you move forward?`,
      suggestedActions: [
        { label: 'Explain this concept', action: 'explain' },
        { label: 'Give me a hint', action: 'hint' },
        { label: 'Test me with a quiz', action: 'test_me' },
        { label: 'Why am I procrastinating?', action: 'procrastination' },
        { label: 'Just do this for me', action: 'cheat_check' },
      ],
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery, initialMode || 'COACHING');
    }
  }, [initialQuery, initialMode]);

  const handleSendMessage = async (text: string, customMode?: CoachMode) => {
    if (!text.trim()) return;

    const chosenMode = customMode || mode;
    const userMsg: CoachMessage = {
      id: 'msg-user-' + Date.now(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      text,
      mode: chosenMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await askStudyCoach({
        query: text,
        project: project || undefined,
        currentMission: activeMission || undefined,
        mode: chosenMode,
        studentProfile: profile,
      });

      const agentMsg: CoachMessage = {
        id: 'msg-agent-' + Date.now(),
        sender: 'agent',
        timestamp: new Date().toISOString(),
        text: response.text || 'I am analyzing your query with pedagogical guardrails.',
        mode: response.mode || chosenMode,
        suggestedActions: response.suggestedActions,
        practiceQuestion: response.practiceQuestion,
      };

      if (response.mode) {
        setMode(response.mode);
      }

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Failed to get coach response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string, label: string) => {
    switch (action) {
      case 'explain':
        handleSendMessage('Explain this core concept simply.', 'TEACHING');
        break;
      case 'hint':
        handleSendMessage('Give me a Socratic hint without spoiling the answer.', 'HINT');
        break;
      case 'test_me':
        handleSendMessage('Test my understanding with an active recall question.', 'PRACTICE');
        break;
      case 'procrastination':
        handleSendMessage('Why am I procrastinating on this step and how do I unfreeze?', 'COACHING');
        break;
      case 'cheat_check':
        handleSendMessage('Can you just write this entire section for me?', 'COACHING');
        break;
      case 'breakdown':
        handleSendMessage('Break this step down into smaller 5-minute micro actions.', 'EXECUTION');
        break;
      case 'example':
        handleSendMessage('Show me a parallel worked example.', 'TEACHING');
        break;
      default:
        handleSendMessage(label, mode);
        break;
    }
  };

  const handleAnswerPractice = (msgId: string, selectedOptionIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === msgId && msg.practiceQuestion) {
          const isCorrect = selectedOptionIndex === msg.practiceQuestion.correctAnswerIndex;
          if (isCorrect) {
            recordPracticeAnswer(true, activeMission?.title || 'Academic Concept');
          }
          return {
            ...msg,
            practiceQuestion: {
              ...msg.practiceQuestion,
              userAnswerIndex: selectedOptionIndex,
              answered: true,
              isCorrect,
            },
          };
        }
        return msg;
      })
    );
  };

  const QUICK_PROMPTS = [
    { label: 'Explain this', query: 'Explain this academic concept clearly.', mode: 'TEACHING' as CoachMode },
    { label: "I'm stuck", query: "I'm stuck on this step and cannot get started.", mode: 'COACHING' as CoachMode },
    { label: 'Give me a hint', query: 'Give me a progressive hint.', mode: 'HINT' as CoachMode },
    { label: 'Test me', query: 'Test my knowledge with an active recall quiz question.', mode: 'PRACTICE' as CoachMode },
    { label: 'Break this down', query: 'Break this task into smaller 5-minute actions.', mode: 'EXECUTION' as CoachMode },
    { label: 'Show me an example', query: 'Show me a worked out example.', mode: 'TEACHING' as CoachMode },
    { label: 'Why am I procrastinating?', query: 'Why am I procrastinating on this task?', mode: 'COACHING' as CoachMode },
    { label: 'Help me focus', query: 'Help me enter a 15-minute deliberate focus state.', mode: 'EXECUTION' as CoachMode },
    { label: 'Just do this for me', query: 'Just do this for me and write the answer.', mode: 'COACHING' as CoachMode },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Active Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {project?.course || 'General Academic'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-indigo-700">
              {activeMission ? `Mission ${activeMission.missionNumber}: ${activeMission.title}` : 'General Coaching'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            StudyOS Academic Coach
          </h1>
        </div>

        {/* Coach Mode Selector Banner (Prompt Mandate) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
          {(['TEACHING', 'COACHING', 'HINT', 'PRACTICE', 'EXECUTION'] as CoachMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                mode === m
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Quick Prompts:
        </span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.query, qp.mode)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-700 whitespace-nowrap transition-all font-medium shadow-2xs"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs h-[500px] flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? 'You' : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className="space-y-3 flex-1">
                {msg.mode && msg.sender === 'agent' && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {msg.mode} MODE
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none prose prose-xs max-w-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                </div>

                {/* Interactive Practice Question (Active Recall & Retrieval Practice) */}
                {msg.practiceQuestion && (
                  <div className="p-4 rounded-2xl bg-white border-2 border-indigo-200 shadow-xs space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-indigo-600" />
                        Active Retrieval Practice
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        +20 XP on correct answer
                      </span>
                    </div>

                    <p className="font-semibold text-slate-900 text-sm">
                      {msg.practiceQuestion.question}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {msg.practiceQuestion.options.map((option, optIdx) => {
                        const isChosen = msg.practiceQuestion?.userAnswerIndex === optIdx;
                        const isCorrect = optIdx === msg.practiceQuestion?.correctAnswerIndex;
                        const answered = msg.practiceQuestion?.answered;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                        if (answered) {
                          if (isCorrect) {
                            style = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                          } else if (isChosen && !isCorrect) {
                            style = 'bg-red-50 border-red-300 text-red-900 line-through';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={answered}
                            onClick={() => handleAnswerPractice(msg.id, optIdx)}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${style}`}
                          >
                            <span>{option}</span>
                            {answered && isCorrect && (
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                            {answered && isChosen && !isCorrect && (
                              <X className="w-4 h-4 text-red-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {msg.practiceQuestion.answered && (
                      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-950">
                        <strong className="block mb-0.5">Pedagogical Explanation:</strong>
                        {msg.practiceQuestion.explanation}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(action.action, action.label)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-100 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span>Generating cognitive scaffolding...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask StudyOS (${mode} mode)... try "Give me a hint" or "Test me"`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
