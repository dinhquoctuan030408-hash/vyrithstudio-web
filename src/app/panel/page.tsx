'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { STUDIO_CONFIG, UpcomingProject, AppProjectStatus, ProjectAttachment, AppItem, FeedbackThread } from '@/data/config';
import { 
  getLiveProjects, 
  saveLiveProjects, 
  getLiveApps, 
  saveLiveApps, 
  getFeedbackThreads, 
  saveFeedbackThreads, 
  replyFeedbackMessage 
} from '@/data/projectManager';
import StudioIcon from '@/components/StudioIcon';
import StatusBadge from '@/components/StatusBadge';
import { 
  LayoutDashboard, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Paperclip, 
  Eye, 
  Layers, 
  Cpu, 
  MessageSquare, 
  Pin, 
  Send, 
  Tag as TagIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function FounderPanelPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'projects' | 'apps' | 'feedback'>('projects');
  const [successMsg, setSuccessMsg] = useState('');

  // Projects State
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [editingProj, setEditingProj] = useState<UpcomingProject | null>(null);
  const [isCreatingProj, setIsCreatingProj] = useState(false);
  const [projTagInput, setProjTagInput] = useState('');
  const iconInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Apps State
  const [apps, setApps] = useState<AppItem[]>([]);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  const [appTagInput, setAppTagInput] = useState('');
  const appIconInputRef = useRef<HTMLInputElement>(null);

  // Feedback State
  const [threads, setThreads] = useState<FeedbackThread[]>([]);
  const [selectedThreadUser, setSelectedThreadUser] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const isFounder = user?.role === 'FOUNDER' || user?.email?.toLowerCase() === STUDIO_CONFIG.founderAuth.email.toLowerCase();

  useEffect(() => {
    document.title = 'Vyrith Studio - Master Founder Panel';
    if (!isAuthenticated) {
      router.push('/login?redirect=/panel');
      return;
    }
    if (!isFounder) {
      router.push('/dashboard');
      return;
    }
    setProjects(getLiveProjects());
    setApps(getLiveApps());
    const loadedThreads = getFeedbackThreads();
    setThreads(loadedThreads);
    if (loadedThreads.length > 0 && !selectedThreadUser) {
      setSelectedThreadUser(loadedThreads[0].userId);
    }
  }, [isAuthenticated, isFounder, router, selectedThreadUser]);

  if (!isAuthenticated || !isFounder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ================= PROJECTS HANDLERS =================
  const handleOpenCreateProj = () => {
    setIsCreatingProj(true);
    setEditingProj({
      id: 'proj-' + Date.now().toString(36),
      name: '',
      tagline: 'Roblox Experience',
      status: 'In Development',
      progress: 50,
      icon: '/icons/prj1.png',
      techStack: ['Luau'],
      tags: ['Experience'],
      projectUrl: '',
      overview: '',
      detailedDocs: '',
      galleryImages: [],
      attachments: []
    });
  };

  const handleAddProjTag = () => {
    if (!projTagInput.trim() || !editingProj) return;
    const curTags = editingProj.tags || [];
    if (!curTags.includes(projTagInput.trim())) {
      setEditingProj({ ...editingProj, tags: [...curTags, projTagInput.trim()] });
    }
    setProjTagInput('');
  };

  const handleRemoveProjTag = (tag: string) => {
    if (!editingProj) return;
    const curTags = editingProj.tags || [];
    setEditingProj({ ...editingProj, tags: curTags.filter(t => t !== tag) });
  };

  const handleUploadProjIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProj) return;
    const reader = new FileReader();
    reader.onload = () => setEditingProj({ ...editingProj, icon: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleUploadGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProj) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setEditingProj(prev => prev ? {
          ...prev,
          galleryImages: [...(prev.galleryImages || []), reader.result as string]
        } : prev);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProj) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAtt: ProjectAttachment = {
          name: file.name,
          url: reader.result as string,
          size: formatFileSize(file.size),
          type: file.type || 'file'
        };
        setEditingProj(prev => prev ? {
          ...prev,
          attachments: [...(prev.attachments || []), newAtt]
        } : prev);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj) return;
    let updated: UpcomingProject[];
    if (isCreatingProj) {
      updated = [...projects, { ...editingProj, projectUrl: `/project/${editingProj.id}` }];
    } else {
      updated = projects.map(p => p.id === editingProj.id ? editingProj : p);
    }
    setProjects(updated);
    saveLiveProjects(updated);
    setEditingProj(null);
    setIsCreatingProj(false);
    setSuccessMsg('Project synchronized successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteProj = (id: string) => {
    if (confirm('Delete this project?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      saveLiveProjects(updated);
    }
  };

  // ================= APPS HANDLERS =================
  const handleOpenCreateApp = () => {
    setIsCreatingApp(true);
    setEditingApp({
      id: 'app-' + Date.now().toString(36),
      name: '',
      category: 'Software Tool',
      rating: 5.0,
      description: '',
      icon: '/icons/vyrithcode.png',
      version: 'v1.0.0',
      status: 'Ready',
      tags: ['Utility'],
      downloadUrl: '',
      downloadEnabled: true
    });
  };

  const handleAddAppTag = () => {
    if (!appTagInput.trim() || !editingApp) return;
    const curTags = editingApp.tags || [];
    if (!curTags.includes(appTagInput.trim())) {
      setEditingApp({ ...editingApp, tags: [...curTags, appTagInput.trim()] });
    }
    setAppTagInput('');
  };

  const handleRemoveAppTag = (tag: string) => {
    if (!editingApp) return;
    const curTags = editingApp.tags || [];
    setEditingApp({ ...editingApp, tags: curTags.filter(t => t !== tag) });
  };

  const handleUploadAppIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingApp) return;
    const reader = new FileReader();
    reader.onload = () => setEditingApp({ ...editingApp, icon: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    let updated: AppItem[];
    if (isCreatingApp) {
      updated = [...apps, editingApp];
    } else {
      updated = apps.map(a => a.id === editingApp.id ? editingApp : a);
    }
    setApps(updated);
    saveLiveApps(updated);
    setEditingApp(null);
    setIsCreatingApp(false);
    setSuccessMsg('App information, status, and tags updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteApp = (id: string) => {
    if (confirm('Delete this application entry?')) {
      const updated = apps.filter(a => a.id !== id);
      setApps(updated);
      saveLiveApps(updated);
    }
  };

  // ================= FEEDBACK HANDLERS =================
  const currentThread = threads.find(t => t.userId === selectedThreadUser);

  const handleTogglePinThread = (userId: string) => {
    const updated = threads.map(t => t.userId === userId ? { ...t, pinned: !t.pinned } : t);
    setThreads(updated);
    saveFeedbackThreads(updated);
  };

  const handleDeleteMessage = (userId: string, msgId: string) => {
    const updated = threads.map(t => {
      if (t.userId === userId) {
        return { ...t, messages: t.messages.filter(m => m.id !== msgId) };
      }
      return t;
    }).filter(t => t.messages.length > 0);
    setThreads(updated);
    saveFeedbackThreads(updated);
  };

  const handleSendFounderReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThreadUser) return;
    replyFeedbackMessage(selectedThreadUser, replyText);
    setThreads(getFeedbackThreads());
    setReplyText('');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono uppercase mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Master Terminal Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">Founder Control Panel</h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Manage projects, update app releases, customize tags & statuses, and chat with users.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121826] border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'projects' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'apps' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Apps ({apps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'feedback' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback ({threads.length})</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Active Research & Game Projects</h2>
            <button
              onClick={handleOpenCreateProj}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div key={proj.id} className="border border-white/10 bg-[#121826]/80 p-5 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#090D16] border border-white/10 p-1 flex items-center justify-center">
                        <StudioIcon src={proj.icon} alt={proj.name} fallbackType="sparkles" />
                      </div>
                      <StatusBadge status={proj.status} size="sm" />
                    </div>
                    <span className="text-xs font-mono text-blue-400 font-bold">{proj.progress}%</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{proj.name}</h3>
                    <p className="text-xs text-[#94A3B8] line-clamp-2">{proj.tagline}</p>
                  </div>
                  {/* Tags list */}
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-[#182234] border border-white/10 text-[10px] font-mono text-blue-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <button
                    onClick={() => { setIsCreatingProj(false); setEditingProj({ ...proj }); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit / Tags / Files</span>
                  </button>
                  <button
                    onClick={() => router.push(`/project/${proj.id}`)}
                    className="p-2 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProj(proj.id)}
                    className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: APPS MANAGEMENT */}
      {activeTab === 'apps' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Studio Released Software & Plugins</h2>
            <button
              onClick={handleOpenCreateApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New App</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app) => (
              <div key={app.id} className="border border-white/10 bg-[#121826]/80 p-5 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#090D16] border border-white/10 p-2 flex items-center justify-center">
                        <StudioIcon src={app.icon} alt={app.name} fallbackType="cpu" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{app.name}</h3>
                        <span className="text-[10px] text-blue-400 font-mono">{app.version}</span>
                      </div>
                    </div>
                    <StatusBadge status={app.status || 'Ready'} size="sm" />
                  </div>
                  <p className="text-xs text-[#94A3B8] line-clamp-2">{app.description}</p>
                  
                  {/* Tags */}
                  {app.tags && app.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.tags.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-[#182234] border border-white/10 text-[10px] font-mono text-blue-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <button
                    onClick={() => { setIsCreatingApp(false); setEditingApp({ ...app }); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit / Status / Tags</span>
                  </button>
                  <button
                    onClick={() => handleDeleteApp(app.id)}
                    className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK MESSENGER */}
      {activeTab === 'feedback' && (
        <div className="border border-white/10 bg-[#121826]/80 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
          {/* Thread List Sidebar */}
          <div className="border-r border-white/10 p-4 space-y-3 bg-[#090D16]/50">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono px-2">
              User Feedback Threads ({threads.length})
            </h3>
            {threads.length === 0 ? (
              <p className="text-xs text-[#94A3B8] p-4 text-center">No feedback messages yet.</p>
            ) : (
              <div className="space-y-1.5">
                {threads.map((t) => {
                  const isSelected = t.userId === selectedThreadUser;
                  const lastMsg = t.messages[t.messages.length - 1];
                  return (
                    <div
                      key={t.userId}
                      onClick={() => setSelectedThreadUser(t.userId)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected ? 'bg-blue-600/15 border border-blue-500/40' : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <img src={t.userAvatar} alt="avt" className="w-8 h-8 rounded-full border border-white/10 object-cover shrink-0" />
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{t.userName}</span>
                            {t.pinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-[#94A3B8] truncate">{lastMsg?.content || 'No messages'}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTogglePinThread(t.userId); }}
                        className="text-[#94A3B8] hover:text-amber-400 p-1"
                        title="Pin thread"
                      >
                        <Pin className={`w-3.5 h-3.5 ${t.pinned ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Chat Conversation */}
          <div className="col-span-2 flex flex-col justify-between p-5 bg-[#121826]/40">
            {currentThread ? (
              <>
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={currentThread.userAvatar} alt="avt" className="w-10 h-10 rounded-xl border border-blue-500/30 object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{currentThread.userName}</h4>
                      <p className="text-[10px] text-[#94A3B8] font-mono">{currentThread.userEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 py-4 overflow-y-auto space-y-3.5 max-h-[380px] scrollbar-thin">
                  {currentThread.messages.map((m) => {
                    const isFounderMsg = m.sender === 'founder';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isFounderMsg ? 'items-end' : 'items-start'} space-y-1 group`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#94A3B8] font-mono">
                            {isFounderMsg ? 'Founder (You)' : currentThread.userName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(currentThread.userId, m.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div
                          className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isFounderMsg
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]'
                              : 'bg-[#182234] border border-white/10 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendFounderReply} className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${currentThread.userName}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 shadow-glow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
                Select a user thread on the left to start responding.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDIT PROJECT (STATUS & TAGS) */}
      {editingProj && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl border border-white/15 bg-[#121826] rounded-3xl p-6 sm:p-8 space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">
                {isCreatingProj ? 'Create New Project' : `Edit Project: ${editingProj.name}`}
              </h2>
              <button onClick={() => setEditingProj(null)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProj.name}
                    onChange={(e) => setEditingProj({ ...editingProj, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    Tagline / Experience *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProj.tagline}
                    onChange={(e) => setEditingProj({ ...editingProj, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status Selector & Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    Project Status *
                  </label>
                  <select
                    value={editingProj.status}
                    onChange={(e) => setEditingProj({ ...editingProj, status: e.target.value as AppProjectStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ready">Ready</option>
                    <option value="In Development">In Development</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Discontinued">Discontinued</option>
                    <option value="Alpha">Alpha</option>
                    <option value="Beta">Beta</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    Progress: <strong className="text-blue-400">{editingProj.progress}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingProj.progress}
                    onChange={(e) => setEditingProj({ ...editingProj, progress: Number(e.target.value) })}
                    className="w-full mt-2 accent-blue-500"
                  />
                </div>
              </div>

              {/* Tag Editor */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-blue-400" />
                  <label className="text-xs font-bold text-white">Project Custom Tags</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={projTagInput}
                    onChange={(e) => setProjTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProjTag(); } }}
                    placeholder="Type tag (e.g. Open World, AI, Roblox) and press Add..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#121826] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddProjTag}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editingProj.tags && editingProj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#182234] border border-white/10 text-xs font-mono text-blue-300"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProjTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload Icon */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 flex items-center justify-between gap-4">
                <input ref={iconInputRef} type="file" accept="image/*" onChange={handleUploadProjIcon} className="hidden" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#121826] border border-white/15 p-1.5 flex items-center justify-center">
                    <StudioIcon src={editingProj.icon} alt="icon" fallbackType="sparkles" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Project Icon</span>
                    <span className="text-[10px] text-[#94A3B8]">PNG, SVG, JPG from local machine</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold"
                >
                  Upload Icon
                </button>
              </div>

              {/* Upload Gallery */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleUploadGallery} className="hidden" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Visual Screenshots ({editingProj.galleryImages?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs"
                  >
                    Add Screenshots
                  </button>
                </div>
                {editingProj.galleryImages && editingProj.galleryImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {editingProj.galleryImages.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video">
                        <img src={img} alt="p" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditingProj({ ...editingProj, galleryImages: editingProj.galleryImages?.filter((_, idx) => idx !== i) })}
                          className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Attachments */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                <input ref={docInputRef} type="file" multiple onChange={handleUploadAttachment} className="hidden" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Resource Attachments ({editingProj.attachments?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs"
                  >
                    Upload Files
                  </button>
                </div>
                {editingProj.attachments && editingProj.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {editingProj.attachments.map((att, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-[#121826] border border-white/10 text-xs">
                        <span className="text-white font-mono truncate">{att.name} {att.size && `(${att.size})`}</span>
                        <button
                          type="button"
                          onClick={() => setEditingProj({ ...editingProj, attachments: editingProj.attachments?.filter((_, idx) => idx !== i) })}
                          className="text-red-400 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                  Tech Architecture (comma separated)
                </label>
                <input
                  type="text"
                  value={editingProj.techStack.join(', ')}
                  onChange={(e) => setEditingProj({ ...editingProj, techStack: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                  Project Overview
                </label>
                <textarea
                  rows={3}
                  value={editingProj.overview || ''}
                  onChange={(e) => setEditingProj({ ...editingProj, overview: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                  Documentation & Specifications (Markdown/Text)
                </label>
                <textarea
                  rows={4}
                  value={editingProj.detailedDocs || ''}
                  onChange={(e) => setEditingProj({ ...editingProj, detailedDocs: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setEditingProj(null)} className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#94A3B8]">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT APP (STATUS & TAGS) */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl border border-white/15 bg-[#121826] rounded-3xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">
                {isCreatingApp ? 'Add New App' : `Edit App: ${editingApp.name}`}
              </h2>
              <button onClick={() => setEditingApp(null)} className="text-[#94A3B8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingApp.name}
                    onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingApp.category}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* App Status & Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    App Status *
                  </label>
                  <select
                    value={editingApp.status || 'Ready'}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as AppProjectStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ready">Ready</option>
                    <option value="In Development">In Development</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    required
                    value={editingApp.version}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* App Tags */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-blue-400" />
                  <label className="text-xs font-bold text-white">App Custom Tags</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={appTagInput}
                    onChange={(e) => setAppTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAppTag(); } }}
                    placeholder="Type tag (e.g. IDE, AI, Plugin) and press Add..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#121826] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAppTag}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {editingApp.tags && editingApp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#182234] border border-white/10 text-xs font-mono text-blue-300"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAppTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Upload App Icon */}
              <div className="p-3.5 rounded-2xl bg-[#090D16] border border-white/10 flex items-center justify-between">
                <input ref={appIconInputRef} type="file" accept="image/*" onChange={handleUploadAppIcon} className="hidden" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#121826] border border-white/15 p-1.5 flex items-center justify-center">
                    <StudioIcon src={editingApp.icon} alt="icon" fallbackType="cpu" />
                  </div>
                  <span className="text-xs font-bold text-white">App Icon</span>
                </div>
                <button
                  type="button"
                  onClick={() => appIconInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold"
                >
                  Upload
                </button>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                  Direct Download Package URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingApp.downloadUrl}
                  onChange={(e) => setEditingApp({ ...editingApp, downloadUrl: e.target.value })}
                  placeholder="https://.../app-release.zip"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingApp.description}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setEditingApp(null)} className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#94A3B8]">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow">
                  Save App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}