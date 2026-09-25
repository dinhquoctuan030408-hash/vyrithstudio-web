import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread, FeedbackMessage } from './config';

const PROJECTS_STORAGE_KEY = 'vyrith_custom_projects';
const APPS_STORAGE_KEY = 'vyrith_custom_apps';
const FEEDBACK_STORAGE_KEY = 'vyrith_feedback_threads';

export const getLiveProjects = (): UpcomingProject[] => {
  if (typeof window === 'undefined') return STUDIO_CONFIG.upcomingProjects;
  try {
    const saved = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading projects from cache', e);
  }
  return STUDIO_CONFIG.upcomingProjects;
};

export const getLiveProjectById = (id: string): UpcomingProject | undefined => {
  const list = getLiveProjects();
  return list.find(p => p.id === id);
};

export const fetchProjectById = async (id: string): Promise<UpcomingProject | undefined> => {
  const localMatch = getLiveProjectById(id);
  if (localMatch) return localMatch;

  const cloudData = await fetchAndSyncCloudData();
  return cloudData.projects.find(p => p.id === id);
};

export const saveLiveProjects = async (projects: UpcomingProject[]): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.warn('LocalStorage full, attempting sanitized save without excessive base64', err);
      try {
        const lightweight = projects.map(p => ({
          ...p,
          // Giới hạn dung lượng cache fallback nếu bộ nhớ trình duyệt đầy
          galleryImages: p.galleryImages?.slice(0, 4) || [],
          attachments: p.attachments?.slice(0, 5) || []
        }));
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(lightweight));
      } catch (e) {}
    }
  }

  try {
    const res = await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'projects', data: projects }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
};

// APPS
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
    try {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
    } catch (e) {}
  }
  try {
    await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'apps', data: apps }),
    });
  } catch (e) {}
};

// FEEDBACK
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

// GLOBAL SYNC
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