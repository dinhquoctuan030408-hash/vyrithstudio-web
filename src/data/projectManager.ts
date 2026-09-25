import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread, FeedbackMessage } from './config';

const PROJECTS_STORAGE_KEY = 'vyrith_custom_projects';
const APPS_STORAGE_KEY = 'vyrith_custom_apps';
const FEEDBACK_STORAGE_KEY = 'vyrith_feedback_threads';

// 1. PROJECTS
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

// Tìm kiếm project đồng bộ
export const getLiveProjectById = (id: string): UpcomingProject | undefined => {
  const projects = getLiveProjects();
  return projects.find(p => p.id === id);
};

// Tìm kiếm project có fetch dữ liệu mới nhất từ Cloud nếu chưa thấy trong cache
export const fetchProjectById = async (id: string): Promise<UpcomingProject | undefined> => {
  let project = getLiveProjectById(id);
  if (project) return project;

  // Nếu không thấy trong localStorage, gọi Cloud Data để đồng bộ
  const syncedData = await fetchAndSyncCloudData();
  return syncedData.projects.find(p => p.id === id);
};

export const saveLiveProjects = async (projects: UpcomingProject[]): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }
  try {
    await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'projects', data: projects }),
    });
  } catch (e) {}
};

// 2. APPS
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

export const saveLiveApps = async (apps: AppItem[]): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
  }
  try {
    await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'apps', data: apps }),
    });
  } catch (e) {}
};

// 3. FEEDBACK THREADS
export const getFeedbackThreads = (): FeedbackThread[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const saveFeedbackThreads = async (threads: FeedbackThread[]): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(threads));
  }
  try {
    await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'feedbacks', data: threads }),
    });
  } catch (e) {}
};

export const sendUserFeedback = async (
  user: { id: string; name: string; email: string; avatar: string }, 
  content: string
): Promise<FeedbackMessage> => {
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

  await saveFeedbackThreads(threads);
  return newMsg;
};

export const replyFeedbackMessage = async (userId: string, content: string): Promise<FeedbackMessage> => {
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
    await saveFeedbackThreads(threads);
  }

  return replyMsg;
};

// 4. GLOBAL CLOUD SYNC FETCHER
export const fetchAndSyncCloudData = async (): Promise<{
  projects: UpcomingProject[];
  apps: AppItem[];
  feedbacks: FeedbackThread[];
}> => {
  try {
    const res = await fetch('/api/studio/data', { cache: 'no-store' });
    const json = await res.json();
    if (json.success) {
      if (typeof window !== 'undefined') {
        if (json.projects && json.projects.length > 0) {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(json.projects));
        }
        if (json.apps && json.apps.length > 0) {
          localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(json.apps));
        }
        if (json.feedbacks) {
          localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(json.feedbacks));
        }
      }
      return {
        projects: json.projects || getLiveProjects(),
        apps: json.apps || getLiveApps(),
        feedbacks: json.feedbacks || getFeedbackThreads(),
      };
    }
  } catch (e) {}

  return {
    projects: getLiveProjects(),
    apps: getLiveApps(),
    feedbacks: getFeedbackThreads(),
  };
};