import React from 'react';
import {
  Brain,
  Compass,
  PlusCircle,
  Flame,
  Zap,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  User,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { AcademicProject, StudentProfile } from '../types';

export interface NavbarProps {
  currentView: 'dashboard' | 'new_project' | 'analysis' | 'execution' | 'coach' | 'progress' | 'profile';
  onNavigate: (view: 'dashboard' | 'new_project' | 'analysis' | 'execution' | 'coach' | 'progress' | 'profile') => void;
  onOpenEditProfile?: () => void;
  activeProject?: AcademicProject | null;
  projects?: AcademicProject[];
  onSelectProject?: (id: string) => void;
  profile?: StudentProfile;
  xp?: number;
  streakDays?: number;
  currentCourse?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenEditProfile,
  activeProject,
  projects = [],
  onSelectProject,
  profile,
  xp,
  streakDays,
  currentCourse,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = React.useState(false);

  const displayStreak = profile?.streakDays ?? streakDays ?? 0;
  const displayXp = profile?.xp ?? xp ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            id="nav-brand-button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-lg">StudAI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Adaptive Academic OS
              </p>
            </div>
          </button>

          {/* Active Project Switcher Dropdown */}
          {activeProject && projects.length > 0 && (
            <div className="relative hidden md:block">
              <button
                id="nav-project-dropdown-btn"
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-xs font-medium text-slate-700 transition-colors max-w-[240px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{activeProject.title}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
              </button>

              {projectMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProjectMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-20">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Academic Tasks
                    </div>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          if (onSelectProject) onSelectProject(p.id);
                          setProjectMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          p.id === activeProject.id ? 'bg-indigo-50/60 font-semibold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate font-medium">{p.title}</p>
                          <p className="text-[10px] text-slate-500">{p.course}</p>
                        </div>
                        {p.selectedMode && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase font-mono">
                            {p.selectedMode}
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        onClick={() => {
                          onNavigate('new_project');
                          setProjectMenuOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        New Academic Task
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Center Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600">
          <button
            id="nav-tab-dashboard"
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>

          {activeProject && (
            <>
              <button
                id="nav-tab-execution"
                onClick={() => onNavigate('execution')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'execution'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Execution View
              </button>

              <button
                id="nav-tab-analysis"
                onClick={() => onNavigate('analysis')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'analysis'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                Task Analysis
              </button>
            </>
          )}

          <button
            id="nav-tab-coach"
            onClick={() => onNavigate('coach')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'coach'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Study Coach
          </button>

          <button
            id="nav-tab-progress"
            onClick={() => onNavigate('progress')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'progress'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            Progress
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => onNavigate('profile')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'profile'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-500" />
            Profile
          </button>
        </nav>

        {/* Right Stats & Action */}
        <div className="flex items-center gap-2.5">
          {/* Streak indicator */}
          <div
            id="nav-streak-badge"
            title={`${displayStreak} day study streak!`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{displayStreak}d</span>
          </div>

          {/* XP indicator */}
          <div
            id="nav-xp-badge"
            title={`${displayXp} Academic XP Earned`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
            <span>{displayXp} XP</span>
          </div>

          {/* Edit Profile Button in Top Nav */}
          <button
            id="nav-edit-profile-btn"
            onClick={() => {
              if (onOpenEditProfile) {
                onOpenEditProfile();
              } else {
                onNavigate('profile');
              }
            }}
            title="Edit Student Profile & Preferences"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 text-slate-800 hover:text-indigo-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {(profile?.name || 'J')[0]}
            </div>
            <span className="hidden md:inline font-semibold">Edit Profile</span>
          </button>

          {/* New Task CTA */}
          <button
            id="nav-new-task-btn"
            onClick={() => onNavigate('new_project')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ New Academic Task</span>
            <span className="sm:hidden">+ New</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden border-t border-slate-200/60 px-4 py-2 flex items-center justify-around bg-slate-50/70 text-[11px] font-medium text-slate-600">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`px-2 py-1 rounded-md ${currentView === 'dashboard' ? 'text-indigo-600 font-bold' : ''}`}
        >
          Dashboard
        </button>
        {activeProject && (
          <button
            onClick={() => onNavigate('execution')}
            className={`px-2 py-1 rounded-md ${currentView === 'execution' ? 'text-indigo-600 font-bold' : ''}`}
          >
            Execution
          </button>
        )}
        {activeProject && (
          <button
            onClick={() => onNavigate('analysis')}
            className={`px-2 py-1 rounded-md ${currentView === 'analysis' ? 'text-indigo-600 font-bold' : ''}`}
          >
            Analysis
          </button>
        )}
        <button
          onClick={() => onNavigate('coach')}
          className={`px-2 py-1 rounded-md ${currentView === 'coach' ? 'text-indigo-600 font-bold' : ''}`}
        >
          Coach
        </button>
        <button
          onClick={() => onNavigate('progress')}
          className={`px-2 py-1 rounded-md ${currentView === 'progress' ? 'text-indigo-600 font-bold' : ''}`}
        >
          Progress
        </button>
        <button
          onClick={() => onNavigate('profile')}
          className={`px-2 py-1 rounded-md ${currentView === 'profile' ? 'text-indigo-600 font-bold' : ''}`}
        >
          Profile
        </button>
      </div>
    </header>
  );
};
