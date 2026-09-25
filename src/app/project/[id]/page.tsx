'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StudioIcon from '@/components/StudioIcon';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { getLiveProjectById } from '@/data/projectManager';
import { UpcomingProject, ProjectAttachment } from '@/data/config';
import { ArrowLeft, Download, FileText, Lock, Sparkles, Image as ImageIcon, Eye } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const projectId = (params?.id as string) || '';
  const [project, setProject] = useState<UpcomingProject | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const data = getLiveProjectById(projectId);
      if (data) {
        setProject(data);
        document.title = `Vyrith Studio - ${data.name}`;
      }
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">Project Not Found</h1>
        <p className="text-xs text-[#94A3B8]">The project &quot;{projectId}&quot; does not exist or has been relocated.</p>
        <Link href="/project" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow transition-all">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const handleDownloadAttachment = (att: ProjectAttachment) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/project/${projectId}`)}`);
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = att.url;
    downloadLink.setAttribute('download', att.name);
    downloadLink.target = '_blank';
    downloadLink.rel = 'noopener noreferrer';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Top back */}
      <Link href="/project" className="inline-flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Header */}
      <div className="border border-white/10 bg-[#121826]/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl space-y-6 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-white/10 bg-[#090D16] p-3 flex items-center justify-center shrink-0 shadow-md">
            <StudioIcon src={project.icon} alt={project.name} fallbackType="sparkles" />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <StatusBadge status={project.status} size="sm" />
              <span className="text-xs text-[#94A3B8] font-mono">{project.tagline}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{project.name}</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#94A3B8]">Completion Progress</span>
            <span className="text-blue-400 font-bold">{project.progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#090D16] rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_12px_#3B82F6]"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tech Stack & Tags */}
      <div className="border border-white/10 bg-[#121826]/60 backdrop-blur-xl p-6 rounded-2xl space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-mono text-[#94A3B8]">Tech Stack & Tags</h3>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map(tech => (
            <span key={tech} className="px-3 py-1 rounded-lg bg-[#182234] border border-white/10 text-xs font-mono text-blue-300 font-semibold">
              {tech}
            </span>
          ))}
          {project.tags && project.tags.map(t => (
            <span key={t} className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Gallery Screenshots */}
      {project.galleryImages && project.galleryImages.length > 0 && (
        <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Visual Previews & Screenshots</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {project.galleryImages.map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedImage(img)}
                className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#090D16] cursor-pointer hover:border-blue-500/50 transition-all"
              >
                <img src={img} alt="screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs gap-1 font-mono">
                  <Eye className="w-4 h-4" />
                  <span>View Preview</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview & Detailed Docs */}
      <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-2">Project Overview</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            {project.overview || project.tagline}
          </p>
        </div>

        {project.detailedDocs && (
          <div className="pt-4 border-t border-white/[0.08]">
            <h2 className="text-lg font-bold text-white mb-3">Specifications & Documentation</h2>
            <div className="p-4 rounded-xl bg-[#090D16] border border-white/10 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
              {project.detailedDocs}
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="border border-white/10 bg-[#121826]/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Project Resources & Attachments</h2>
            <p className="text-xs text-[#94A3B8]">Download design specs and technical resources</p>
          </div>
          {!isAuthenticated && (
            <span className="text-[11px] text-amber-400 flex items-center gap-1 font-mono">
              <Lock className="w-3.5 h-3.5" /> Authentication Required
            </span>
          )}
        </div>

        {project.attachments && project.attachments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.attachments.map((att, idx) => (
              <div
                key={idx}
                onClick={() => handleDownloadAttachment(att)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#090D16] hover:border-blue-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-mono text-white truncate font-medium">{att.name}</p>
                    {att.size && <p className="text-[10px] text-[#94A3B8] font-mono">{att.size}</p>}
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isAuthenticated ? (
                    <Download className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#94A3B8]">No attachments uploaded for this project yet.</p>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20">
            <img src={selectedImage} alt="zoomed preview" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
}