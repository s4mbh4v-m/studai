import { AcademicProject, StudentProfile, ActivityLog, InterventionType, AssistanceMode } from '../types';
import { INITIAL_DEMO_PROJECT, INITIAL_STUDENT_PROFILE, INITIAL_ACTIVITY_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  PROJECTS: 'studai_projects_v1',
  ACTIVE_PROJECT_ID: 'studai_active_project_id_v1',
  PROFILE: 'studai_profile_v1',
  ACTIVITIES: 'studai_activities_v1',
};

// Simple event bus for reactivity across components
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStorage(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyChange() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

export function getProjects(): AcademicProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      const initial = [INITIAL_DEMO_PROJECT];
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [INITIAL_DEMO_PROJECT];
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load projects from storage:', err);
    return [INITIAL_DEMO_PROJECT];
  }
}

export function saveProjects(projects: AcademicProject[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    notifyChange();
  } catch (err) {
    console.error('Failed to save projects to storage:', err);
  }
}

export function getActiveProject(): AcademicProject {
  const projects = getProjects();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  const found = projects.find((p) => p.id === activeId);
  return found || projects[0] || INITIAL_DEMO_PROJECT;
}

export function setActiveProjectId(id: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
  notifyChange();
}

export function updateProject(updated: AcademicProject) {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === updated.id);
  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.unshift(updated);
  }
  saveProjects(projects);
}

export function addProject(newProject: AcademicProject) {
  const projects = getProjects();
  projects.unshift(newProject);
  saveProjects(projects);
  setActiveProjectId(newProject.id);
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  if (projects.length > 0) {
    setActiveProjectId(projects[0].id);
  }
}

export function getStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_STUDENT_PROFILE));
      return { ...INITIAL_STUDENT_PROFILE };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...INITIAL_STUDENT_PROFILE };
    }
    return {
      ...INITIAL_STUDENT_PROFILE,
      ...parsed,
      name: parsed.name || INITIAL_STUDENT_PROFILE.name,
      major: parsed.major || INITIAL_STUDENT_PROFILE.major,
      academicYear: parsed.academicYear || INITIAL_STUDENT_PROFILE.academicYear,
      subjectsOfStudy: Array.isArray(parsed.subjectsOfStudy) ? parsed.subjectsOfStudy : INITIAL_STUDENT_PROFILE.subjectsOfStudy,
      preferredSessionLengthMinutes: typeof parsed.preferredSessionLengthMinutes === 'number' ? parsed.preferredSessionLengthMinutes : INITIAL_STUDENT_PROFILE.preferredSessionLengthMinutes,
      preferredLearningStyle: parsed.preferredLearningStyle || INITIAL_STUDENT_PROFILE.preferredLearningStyle,
      preferredAIAssistanceLevel: parsed.preferredAIAssistanceLevel || INITIAL_STUDENT_PROFILE.preferredAIAssistanceLevel,
      preferredLearningMode: parsed.preferredLearningMode || INITIAL_STUDENT_PROFILE.preferredLearningMode,
      mainAcademicGoals: typeof parsed.mainAcademicGoals === 'string' ? parsed.mainAcademicGoals : INITIAL_STUDENT_PROFILE.mainAcademicGoals,
      procrastinationTriggers: Array.isArray(parsed.procrastinationTriggers) ? parsed.procrastinationTriggers : INITIAL_STUDENT_PROFILE.procrastinationTriggers,
      otherStudyNotes: typeof parsed.otherStudyNotes === 'string' ? parsed.otherStudyNotes : INITIAL_STUDENT_PROFILE.otherStudyNotes,
      behavioralInsights: Array.isArray(parsed.behavioralInsights) ? parsed.behavioralInsights : INITIAL_STUDENT_PROFILE.behavioralInsights,
      strongSubjects: Array.isArray(parsed.strongSubjects) ? parsed.strongSubjects : INITIAL_STUDENT_PROFILE.strongSubjects,
      weakAreas: Array.isArray(parsed.weakAreas) ? parsed.weakAreas : INITIAL_STUDENT_PROFILE.weakAreas,
      commonFrictionPoints: Array.isArray(parsed.commonFrictionPoints) ? parsed.commonFrictionPoints : INITIAL_STUDENT_PROFILE.commonFrictionPoints,
      successfulInterventions: Array.isArray(parsed.successfulInterventions) ? parsed.successfulInterventions : INITIAL_STUDENT_PROFILE.successfulInterventions,
      learningPreferences: Array.isArray(parsed.learningPreferences) ? parsed.learningPreferences : INITIAL_STUDENT_PROFILE.learningPreferences,
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : INITIAL_STUDENT_PROFILE.streakDays,
      xp: typeof parsed.xp === 'number' ? parsed.xp : INITIAL_STUDENT_PROFILE.xp,
      missionsCompleted: typeof parsed.missionsCompleted === 'number' ? parsed.missionsCompleted : INITIAL_STUDENT_PROFILE.missionsCompleted,
      totalStudyMinutes: typeof parsed.totalStudyMinutes === 'number' ? parsed.totalStudyMinutes : INITIAL_STUDENT_PROFILE.totalStudyMinutes,
    };
  } catch (err) {
    console.error('Failed to load profile:', err);
    return { ...INITIAL_STUDENT_PROFILE };
  }
}

export function saveStudentProfile(profile: StudentProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    notifyChange();
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

export function getActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITY_LOGS));
      return INITIAL_ACTIVITY_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load activities:', err);
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
  try {
    const current = getActivityLogs();
    const newEntry: ActivityLog = {
      ...log,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    notifyChange();
  } catch (err) {
    console.error('Failed to add activity log:', err);
  }
}

// REAL-TIME LEARNING ENGINE: Updates the student model based on observed behavior
export function recordMissionCompletion(
  projectId: string,
  missionId: string,
  timeSpentMinutes: number
): { xpEarned: number; newTotalXp: number; streakDays: number } {
  const projects = getProjects();
  const projIndex = projects.findIndex((p) => p.id === projectId);
  if (projIndex < 0) return { xpEarned: 0, newTotalXp: 0, streakDays: 0 };

  const project = projects[projIndex];
  const missionIndex = project.missions.findIndex((m) => m.id === missionId);
  if (missionIndex < 0) return { xpEarned: 0, newTotalXp: 0, streakDays: 0 };

  const mission = project.missions[missionIndex];
  if (mission.completed) {
    return { xpEarned: 0, newTotalXp: getStudentProfile().xp, streakDays: getStudentProfile().streakDays };
  }

  mission.completed = true;
  mission.completedAt = new Date().toISOString();
  project.totalXpEarned = (project.totalXpEarned || 0) + mission.xpReward;

  // Advance current mission pointer if this was active
  if (project.currentMissionIndex === missionIndex && missionIndex < project.missions.length - 1) {
    project.currentMissionIndex = missionIndex + 1;
  }

  // Check if all completed
  if (project.missions.every((m) => m.completed)) {
    project.status = 'completed';
  }

  saveProjects(projects);

  // Update profile
  const profile = getStudentProfile();
  const xpEarned = mission.xpReward;
  profile.xp += xpEarned;
  profile.missionsCompleted += 1;
  profile.totalStudyMinutes += timeSpentMinutes;

  // Update average completion time rolling average
  profile.averageCompletionMinutes = Number(
    ((profile.averageCompletionMinutes * (profile.missionsCompleted - 1) + timeSpentMinutes) /
      profile.missionsCompleted).toFixed(1)
  );

  // Update Streak logic
  const todayStr = new Date().toISOString().split('T')[0];
  const lastActiveStr = profile.lastActiveDate ? profile.lastActiveDate.split('T')[0] : '';
  if (lastActiveStr !== todayStr) {
    // Check if yesterday or older
    const lastDate = new Date(profile.lastActiveDate || 0);
    const diffHours = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 48) {
      profile.streakDays += 1;
    } else {
      profile.streakDays = 1;
    }
    profile.lastActiveDate = new Date().toISOString();
  }

  // Real-time behavioral adaptations:
  if (timeSpentMinutes <= 15) {
    if (!profile.behavioralInsights.some((i) => i.includes('less than 15 minutes'))) {
      profile.behavioralInsights.unshift('You tend to complete tasks faster when the first step takes less than 15 minutes.');
    }
  }

  if (mission.classification === 'COGNITIVE' && mission.completed) {
    if (!profile.strongSubjects.includes(project.course)) {
      profile.strongSubjects.push(project.course);
    }
  }

  saveStudentProfile(profile);

  addActivityLog({
    type: 'mission_complete',
    title: `Completed: ${mission.title}`,
    xpGained: xpEarned,
    details: `${mission.classification} mission in ${project.course} (${timeSpentMinutes} mins)`,
  });

  return { xpEarned, newTotalXp: profile.xp, streakDays: profile.streakDays };
}

export function recordInterventionUsage(type: InterventionType, wasSuccessful: boolean) {
  const profile = getStudentProfile();
  const list = wasSuccessful ? profile.successfulInterventions : profile.unsuccessfulInterventions;
  const existing = list.find((i) => i.type === type);
  if (existing) {
    existing.count += 1;
  } else {
    list.push({ type, count: 1 });
  }

  // Real-time insight generation
  if (type === 'EXAMPLE_MODE' && wasSuccessful) {
    if (!profile.learningPreferences.includes('Worked examples before synthesis')) {
      profile.learningPreferences.push('Worked examples before synthesis');
    }
  }

  if (type === 'TASK_DECOMPOSITION' && wasSuccessful) {
    const decompositionInsight = 'Micro-decomposition reduces initial friction for complex academic prompts.';
    if (!profile.behavioralInsights.includes(decompositionInsight)) {
      profile.behavioralInsights.unshift(decompositionInsight);
    }
  }

  saveStudentProfile(profile);

  addActivityLog({
    type: 'intervention_used',
    title: `Anti-Procrastination: ${type.replace(/_/g, ' ')}`,
    xpGained: wasSuccessful ? 5 : 0,
    details: wasSuccessful ? 'Intervention successfully resolved learning friction' : 'Intervention bypassed or skipped',
  });
}

export function recordSprintCompletion(durationMinutes: number) {
  const profile = getStudentProfile();
  const xpReward = 15;
  profile.xp += xpReward;
  profile.totalStudyMinutes += durationMinutes;
  saveStudentProfile(profile);

  addActivityLog({
    type: 'sprint_complete',
    title: `${durationMinutes}-Minute Focus Sprint Completed`,
    xpGained: xpReward,
    details: `Uninterrupted deliberate study block finished.`,
  });

  return { xpEarned: xpReward, newTotalXp: profile.xp };
}

export function recordPracticeAnswer(isCorrect: boolean, conceptTitle: string) {
  if (isCorrect) {
    const profile = getStudentProfile();
    const xpReward = 20;
    profile.xp += xpReward;
    saveStudentProfile(profile);

    addActivityLog({
      type: 'practice_answered',
      title: `Retrieval Practice: ${conceptTitle}`,
      xpGained: xpReward,
      details: `Active recall test passed on first attempt.`,
    });

    return { xpEarned: xpReward, newTotalXp: profile.xp };
  }
  return { xpEarned: 0, newTotalXp: getStudentProfile().xp };
}

export function resetDemoData() {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([INITIAL_DEMO_PROJECT]));
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, INITIAL_DEMO_PROJECT.id);
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_STUDENT_PROFILE));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  notifyChange();
}
