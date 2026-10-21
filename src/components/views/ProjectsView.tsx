'use client';

import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { Project } from '@/lib/types';

export default function ProjectsView() {
  const { 
    projects, 
    brands, 
    activeBrandId, 
    tasks, 
    setSelectedTaskId 
  } = useBrandFlow();

  const filteredProjects = projects.filter(p => activeBrandId === 'all' || p.brandId === activeBrandId);

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Obsidian Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-indigo-950 p-6 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <FolderKanban size={12} className="text-brand-400" />
                Creative Deliverables
              </span>
              <span className="text-[11px] text-slate-400">
                {filteredProjects.length} Active Production Projects
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Creative Projects & Brand Collateral
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track menu redesigns, comprehensive brand guideline decks, packaging suites, and custom client creative assets with granular milestone progress.
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj) => {
          const relatedTasks = tasks.filter(t => t.projectId === proj.id);

          return (
            <div
              key={proj.id}
              className="glass-card glass-card-hover rounded-2xl border border-slate-200/90 p-6 space-y-4 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                      {proj.brandName}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {proj.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-primary">{proj.title}</h3>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  {proj.status}
                </span>
              </div>

              {/* Brief */}
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
                {proj.brief}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Deliverables Completion</span>
                  <span className="font-mono font-bold text-slate-800">{proj.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Deliverables tags */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Scope Deliverables:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {proj.deliverables.map((d, idx) => (
                    <span key={idx} className="text-[11px] bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span>{d}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Team & Deadline */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>Team: <strong className="text-slate-700 font-semibold">{proj.assignedTeam.join(', ')}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Due: <strong className="text-slate-700 font-semibold">{proj.deadline}</strong></span>
                </div>
              </div>

              {/* Related tasks */}
              {relatedTasks.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Linked Deliverable Tasks:</span>
                  {relatedTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="p-2 bg-slate-50/70 hover:bg-brand-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <span className="font-medium text-slate-800 truncate">{t.title}</span>
                      <span className="text-[10px] text-brand-600 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
