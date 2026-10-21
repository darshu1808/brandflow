'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Camera, 
  Share2, 
  FileSpreadsheet, 
  Cloud, 
  Command,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function TopBar() {
  const { 
    currentUser, 
    notifications, 
    markAllNotificationsRead, 
    activeBrandId, 
    brands, 
    activeTab,
    setActiveTab, 
    setSelectedTaskId,
    setSelectedReviewContentId,
    setIsQuickAddTaskOpen,
    setIsQuickAddShootOpen,
    setIsWhatsAppSubmitOpen,
    setIsImportExportOpen,
    setIsSearchModalOpen,
    logout,
    settings
  } = useBrandFlow();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Time-aware greeting
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const currentBrand = brands.find(b => b.id === activeBrandId);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-20 flex items-center justify-between px-6 shadow-subtle">
      {/* Left: Breadcrumbs & Live Pulse */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-muted">
          <span className="font-bold text-slate-primary tracking-tight">BrandFlow</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="capitalize text-slate-primary font-semibold">
            {activeTab.replace('_', ' ')}
          </span>
        </div>

        {activeBrandId !== 'all' && currentBrand && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-surface-subtle border border-surface-border rounded-lg text-xs font-semibold text-slate-primary shadow-subtle">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentBrand.brandColor }} />
            <span>{currentBrand.name}</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Asia/Kolkata</span>
        </div>
      </div>

      {/* Middle: Linear/Raycast Style Global Search Input */}
      <div className="flex-1 max-w-md mx-6 hidden lg:block">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-surface-subtle hover:bg-surface-muted/80 border border-surface-border rounded-xl text-xs text-slate-muted transition-all shadow-subtle group"
        >
          <div className="flex items-center gap-2.5">
            <Search size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="font-normal text-slate-500">Quick search tasks, reels, shoots, brands...</span>
          </div>
          <kbd className="text-[10px] bg-white border border-surface-border px-1.5 py-0.5 rounded-md text-slate-500 font-mono shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & Notifications */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Buttons */}
        <div className="hidden sm:flex items-center gap-1.5 border-r border-surface-border pr-3">
          <button
            onClick={() => setIsQuickAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-surface-subtle hover:bg-surface-muted border border-surface-border rounded-lg transition-colors shadow-2xs"
            title="Create Task"
          >
            <Plus size={13} className="text-brand-600" />
            <span>Task</span>
          </button>

          <button
            onClick={() => setIsQuickAddShootOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-surface-subtle hover:bg-surface-muted border border-surface-border rounded-lg transition-colors shadow-2xs"
            title="Schedule Shoot"
          >
            <Camera size={13} className="text-purple-600" />
            <span>Shoot</span>
          </button>

          <button
            onClick={() => setIsWhatsAppSubmitOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
            title="WhatsApp Creative Intake"
          >
            <Share2 size={13} className="text-emerald-600" />
            <span>WhatsApp Intake</span>
          </button>

          <button
            onClick={() => setIsImportExportOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-surface-subtle border border-surface-border rounded-lg transition-colors shadow-2xs"
            title="Import/Export Excel or CSV"
          >
            <FileSpreadsheet size={15} />
          </button>
        </div>

        {/* Notifications Bell with Frosted Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-surface-subtle rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-12 w-84 sm:w-96 glass-card rounded-2xl shadow-elevated z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-surface-border flex items-center justify-between bg-surface-subtle/50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.2 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-muted">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.targetTab) setActiveTab(n.targetTab);
                        if (n.targetTab === 'tasks' && n.targetId) setSelectedTaskId(n.targetId);
                        if (n.targetTab === 'reviews' && n.targetId) setSelectedReviewContentId(n.targetId);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 text-xs hover:bg-brand-50/50 cursor-pointer transition-colors flex gap-3 ${
                        !n.isRead ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {!n.isRead ? (
                          <div className="w-2 h-2 rounded-full bg-brand-500 shadow-glow" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-primary">{n.title}</div>
                        <div className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-surface-border bg-surface-subtle/50 text-center">
                <button
                  onClick={() => { setActiveTab('notifications'); setIsNotifOpen(false); }}
                  className="text-[11px] text-brand-600 hover:underline font-bold"
                >
                  View full notifications center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Sign out of BrandFlow"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
