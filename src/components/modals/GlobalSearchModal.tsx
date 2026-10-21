'use client';

import React, { useState } from 'react';
import { 
  Search, 
  X, 
  CheckSquare, 
  Camera, 
  Send, 
  Briefcase, 
  Users, 
  BarChart3, 
  ArrowRight 
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function GlobalSearchModal() {
  const { 
    isSearchModalOpen, 
    setIsSearchModalOpen, 
    tasks, 
    brands, 
    shoots, 
    content, 
    team, 
    ads,
    setActiveTab,
    setSelectedTaskId,
    setSelectedReviewContentId
  } = useBrandFlow();

  const [query, setQuery] = useState('');

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.brandName.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchingBrands = q ? brands.filter(b => b.name.toLowerCase().includes(q) || b.tagline.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingShoots = q ? shoots.filter(s => s.title.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingContent = q ? content.filter(c => c.title.toLowerCase().includes(q) || c.caption.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchingTeam = q ? team.filter(m => m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q)).slice(0, 3) : [];
  const matchingAds = q ? ads.filter(a => a.name.toLowerCase().includes(q) || a.objective.toLowerCase().includes(q)).slice(0, 3) : [];

  const totalMatches = matchingTasks.length + matchingBrands.length + matchingShoots.length + matchingContent.length + matchingTeam.length + matchingAds.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-surface-border gap-2.5">
          <Search size={18} className="text-slate-muted" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, reels, shoots, brands, campaigns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-primary"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="p-1 rounded text-slate-muted hover:text-slate-primary"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q && (
            <div className="py-8 text-center text-xs text-slate-muted">
              Type to search across all brands, scheduled reels, shoots, tasks, and team members.
            </div>
          )}

          {q && totalMatches === 0 && (
            <div className="py-8 text-center text-xs text-slate-muted">
              No results found for &quot;{query}&quot;.
            </div>
          )}

          {/* Tasks */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-muted uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <CheckSquare size={12} className="text-brand-500" />
                Tasks
              </div>
              <div className="space-y-1">
                {matchingTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTaskId(t.id);
                      setIsSearchModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-brand-50 text-left text-xs text-slate-primary transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-semibold">{t.title}</span>
                      <span className="text-[11px] text-slate-muted ml-2">({t.brandName} • {t.status})</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content / Reels */}
          {matchingContent.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-muted uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <Send size={12} className="text-brand-500" />
                Posting / Reels
              </div>
              <div className="space-y-1">
                {matchingContent.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedReviewContentId(c.id);
                      setIsSearchModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-brand-50 text-left text-xs text-slate-primary transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-semibold">{c.title}</span>
                      <span className="text-[11px] text-slate-muted ml-2">({c.brandName} • {c.contentType})</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shoots */}
          {matchingShoots.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-muted uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <Camera size={12} className="text-amber-500" />
                Shoots
              </div>
              <div className="space-y-1">
                {matchingShoots.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveTab('shoots');
                      setIsSearchModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-brand-50 text-left text-xs text-slate-primary transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-[11px] text-slate-muted ml-2">({s.brandName} • {s.shootDate})</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {matchingBrands.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-muted uppercase tracking-wider px-2 mb-1 flex items-center gap-1.5">
                <Briefcase size={12} className="text-brand-500" />
                Brands
              </div>
              <div className="space-y-1">
                {matchingBrands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setActiveTab('brands');
                      setIsSearchModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-brand-50 text-left text-xs text-slate-primary transition-colors"
                  >
                    <div className="truncate">
                      <span className="font-semibold">{b.name}</span>
                      <span className="text-[11px] text-slate-muted ml-2">({b.tagline})</span>
                    </div>
                    <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
