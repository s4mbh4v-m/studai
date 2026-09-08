import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { NewProject } from './components/NewProject';
import { ProjectAnalysis } from './components/ProjectAnalysis';
import { ExecutionView } from './components/ExecutionView';
import { StudyCoach } from './components/StudyCoach';
import { ProgressView } from './components/ProgressView';
import { StudentProfileView } from './components/StudentProfileView';
import { EditProfileModal } from './components/EditProfileModal';
import {
  getProjects,
  getStudentProfile,
  saveStudentProfile,
  getActivityLogs,
} from './lib/storage';
import { AcademicProject, StudentProfile, ActivityLog, CoachMode } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'new_project' | 'analysis' | 'execution' | 'coach' | 'progress' | 'profile'
  >('dashboard');

  const [projects, setProjects] = useState<AcademicProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile>(getStudentProfile());
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);

  // Study coach context state
  const [coachInitialQuery, setCoachInitialQuery] = useState<string>('');
  const [coachInitialMode, setCoachInitialMode] = useState<CoachMode>('COACHING');

  // Load state from local storage on mount
  useEffect(() => {
    refreshAppData();
  }, []);

  const refreshAppData = () => {
    const loadedProjects = getProjects();
    const loadedProfile = getStudentProfile();
    const loadedActivities = getActivityLogs();

    setProjects(loadedProjects);
    setProfile(loadedProfile);
    setActivities(loadedActivities);

    // Default to first project if none selected
    if (!selectedProjectId && loadedProjects.length > 0) {
      setSelectedProjectId(loadedProjects[0].id);
    }
  };

  const currentProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  const currentMission =
    currentProject?.missions && currentProject.missions.length > 0
      ? currentProject.missions[currentProject.currentMissionIndex] || currentProject.missions[0]
      : null;

  const handleSelectProject = (projectOrId: AcademicProject | string) => {
    const id = typeof projectOrId === 'string' ? projectOrId : projectOrId.id;
    setSelectedProjectId(id);
    const proj = typeof projectOrId === 'string' ? projects.find((p) => p.id === id) : projectOrId;
    if (proj && proj.missions && proj.missions.length > 0) {
      setCurrentView('execution');
    } else {
      setCurrentView('analysis');
    }
  };

  const handleProjectCreated = (newProject: AcademicProject) => {
    refreshAppData();
    setSelectedProjectId(newProject.id);
    setCurrentView('analysis');
  };

  const handleMissionsGenerated = (updatedProject: AcademicProject) => {
    refreshAppData();
    setSelectedProjectId(updatedProject.id);
    setCurrentView('execution');
  };

  const handleOpenCoachWithContext = (query: string, mode: CoachMode = 'COACHING') => {
    setCoachInitialQuery(query);
    setCoachInitialMode(mode);
    setCurrentView('coach');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Universal App Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCoachInitialQuery('');
          setCurrentView(view);
        }}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        activeProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        profile={profile}
        xp={profile?.xp ?? 0}
        streakDays={profile?.streakDays ?? 0}
        currentCourse={currentProject?.course}
      />

      {/* Main View Body */}
      <main className="flex-1 pb-16">
        {currentView === 'dashboard' && (
          <Dashboard
            projects={projects}
            activeProject={currentProject}
            profile={profile}
            onSelectProject={handleSelectProject}
            onNavigate={(view) => setCurrentView(view)}
            onNewProject={() => setCurrentView('new_project')}
            onOpenCoach={(query) => handleOpenCoachWithContext(query || 'How do I start today?')}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}

        {currentView === 'new_project' && (
          <NewProject
            onProjectCreated={handleProjectCreated}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'analysis' && currentProject && (
          <ProjectAnalysis
            project={currentProject}
            onMissionsGenerated={handleMissionsGenerated}
            onSwitchToCoach={() => setCurrentView('coach')}
          />
        )}

        {currentView === 'execution' && currentProject && (
          <ExecutionView
            project={currentProject}
            onProjectUpdated={(updated) => {
              refreshAppData();
              setSelectedProjectId(updated.id);
            }}
            onOpenCoachWithContext={handleOpenCoachWithContext}
            onNavigate={(v) => setCurrentView(v as any)}
          />
        )}

        {currentView === 'coach' && (
          <StudyCoach
            project={currentProject}
            activeMission={currentMission}
            profile={profile}
            initialQuery={coachInitialQuery}
            initialMode={coachInitialMode}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            projects={projects}
            profile={profile}
            activities={activities}
          />
        )}

        {currentView === 'profile' && (
          <StudentProfileView
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />
        )}
      </main>

      {/* Global Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSave={(updated) => {
          saveStudentProfile(updated);
          setProfile(updated);
          setIsEditProfileOpen(false);
        }}
      />
    </div>
  );
}

