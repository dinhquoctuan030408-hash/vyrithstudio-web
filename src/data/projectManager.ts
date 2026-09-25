import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread, FeedbackMessage } from './config';

const PROJECTS_STORAGE_KEY = 'vyrith_custom_projects';
const APPS_STORAGE_KEY = 'vyrith_custom_apps';
const FEEDBACK_STORAGE_KEY = 'vyrith_feedback_threads';

// Projects
export const getLiveProjects = (): UpcomingProject[] => {
  if (typeof window === 'undefined') return STUDIO_CONFIG.upcomingProjects;
  try {
    const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return STUDIO_CONFIG.upcomingProjects;
};

export const getLiveProjectById = (id: string): UpcomingProject | undefined => {
  return getLiveProjects().find(p => p.id === id);
};

export const saveLiveProjects = (projects: UpcomingProject[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

// Apps
export const getLiveApps = (): AppItem[] => {
  if (typeof window === 'undefined') return STUDIO_CONFIG.activeApps;
  try {
    const saved = localStorage.getItem(APPS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return STUDIO_CONFIG.activeApps;
};

export const saveLiveApps = (apps: AppItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
};

// Feedback Threads
export const getFeedbackThreads = (): FeedbackThread[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const saveFeedbackThreads = (threads: FeedbackThread[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(threads));
};

export const sendUserFeedback = (user: { id: string; name: string; email: string; avatar: string }, content: string): FeedbackMessage => {
  const threads = getFeedbackThreads();
  let thread = threads.find(t => t.userId === user.id);

  const newMsg: FeedbackMessage = {
    id: 'msg_' + Date.now().toString(36),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userAvatar: user.avatar,
    content: content.trim(),
    timestamp: Date.now(),
    sender: 'user'
  };

  if (!thread) {
    thread = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.avatar,
      pinned: false,
      messages: [newMsg]
    };
    threads.unshift(thread);
  } else {
    thread.userName = user.name;
    thread.userAvatar = user.avatar;
    thread.messages.push(newMsg);
  }

  saveFeedbackThreads(threads);
  return newMsg;
};

export const replyFeedbackMessage = (userId: string, content: string): FeedbackMessage => {
  const threads = getFeedbackThreads();
  const thread = threads.find(t => t.userId === userId);

  const replyMsg: FeedbackMessage = {
    id: 'reply_' + Date.now().toString(36),
    userId: STUDIO_CONFIG.founder.uid,
    userName: STUDIO_CONFIG.founder.name,
    userEmail: STUDIO_CONFIG.founder.email,
    userAvatar: STUDIO_CONFIG.founder.avatar,
    content: content.trim(),
    timestamp: Date.now(),
    sender: 'founder'
  };

  if (thread) {
    thread.messages.push(replyMsg);
    saveFeedbackThreads(threads);
  }

  return replyMsg;
};