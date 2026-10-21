'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Camera, 
  Send, 
  Briefcase, 
  Users, 
  GitFork, 
  BarChart3, 
  FolderKanban, 
  CalendarDays, 
  Cpu, 
  PieChart, 
  Bell, 
  Settings, 
  Plus, 
  ChevronDown, 
  Check, 
  ChevronLeft,
  ChevronRight,
  Share2,
  Sparkles,
  Command,
  ChevronUp,
  LogOut
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    brands, 
    activeBrandId, 
    setActiveBrandId, 
    tasks, 
    shoots, 
    content, 
    meetings,
    notifications,
    currentUser,
    logout,
    setIsQuickAddTaskOpen,
    setIsQuickAddShootOpen,
    setIsQuickAddPostOpen,
    setIsQuickAddMeetingOpen,
    setIsWhatsAppSubmitOpen,
    setIsImportExportOpen
  } = useBrandFlow();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isQuickAddDropdownOpen, setIsQuickAddDropdownOpen] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  // Filter counts
  const filteredTasks = tasks.filter(t => activeBrandId === 'all' || t.brandId === activeBrandId);
  const pendingTasksCount = filteredTasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled').length;
  const todayKey = new Date().toISOString().split('T')[0];
  const todayPostsCount = content.filter(c => (activeBrandId === 'all' || c.brandId === activeBrandId) && c.scheduledDate === todayKey && c.publishingStatus !== 'Published').length;
  const filteredMeetings = meetings.filter(m => activeBrandId === 'all' || m.brandId === activeBrandId);
  const meetingsCount = filteredMeetings.length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  const visibleBrands = brands.filter(b => b.status !== 'archived');
  const currentBrand = visibleBrands.find(b => b.id === activeBrandId);

  // Primary Personal Daily Workflow
  const primaryNavItems = [
    { id: 'dashboard', label: 'Daily Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays, badge: meetingsCount > 0 ? meetingsCount : undefined },
    { id: 'shoots', label: 'Shoot Planner (2/mo)', icon: Camera, badge: shoots.filter(s => s.status !== 'Completed').length },
    { id: 'posting', label: 'Posting Schedule', icon: Send, badge: todayPostsCount > 0 ? todayPostsCount : undefined },
    { id: 'brands', label: 'Brands & Sheets', icon: Briefcase, badge: visibleBrands.length },
    { id: 'team', label: 'Collaborators', icon: Users },
    { id: 'ads', label: 'Daily Ads Check', icon: BarChart3 },
  ];

  // Secondary Tools (Available if needed, collapsed by default)
  const secondaryNavItems = [
    { id: 'projects', label: 'Projects / Deliverables', icon: FolderKanban },
    { id: 'workflows', label: 'Pipelines & Workflows', icon: GitFork },
    { id: 'automations', label: 'Automation Rules', icon: Cpu },
    { id: 'reports', label: 'Analytics Reports', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen sidebar-dark text-slate-300 z-30 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-glow">
                B
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white tracking-tight text-sm">BrandFlow</span>
                  <span className="text-[9px] font-bold bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/30">
                    PERSONAL
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Daily Command Center</div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-glow">
              B
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Brand Selector Dropdown */}
        <div className="p-3 border-b border-white/[0.08] relative">
          <button
            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-white transition-all"
          >
            <div className="flex items-center gap-2.5 truncate">
              {currentBrand ? (
                <>
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: currentBrand.brandColor }} 
                  />
                  <span className="truncate">{currentBrand.name}</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-400 flex-shrink-0 animate-pulse" />
                  <span className="truncate">All Brands Workspace</span>
                </>
              )}
            </div>
            {!isCollapsed && <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
          </button>

          {/* Dropdown Menu */}
          {isBrandDropdownOpen && !isCollapsed && (
            <div className="absolute top-14 left-3 right-3 bg-obsidian-900 border border-white/[0.12] rounded-xl shadow-elevated py-1.5 z-50 backdrop-blur-xl">
              <button
                onClick={() => { setActiveBrandId('all'); setIsBrandDropdownOpen(false); }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/[0.08] transition-colors ${
                  activeBrandId === 'all' ? 'text-brand-300 font-bold bg-white/[0.05]' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>All Brands</span>
                </div>
                {activeBrandId === 'all' && <Check size={14} className="text-brand-400" />}
              </button>

              <div className="h-px bg-white/[0.08] my-1" />

              {visibleBrands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setActiveBrandId(b.id); setIsBrandDropdownOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/[0.08] transition-colors ${
                    activeBrandId === b.id ? 'text-brand-300 font-bold bg-white/[0.05]' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.brandColor }} />
                    <span className="truncate">{b.name}</span>
                  </div>
                  {activeBrandId === b.id && <Check size={14} className="text-brand-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="p-3">
          <div className="relative">
            <button
              onClick={() => setIsQuickAddDropdownOpen(!isQuickAddDropdownOpen)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} />
              {!isCollapsed && <span>Quick Add</span>}
              {!isCollapsed && <ChevronDown size={13} className="opacity-75" />}
            </button>

            {isQuickAddDropdownOpen && (
              <div className="absolute top-12 left-0 right-0 bg-obsidian-900 border border-white/[0.12] rounded-xl shadow-elevated py-1.5 z-50 backdrop-blur-xl">
                <button
                  onClick={() => { setIsQuickAddTaskOpen(true); setIsQuickAddDropdownOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.08] flex items-center gap-2.5"
                >
                  <CheckSquare size={14} className="text-brand-400" />
                  <span>New To-Do Task</span>
                </button>
                <button
                  onClick={() => { setIsQuickAddShootOpen(true); setIsQuickAddDropdownOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.08] flex items-center gap-2.5"
                >
                  <Camera size={14} className="text-purple-400" />
                  <span>Plan Shoot</span>
                </button>
                <button
                  onClick={() => { setIsQuickAddPostOpen(true); setIsQuickAddDropdownOpen(false); }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.08] flex items-center gap-2.5"
                >
                  <Send size={14} className="text-emerald-400" />
                  <span>Schedule Post</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1 mt-1 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Daily Workflow
            </div>
          )}

          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-500/15 text-white font-semibold border border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon 
                    size={16} 
                    className={isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'} 
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' 
                      : 'bg-white/[0.08] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary Tools Toggle */}
          {!isCollapsed && (
            <div className="pt-2">
              <button
                onClick={() => setShowMoreTools(!showMoreTools)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span>Other Modules</span>
                {showMoreTools ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>

              {showMoreTools && (
                <div className="space-y-0.5 pt-1 pl-2 border-l border-white/10 ml-2">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
                          isActive
                            ? 'text-brand-300 font-semibold bg-white/[0.05]'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon size={14} className={isActive ? 'text-brand-400' : 'text-slate-500'} />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Personal User Footer (Sole Operator - No Switcher Bloat) */}
      <div className="p-3 border-t border-white/[0.08]">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2.5 truncate">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-white/20 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="truncate flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-400 truncate font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{currentUser.name === 'Darsh' ? 'Brand Manager (You)' : currentUser.role.replace('_', ' ')}</span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] rounded-lg transition-colors flex-shrink-0"
              title="Sign out of BrandFlow"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
