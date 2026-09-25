'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { STUDIO_CONFIG, UpcomingProject, AppProjectStatus, ProjectAttachment, AppItem, FeedbackThread } from '@/data/config';
import { 
  fetchAndSyncCloudData,
  saveLiveProjects, 
  saveLiveApps, 
  saveFeedbackThreads, 
  replyFeedbackMessage 
} from '@/data/projectManager';
import StudioIcon from '@/components/StudioIcon';
import StatusBadge from '@/components/StatusBadge';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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
  ToggleRight,
  Download,
  Info,
  Code2,
  FolderKanban,
  Check
} from 'lucide-react';

export default function FounderPanelPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'projects' | 'apps' | 'feedback'>('projects');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal Editor Sub-tabs
  const [editorSubTab, setEditorSubTab] = useState<'general' | 'docs' | 'media' | 'tags'>('general');

  // Projects State
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [editingProj, setEditingProj] = useState<UpcomingProject | null>(null);
  const [isCreatingProj, setIsCreatingProj] = useState(false);
  const [projTagInput, setProjTagInput] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  
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

    fetchAndSyncCloudData().then(data => {
      setProjects(data.projects);
      setApps(data.apps);
      setThreads(data.feedbacks);
      if (data.feedbacks.length > 0 && !selectedThreadUser) {
        setSelectedThreadUser(data.feedbacks[0].userId);
      }
    });
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
    setEditorSubTab('general');
    setProjTagInput('');
    setTechStackInput('Luau');
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
      detailedDocs: '## Architecture Specifications\n- Modular OOP state architecture.\n- Custom low-latency UDP replication.\n\n### Milestones\n- [x] Phase 1 Core Alpha\n- [ ] Phase 2 Production Loop\n\n```luau\nprint("Vyrith Studio Systems Online")\n```\n\n$$E = mc^2 \\quad \\sum_{i=1}^n x_i$$',
      galleryImages: [],
      attachments: []
    });
  };

  const handleOpenEditProj = (proj: UpcomingProject) => {
    setIsCreatingProj(false);
    setEditorSubTab('general');
    setProjTagInput('');
    setTechStackInput(proj.techStack?.join(', ') || 'Luau');
    setEditingProj({
      ...proj,
      tags: proj.tags || [],
      techStack: proj.techStack || ['Luau'],
      galleryImages: proj.galleryImages || [],
      attachments: proj.attachments || []
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

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProj) return;

    setIsSaving(true);

    const parsedTech = techStackInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const targetId = editingProj.id || ('proj-' + Date.now().toString(36));

    const finalProject: UpcomingProject = {
      ...editingProj,
      id: targetId,
      name: editingProj.name.trim() || 'Untitled Project',
      tagline: editingProj.tagline.trim() || 'Studio Experience',
      status: editingProj.status || 'In Development',
      progress: Math.min(100, Math.max(0, Number(editingProj.progress) || 0)),
      icon: editingProj.icon || '/icons/prj1.png',
      techStack: parsedTech.length > 0 ? parsedTech : ['Luau'],
      tags: editingProj.tags || [],
      overview: editingProj.overview || '',
      detailedDocs: editingProj.detailedDocs || '',
      galleryImages: editingProj.galleryImages || [],
      attachments: editingProj.attachments || [],
      projectUrl: `/project/${targetId}`
    };

    let updatedList: UpcomingProject[];
    if (isCreatingProj) {
      updatedList = [finalProject, ...projects.filter(p => p.id !== targetId)];
    } else {
      updatedList = projects.map(p => p.id === targetId ? finalProject : p);
    }

    setProjects(updatedList);
    await saveLiveProjects(updatedList);
    
    setIsSaving(false);
    setEditingProj(null);
    setIsCreatingProj(false);
    setSuccessMsg(`Project "${finalProject.name}" saved and synchronized successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteProj = async (id: string) => {
    if (confirm('Delete this project permanently?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      await saveLiveProjects(updated);
      setSuccessMsg('Project removed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
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

  const handleToggleAppDownloadQuick = async (appId: string) => {
    const updated = apps.map(a => {
      if (a.id === appId) {
        return { ...a, downloadEnabled: a.downloadEnabled === false ? true : false };
      }
      return a;
    });
    setApps(updated);
    await saveLiveApps(updated);
    setSuccessMsg('Download button status synced globally.');
    setTimeout(() => setSuccessMsg(''), 2500);
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

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    let updated: AppItem[];
    if (isCreatingApp) {
      updated = [...apps, editingApp];
    } else {
      updated = apps.map(a => a.id === editingApp.id ? editingApp : a);
    }
    setApps(updated);
    await saveLiveApps(updated);
    setEditingApp(null);
    setIsCreatingApp(false);
    setSuccessMsg('App updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteApp = async (id: string) => {
    if (confirm('Delete this application entry?')) {
      const updated = apps.filter(a => a.id !== id);
      setApps(updated);
      await saveLiveApps(updated);
    }
  };

  // ================= FEEDBACK HANDLERS =================
  const currentThread = threads.find(t => t.userId === selectedThreadUser);

  const handleTogglePinThread = async (userId: string) => {
    const updated = threads.map(t => t.userId === userId ? { ...t, pinned: !t.pinned } : t);
    setThreads(updated);
    await saveFeedbackThreads(updated);
  };

  const handleDeleteMessage = async (userId: string, msgId: string) => {
    const updated = threads.map(t => {
      if (t.userId === userId) {
        return { ...t, messages: t.messages.filter(m => m.id !== msgId) };
      }
      return t;
    }).filter(t => t.messages.length > 0);
    setThreads(updated);
    await saveFeedbackThreads(updated);
  };

  const handleSendFounderReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThreadUser) return;
    await replyFeedbackMessage(selectedThreadUser, replyText);
    const data = await fetchAndSyncCloudData();
    setThreads(data.feedbacks);
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
            Real-time Studio Configuration: Projects, Documentation Markdown, Apps & Feedback Messenger.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121826] border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'projects' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'apps' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Apps ({apps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono transition-all ${
              activeTab === 'feedback' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback ({threads.length})</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 shadow-glow">
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div key={proj.id} className="border border-white/10 bg-[#121826]/80 p-5 rounded-3xl flex flex-col justify-between space-y-4 hover:border-blue-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#090D16] border border-white/10 p-1 flex items-center justify-center">
                        <StudioIcon src={proj.icon} alt={proj.name} fallbackType="sparkles" />
                      </div>
                      <StatusBadge status={proj.status} size="sm" />
                    </div>
                    <span className="text-xs font-mono text-blue-400 font-bold">{proj.progress}%</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{proj.name}</h3>
                    <p className="text-xs text-[#94A3B8] font-mono mt-0.5">{proj.tagline}</p>
                    <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">{proj.overview || proj.tagline}</p>
                  </div>

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
                    onClick={() => handleOpenEditProj(proj)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                  </button>
                  <button
                    onClick={() => router.push(`/project/${proj.id}`)}
                    className="p-2 rounded-xl border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5"
                    title="View project page"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProj(proj.id)}
                    className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    title="Delete project"
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New App</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {apps.map((app) => {
              const isDownloadOn = app.downloadEnabled !== false;

              return (
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
                    
                    {app.tags && app.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-[#182234] border border-white/10 text-[10px] font-mono text-blue-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Download Toggle Switch */}
                    <div className="p-3 rounded-2xl bg-[#090D16] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className={`w-4 h-4 ${isDownloadOn ? 'text-emerald-400' : 'text-[#94A3B8]'}`} />
                        <div>
                          <span className="text-xs font-mono font-bold text-white block">Download Button</span>
                          <span className={`text-[10px] font-mono ${isDownloadOn ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isDownloadOn ? 'Enabled on Store' : 'Disabled / Paused'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAppDownloadQuick(app.id)}
                        className="p-1 hover:scale-105 active:scale-95 transition-transform"
                      >
                        {isDownloadOn ? (
                          <ToggleRight className="w-7 h-7 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-[#94A3B8]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <button
                      onClick={() => { setIsCreatingApp(false); setEditingApp({ ...app }); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-medium transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit App & Link</span>
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="p-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK MESSENGER */}
      {activeTab === 'feedback' && (
        <div className="border border-white/10 bg-[#121826]/80 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
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
                      >
                        <Pin className={`w-3.5 h-3.5 ${t.pinned ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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

      {/* ================= STUDIO ADVANCED PROJECT EDITOR MODAL ================= */}
      {editingProj && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-5xl border border-white/15 bg-[#0e1422] rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
            
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-[#121826] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {isCreatingProj ? 'Studio Creator: New Project' : `Studio Editor: ${editingProj.name || 'Untitled'}`}
                  </h2>
                  <span className="text-[10px] font-mono text-[#94A3B8]">ID: {editingProj.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProj(null)}
                  className="p-2 text-[#94A3B8] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Left Tabs & Right Form */}
            <form onSubmit={handleSaveProject} className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Sub-navigation Tabs */}
              <div className="w-full md:w-56 p-3 border-b md:border-b-0 md:border-r border-white/10 bg-[#090D16]/60 flex md:flex-col gap-1 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setEditorSubTab('general')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all w-full text-left ${
                    editorSubTab === 'general' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>1. General & Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('tags')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all w-full text-left ${
                    editorSubTab === 'tags' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <TagIcon className="w-4 h-4 shrink-0" />
                  <span>2. Tech & Tags</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('docs')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all w-full text-left ${
                    editorSubTab === 'docs' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Code2 className="w-4 h-4 shrink-0" />
                  <span>3. Markdown Docs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorSubTab('media')}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all w-full text-left ${
                    editorSubTab === 'media' ? 'bg-blue-600 text-white shadow-glow' : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>4. Media & Files</span>
                </button>
              </div>

              {/* Right Tab Content Panel */}
              <div className="flex-1 p-5 sm:p-7 overflow-y-auto space-y-5 bg-[#0e1422]">
                
                {/* SUBTAB 1: GENERAL INFO */}
                {editorSubTab === 'general' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5 font-bold">
                          Project Title / Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProj.name}
                          onChange={(e) => setEditingProj({ ...editingProj, name: e.target.value })}
                          placeholder="e.g. Vyrith Student, Anime Ascension..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5 font-bold">
                          Tagline / Experience *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingProj.tagline}
                          onChange={(e) => setEditingProj({ ...editingProj, tagline: e.target.value })}
                          placeholder="e.g. Roblox Experience, System Software..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5 font-bold">
                          Project Status *
                        </label>
                        <select
                          value={editingProj.status}
                          onChange={(e) => setEditingProj({ ...editingProj, status: e.target.value as AppProjectStatus })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block font-bold">
                            Completion Progress
                          </label>
                          <span className="text-xs font-mono text-blue-400 font-bold">{editingProj.progress}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editingProj.progress}
                          onChange={(e) => setEditingProj({ ...editingProj, progress: Number(e.target.value) })}
                          className="w-full mt-2 accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5 font-bold">
                        Project Overview (Summary)
                      </label>
                      <textarea
                        rows={4}
                        value={editingProj.overview || ''}
                        onChange={(e) => setEditingProj({ ...editingProj, overview: e.target.value })}
                        placeholder="Provide a comprehensive summary of this research or game project..."
                        className="w-full px-4 py-3 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: TECH & TAGS */}
                {editorSubTab === 'tags' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block mb-1.5 font-bold">
                        Tech Architecture & Frameworks (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={techStackInput}
                        onChange={(e) => setTechStackInput(e.target.value)}
                        placeholder="Luau, C++, Unity, ECS, AI..."
                        className="w-full px-4 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">Example: Luau, C++, Vulkan, React</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                      <label className="text-xs font-bold text-white block">
                        Custom Badges & Tags
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={projTagInput}
                          onChange={(e) => setProjTagInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddProjTag(); } }}
                          placeholder="Type tag (e.g. Open Source, RPG, Multiplayer) and press Add..."
                          className="flex-1 px-4 py-2 rounded-xl bg-[#121826] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddProjTag}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow"
                        >
                          Add Tag
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
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
                  </div>
                )}

                {/* SUBTAB 3: MARKDOWN & MATH SPECS */}
                {editorSubTab === 'docs' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-[#94A3B8] font-mono block font-bold">
                          Documentation & Technical Specifications
                        </label>
                        <p className="text-[10px] text-[#94A3B8] font-mono">
                          Supports Markdown headers (#, ##), Bold (**text**), Code blocks (```), and Math Formulas (
..
).
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Editor Input */}
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 block mb-1">Raw Markdown Source</span>
                        <textarea
                          rows={13}
                          value={editingProj.detailedDocs || ''}
                          onChange={(e) => setEditingProj({ ...editingProj, detailedDocs: e.target.value })}
                          placeholder="## System Architecture&#10;- Feature 1&#10;- [x] Milestone Complete&#10;&#10;```luau&#10;print('Hello')&#10;```&#10;&#10;
E=mc 
2
 
"
                          className="w-full h-[320px] p-3.5 rounded-2xl bg-[#090D16] border border-white/10 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500 resize-none scrollbar-thin"
                        />
                      </div>

                      {/* Live Preview */}
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block mb-1">Live Render Preview</span>
                        <div className="w-full h-[320px] p-4 rounded-2xl bg-[#090D16]/70 border border-white/10 overflow-y-auto scrollbar-thin shadow-inner">
                          {editingProj.detailedDocs ? (
                            <MarkdownRenderer content={editingProj.detailedDocs} />
                          ) : (
                            <p className="text-xs text-[#94A3B8] italic">Type markdown on the left to see live preview here.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: MEDIA & ATTACHMENTS */}
                {editorSubTab === 'media' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    {/* Icon */}
                    <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 flex items-center justify-between gap-4">
                      <input ref={iconInputRef} type="file" accept="image/*" onChange={handleUploadProjIcon} className="hidden" />
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#121826] border border-white/15 p-1.5 flex items-center justify-center">
                          <StudioIcon src={editingProj.icon} alt="icon" fallbackType="sparkles" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Project Icon</span>
                          <span className="text-[10px] text-[#94A3B8]">Upload image directly from device</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Upload Icon
                      </button>
                    </div>

                    {/* Screenshots */}
                    <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                      <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleUploadGallery} className="hidden" />
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-white block">Visual Screenshots</span>
                          <span className="text-[10px] text-[#94A3B8]">{editingProj.galleryImages?.length || 0} images uploaded</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs hover:bg-indigo-600 hover:text-white transition-all"
                        >
                          Add Images
                        </button>
                      </div>

                      {editingProj.galleryImages && editingProj.galleryImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 pt-2">
                          {editingProj.galleryImages.map((img, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
                              <img src={img} alt="p" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setEditingProj({ ...editingProj, galleryImages: editingProj.galleryImages?.filter((_, idx) => idx !== i) })}
                                className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Attachments */}
                    <div className="p-4 rounded-2xl bg-[#090D16] border border-white/10 space-y-3">
                      <input ref={docInputRef} type="file" multiple onChange={handleUploadAttachment} className="hidden" />
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-white block">Downloadable Files & Resources</span>
                          <span className="text-[10px] text-[#94A3B8]">{editingProj.attachments?.length || 0} files attached</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs hover:bg-cyan-600 hover:text-white transition-all"
                        >
                          Upload Files
                        </button>
                      </div>

                      {editingProj.attachments && editingProj.attachments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {editingProj.attachments.map((att, i) => (
                            <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-[#121826] border border-white/10 text-xs">
                              <span className="text-white font-mono truncate">{att.name} {att.size && `(${att.size})`}</span>
                              <button
                                type="button"
                                onClick={() => setEditingProj({ ...editingProj, attachments: editingProj.attachments?.filter((_, idx) => idx !== i) })}
                                className="text-red-400 p-1 hover:text-red-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </form>

            {/* Modal Bottom Sticky Actions */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#121826] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#94A3B8] font-mono">
                Changes will sync instantly to all online clients.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProj(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-xs text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving & Syncing...' : 'Save & Publish Project'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL EDIT / CREATE APP */}
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

              {/* Status & Version */}
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

              {/* Download Toggle in Form */}
              <div className="p-4 rounded-2xl bg-[#090D16] border border-blue-500/20 shadow-glow flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white block">Download Button Status</label>
                  <p className="text-[10px] text-[#94A3B8]">
                    {editingApp.downloadEnabled !== false 
                      ? 'Download is currently ENABLED for users on App Store' 
                      : 'Download is currently PAUSED / DISABLED on App Store'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingApp({ ...editingApp, downloadEnabled: editingApp.downloadEnabled === false ? true : false })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121826] border border-white/10 hover:border-blue-500/40 transition-all font-mono text-xs"
                >
                  {editingApp.downloadEnabled !== false ? (
                    <>
                      <span className="text-emerald-400 font-bold">ACTIVE</span>
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    </>
                  ) : (
                    <>
                      <span className="text-[#94A3B8] font-bold">PAUSED</span>
                      <ToggleLeft className="w-6 h-6 text-[#94A3B8]" />
                    </>
                  )}
                </button>
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