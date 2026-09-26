import { STUDIO_CONFIG, UpcomingProject, AppItem, FeedbackThread, FeedbackMessage } from './config';

const PROJECTS_STORAGE_KEY = 'vyrith_custom_projects_v2';
const APPS_STORAGE_KEY = 'vyrith_custom_apps_v2';
const FEEDBACK_STORAGE_KEY = 'vyrith_feedback_threads_v2';
const TIMESTAMPS_STORAGE_KEY = 'vyrith_local_timestamps';

const getLocalTimestamp = (key: string): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(TIMESTAMPS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed[key] || 0;
    }
  } catch (e) {}
  return 0;
};

const setLocalTimestamp = (key: string, ts: number) => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(TIMESTAMPS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[key] = ts;
    localStorage.setItem(TIMESTAMPS_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {}
};

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

export const getLiveProjectById = (id: string): UpcomingProject | undefined => {
  const projects = getLiveProjects();
  return projects.find(p => p.id === id);
};

export const fetchProjectById = async (id: string): Promise<UpcomingProject | undefined> => {
  const localMatch = getLiveProjectById(id);
  if (localMatch && (localMatch.overview || localMatch.detailedDocs)) {
    return localMatch;
  }
  const cloudData = await fetchAndSyncCloudData();
  return cloudData.projects.find(p => p.id === id) || localMatch;
};

export const saveLiveProjects = async (
  projects: UpcomingProject[],
  onProgress?: (stage: string, percent: number) => void
): Promise<boolean> => {
  const now = Date.now();
  onProgress?.('Writing to Local Storage Cache...', 25);
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
      setLocalTimestamp('projects', now);
    } catch (err) {
      console.warn('LocalStorage full, falling back to clean data', err);
    }
  }

  onProgress?.('Uploading Payload to Cloud Database...', 60);

  try {
    const res = await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'projects', data: projects, timestamp: now }),
    });

    onProgress?.('Verifying Cloud Handshake...', 90);
    return res.ok;
  } catch (e) {
    return false;
  }
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

export const saveLiveApps = async (
  apps: AppItem[],
  onProgress?: (stage: string, percent: number) => void
): Promise<boolean> => {
  const now = Date.now();
  onProgress?.('Caching App Releases Locally...', 25);
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
      setLocalTimestamp('apps', now);
    } catch (e) {}
  }

  onProgress?.('Publishing Binary Links to Cloud...', 60);

  try {
    const res = await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'apps', data: apps, timestamp: now }),
    });

    onProgress?.('Verifying Global App Store Availability...', 90);
    return res.ok;
  } catch (e) {
    return false;
  }
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
  const now = Date.now();
  if (typeof window !== 'undefined') {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(threads));
    setLocalTimestamp('feedbacks', now);
  }
  try {
    await fetch('/api/studio/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'feedbacks', data: threads, timestamp: now }),
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

// 4. GLOBAL CLOUD SYNC FETCHER (Dữ liệu mới hơn luôn thắng)
export const fetchAndSyncCloudData = async (): Promise<{
  projects: UpcomingProject[];
  apps: AppItem[];
  feedbacks: FeedbackThread[];
}> => {
  try {
    const res = await fetch('/api/studio/data', { cache: 'no-store' });
    const json = await res.json();

    if (json.success && typeof window !== 'undefined') {
      const cloudTimestamps = json.timestamps || {};

      // PROJECTS SYNC
      const localProjTS = getLocalTimestamp('projects');
      const cloudProjTS = cloudTimestamps.projects || 0;
      let finalProjects = getLiveProjects();

      if (json.projects && json.projects.length > 0) {
        if (cloudProjTS >= localProjTS || finalProjects.length === 0) {
          finalProjects = json.projects;
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(json.projects));
          setLocalTimestamp('projects', cloudProjTS);
        }
      }

      // APPS SYNC
      const localAppsTS = getLocalTimestamp('apps');
      const cloudAppsTS = cloudTimestamps.apps || 0;
      let finalApps = getLiveApps();

      if (json.apps && json.apps.length > 0) {
        if (cloudAppsTS >= localAppsTS || finalApps.length === 0) {
          finalApps = json.apps;
          localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(json.apps));
          setLocalTimestamp('apps', cloudAppsTS);
        }
      }

      // FEEDBACKS SYNC
      if (json.feedbacks) {
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(json.feedbacks));
      }

      return {
        projects: finalProjects,
        apps: finalApps,
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