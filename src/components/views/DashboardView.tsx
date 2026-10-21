'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Send, 
  Camera, 
  BarChart3, 
  Trash2, 
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Video,
  Image as ImageIcon,
  CalendarDays,
  Clock,
  PauseCircle,
  Play,
  Plus,
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { Task, ContentItem, TaskPriority, TaskStatus } from '@/lib/types';
import { formatDateKey } from '@/lib/postingUtils';

const priorityWeight: Record<string, number> = {
  'Critical': 4,
  'High': 3,
  'Medium': 2,
  'Low': 1,
};

// Sort tasks strictly: Earliest Due Date first (19th -> 20th -> 21st -> 23rd -> 27th), then High Priority first
function sortTasksChronologically(taskList: Task[]): Task[] {
  return [...taskList].sort((a, b) => {
    const dateA = a.dueDate ? (a.dueDate.includes('T') ? a.dueDate.split('T')[0] : a.dueDate) : '9999-99-99';
    const dateB = b.dueDate ? (b.dueDate.includes('T') ? b.dueDate.split('T')[0] : b.dueDate) : '9999-99-99';

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    const pA = priorityWeight[a.priority] || 2;
    const pB = priorityWeight[b.priority] || 2;
    if (pA !== pB) {
      return pB - pA;
    }

    return a.title.localeCompare(b.title);
  });
}

export default function DashboardView() {
  const { 
    tasks, 
    shoots, 
    content, 
    meetings,
    ads, 
    brands, 
    activeBrandId, 
    toggleTaskDone, 
    createTask,
    updateTask,
    deleteTask,
    updateContent,
    setSelectedTaskId, 
    setActiveTab,
    currentUser,
    showToast
  } = useBrandFlow();

  const [taskBrandFilter, setTaskBrandFilter] = useState<string>('all');
  const [taskStatusTab, setTaskStatusTab] = useState<'active' | 'on_hold' | 'done'>('active');
  const visibleBrands = brands.filter(b => b.status !== 'archived');
  
  // Inline task creation state
  const [newInlineTaskTitle, setNewInlineTaskTitle] = useState('');
  const [inlineTaskBrandId, setInlineTaskBrandId] = useState(visibleBrands[0]?.id || '');
  const [inlinePriority, setInlinePriority] = useState<TaskPriority>('High');
  const [inlineDueDate, setInlineDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Dynamic Universal Calendar Dates for 3-Day Posting Window
  const now = new Date();
  const dPrev = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const datePrevKey = formatDateKey(dPrev);
  const date0Key = formatDateKey(d0);
  const date1Key = formatDateKey(d1);
  const date2Key = formatDateKey(d2);

  const datePrevLabel = `Yesterday • ${dPrev.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  const date0Label = `Today • ${d0.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  const date1Label = `Tomorrow • ${d1.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  const date2Label = `Day After • ${d2.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;

  const todayStr = date0Key;

  // 3-Day Posting schedule
  const sortPostsByStatus = (items: ContentItem[]) => {
    return [...items].sort((a, b) => {
      const aPosted = a.publishingStatus === 'Published' ? 1 : 0;
      const bPosted = b.publishingStatus === 'Published' ? 1 : 0;
      if (aPosted !== bPosted) return aPosted - bPosted;
      return a.title.localeCompare(b.title);
    });
  };

  const postsPrev = sortPostsByStatus(content.filter(c => c.scheduledDate === datePrevKey && (activeBrandId === 'all' || c.brandId === activeBrandId)));
  const postsDay0 = sortPostsByStatus(content.filter(c => c.scheduledDate === date0Key && (activeBrandId === 'all' || c.brandId === activeBrandId)));
  const postsDay1 = sortPostsByStatus(content.filter(c => c.scheduledDate === date1Key && (activeBrandId === 'all' || c.brandId === activeBrandId)));
  const postsDay2 = sortPostsByStatus(content.filter(c => c.scheduledDate === date2Key && (activeBrandId === 'all' || c.brandId === activeBrandId)));

  // Tasks Filtered by Brand
  const brandFilteredTasks = tasks.filter(t => taskBrandFilter === 'all' || t.brandId === taskBrandFilter);

  // Split tasks by status: Active (To Do, In Progress) vs On Hold vs Done
  const activeTasksRaw = brandFilteredTasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled' && t.status !== 'On Hold');
  const onHoldTasksRaw = brandFilteredTasks.filter(t => t.status === 'On Hold');
  const completedTasksRaw = brandFilteredTasks.filter(t => t.status === 'Done');

  // Sorted strictly: Earliest Due Date first, then High Priority
  const activeTasks = sortTasksChronologically(activeTasksRaw);
  const onHoldTasks = sortTasksChronologically(onHoldTasksRaw);
  const completedTasks = sortTasksChronologically(completedTasksRaw);

  // Today's Shoots & Meetings
  const todayShoots = shoots.filter(s => s.shootDate === todayStr && (activeBrandId === 'all' || s.brandId === activeBrandId));
  const todayMeetings = meetings.filter(m => m.date === todayStr && (activeBrandId === 'all' || m.brandId === activeBrandId));
  const activeAdCampaigns = ads.filter(a => a.status === 'Active' && (activeBrandId === 'all' || a.brandId === activeBrandId));

  // Toggle Post Status
  const handleTogglePosted = async (post: ContentItem) => {
    const isCurrentlyPublished = post.publishingStatus === 'Published';
    const newStatus = isCurrentlyPublished ? 'Scheduled' : 'Published';
    
    await updateContent({
      id: post.id,
      publishingStatus: newStatus,
      publishedAt: isCurrentlyPublished ? undefined : new Date().toISOString()
    });

    showToast({
      type: isCurrentlyPublished ? 'info' : 'success',
      title: isCurrentlyPublished ? 'Marked as Scheduled' : 'Marked as Posted! ✓',
      description: `${post.brandName}: ${post.title}`
    });
  };

  // Toggle Task On Hold
  const handleToggleHold = async (task: Task) => {
    const isCurrentlyHold = task.status === 'On Hold';
    const newStatus: TaskStatus = isCurrentlyHold ? 'To Do' : 'On Hold';
    await updateTask({
      id: task.id,
      status: newStatus
    });
    showToast({
      type: isCurrentlyHold ? 'info' : 'warning',
      title: isCurrentlyHold ? 'Task Resumed (To-Do)' : 'Task Put On Hold ⏸️',
      description: task.title
    });
  };

  // Inline Quick Task Add
  const handleAddInlineTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInlineTaskTitle.trim()) return;

    const brandToUse = visibleBrands.find(b => b.id === inlineTaskBrandId) || visibleBrands[0];
    await createTask({
      title: newInlineTaskTitle.trim(),
      description: 'Daily To-Do item',
      brandId: brandToUse?.id || 'b-1',
      brandName: brandToUse?.name || 'Brand',
      dueDate: inlineDueDate || todayStr,
      priority: inlinePriority,
      status: 'To Do',
      category: 'General',
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      assignedById: currentUser.id,
      assignedByName: currentUser.name
    });

    setNewInlineTaskTitle('');
    showToast({ 
      type: 'success', 
      title: 'Task Added ✓', 
      description: `${brandToUse?.name} • Due: ${inlineDueDate || 'Today'}` 
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Executive Top Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 border border-white/10 shadow-elevated">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-500/30 flex items-center gap-1">
                <Sparkles size={11} className="text-brand-400" />
                Brand Manager Hub
              </span>
              <span className="text-xs text-slate-400">
                {d0.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Daily Operations Control
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Real-time synchronization of your daily to-dos, 3-day posting releases, shoots, client meetings, and ad follow-ups.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-bold text-slate-300 uppercase">Pending Tasks</div>
              <div className="text-lg font-bold text-white font-mono">{activeTasks.length}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-bold text-slate-300 uppercase">Today Posts</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{postsDay0.length}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-bold text-slate-300 uppercase">On Hold</div>
              <div className="text-lg font-bold text-amber-300 font-mono">{onHoldTasks.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three-Day Posting Schedule Window */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-brand-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Posting Schedule Timeline (Yesterday → Today → Advance)
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('posting')}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 hover:underline flex items-center gap-1"
          >
            <span>Full Posting Calendar</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {/* 4-Column Grid: Yesterday, Today, Tomorrow, Day After */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Yesterday */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">{datePrevLabel}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Past ({postsPrev.length})
                </span>
              </div>
              {postsPrev.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">No posts yesterday.</div>
              ) : (
                <div className="space-y-2">
                  {postsPrev.map(post => {
                    const isPosted = post.publishingStatus === 'Published';
                    return (
                      <div key={post.id} className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                        isPosted ? 'bg-emerald-50/60 border-emerald-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                      }`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {post.brandName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            post.contentType === 'Reel' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {post.contentType === 'Reel' ? <Video size={9} /> : <ImageIcon size={9} />}
                            <span>{post.contentType === 'Reel' ? 'Reel' : 'Graphic'}</span>
                          </span>
                        </div>
                        <div className={`text-xs font-bold truncate ${isPosted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {post.title}
                        </div>
                        <button
                          onClick={() => handleTogglePosted(post)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isPosted ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <CheckCircle2 size={12} className={isPosted ? 'text-emerald-700' : 'text-slate-300'} />
                          <span>{isPosted ? 'Posted ✓' : 'Mark as Posted'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Today (Highlighted) */}
          <div className="bg-brand-50/40 rounded-2xl border-2 border-brand-500/40 p-4 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-brand-200">
                <span className="text-xs font-bold text-brand-900">{date0Label}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-600 text-white px-2 py-0.5 rounded shadow-2xs">
                  Today ({postsDay0.length})
                </span>
              </div>
              {postsDay0.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">No posts scheduled for today.</div>
              ) : (
                <div className="space-y-2">
                  {postsDay0.map(post => {
                    const isPosted = post.publishingStatus === 'Published';
                    return (
                      <div key={post.id} className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                        isPosted ? 'bg-emerald-50/70 border-emerald-200 opacity-60' : 'bg-white border-brand-200 shadow-2xs'
                      }`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-100 text-brand-800 border border-brand-200">
                            {post.brandName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            post.contentType === 'Reel' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {post.contentType === 'Reel' ? <Video size={9} /> : <ImageIcon size={9} />}
                            <span>{post.contentType === 'Reel' ? 'Reel' : 'Graphic'}</span>
                          </span>
                        </div>
                        <div className={`text-xs font-bold truncate ${isPosted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {post.title}
                        </div>
                        <button
                          onClick={() => handleTogglePosted(post)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isPosted ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 size={12} className={isPosted ? 'text-emerald-700' : 'text-brand-200'} />
                          <span>{isPosted ? 'Posted ✓' : 'Mark as Posted'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tomorrow */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">{date1Label}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Advance +1 ({postsDay1.length})
                </span>
              </div>
              {postsDay1.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">No posts tomorrow.</div>
              ) : (
                <div className="space-y-2">
                  {postsDay1.map(post => {
                    const isPosted = post.publishingStatus === 'Published';
                    return (
                      <div key={post.id} className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                        isPosted ? 'bg-emerald-50/60 border-emerald-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                      }`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {post.brandName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            post.contentType === 'Reel' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {post.contentType === 'Reel' ? <Video size={9} /> : <ImageIcon size={9} />}
                            <span>{post.contentType === 'Reel' ? 'Reel' : 'Graphic'}</span>
                          </span>
                        </div>
                        <div className={`text-xs font-bold truncate ${isPosted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {post.title}
                        </div>
                        <button
                          onClick={() => handleTogglePosted(post)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isPosted ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <CheckCircle2 size={12} className={isPosted ? 'text-emerald-700' : 'text-slate-300'} />
                          <span>{isPosted ? 'Posted ✓' : 'Mark as Posted'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Day After Tomorrow */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">{date2Label}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Advance +2 ({postsDay2.length})
                </span>
              </div>
              {postsDay2.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 italic">No posts for day after.</div>
              ) : (
                <div className="space-y-2">
                  {postsDay2.map(post => {
                    const isPosted = post.publishingStatus === 'Published';
                    return (
                      <div key={post.id} className={`p-3 rounded-xl border transition-all flex flex-col gap-2 ${
                        isPosted ? 'bg-emerald-50/60 border-emerald-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                      }`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {post.brandName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-1 ${
                            post.contentType === 'Reel' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {post.contentType === 'Reel' ? <Video size={9} /> : <ImageIcon size={9} />}
                            <span>{post.contentType === 'Reel' ? 'Reel' : 'Graphic'}</span>
                          </span>
                        </div>
                        <div className={`text-xs font-bold truncate ${isPosted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {post.title}
                        </div>
                        <button
                          onClick={() => handleTogglePosted(post)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isPosted ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300' : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <CheckCircle2 size={12} className={isPosted ? 'text-emerald-700' : 'text-slate-300'} />
                          <span>{isPosted ? 'Posted ✓' : 'Mark as Posted'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Main Dashboard Grid: Left 2 Cols (To-Do Tasks) & Right 1 Col (Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Notion-Style Daily To-Do List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            
            {/* Header & Status Switcher Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-brand-600" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Daily To-Do Tasks
                </h2>
              </div>

              {/* Status Switcher: Active (To Do) vs On Hold vs Completed */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTaskStatusTab('active')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    taskStatusTab === 'active' 
                      ? 'bg-white text-slate-900 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Active To-Dos</span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full text-slate-800">
                    {activeTasks.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskStatusTab('on_hold')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    taskStatusTab === 'on_hold' 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'text-amber-800 hover:bg-amber-100/50'
                  }`}
                >
                  <PauseCircle size={13} />
                  <span>On Hold</span>
                  {onHoldTasks.length > 0 && (
                    <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full text-white">
                      {onHoldTasks.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTaskStatusTab('done')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    taskStatusTab === 'done' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Check size={13} />
                  <span>Completed</span>
                  {completedTasks.length > 0 && (
                    <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full text-slate-800">
                      {completedTasks.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Brand Filter Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setTaskBrandFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  taskBrandFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>All Brands</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  taskBrandFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled').length}
                </span>
              </button>

              {visibleBrands.map(b => {
                const bCount = tasks.filter(t => t.brandId === b.id && t.status !== 'Done' && t.status !== 'Cancelled').length;
                const isSelected = taskBrandFilter === b.id;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setTaskBrandFilter(b.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.brandColor }} />
                    <span>{b.name}</span>
                    {bCount > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {bCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notion-Style Quick Add Task Form */}
            <form onSubmit={handleAddInlineTask} className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <input
                type="text"
                value={newInlineTaskTitle}
                onChange={(e) => setNewInlineTaskTitle(e.target.value)}
                placeholder="+ Add a new to-do task (type title and pick date/priority)..."
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 text-slate-800 placeholder-slate-400 font-medium"
              />
              
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Brand select */}
                  <select
                    value={inlineTaskBrandId}
                    onChange={(e) => setInlineTaskBrandId(e.target.value)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none shadow-2xs"
                  >
                    {visibleBrands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>

                  {/* Priority select */}
                  <select
                    value={inlinePriority}
                    onChange={(e) => setInlinePriority(e.target.value as TaskPriority)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none shadow-2xs"
                  >
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="Low">🟢 Low Priority</option>
                  </select>

                  {/* Date picker */}
                  <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-200 rounded-xl shadow-2xs text-[11px]">
                    <span className="text-slate-400 font-medium">Due:</span>
                    <input
                      type="date"
                      value={inlineDueDate}
                      onChange={(e) => setInlineDueDate(e.target.value)}
                      className="bg-transparent border-none text-[11px] font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newInlineTaskTitle.trim()}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 shadow-xs flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add To-Do</span>
                </button>
              </div>
            </form>

            {/* Task Items List (Sorted Date-wise: 19th -> 20th -> 21st -> 23rd -> 27th) */}
            <div className="space-y-2 pt-1">
              {(() => {
                const currentList = taskStatusTab === 'active' 
                  ? activeTasks 
                  : taskStatusTab === 'on_hold' 
                  ? onHoldTasks 
                  : completedTasks;

                if (currentList.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-slate-400 italic">
                      {taskStatusTab === 'active' && '🎉 All active to-dos are done! Add a task above.'}
                      {taskStatusTab === 'on_hold' && 'No tasks currently on hold.'}
                      {taskStatusTab === 'done' && 'No tasks completed yet today.'}
                    </div>
                  );
                }

                return currentList.map((t) => {
                  const isDone = t.status === 'Done';
                  const isOnHold = t.status === 'On Hold';
                  const taskDateStr = t.dueDate ? (t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate) : '';
                  const isOverdue = taskDateStr && taskDateStr < todayStr && !isDone;
                  const isToday = taskDateStr === todayStr;

                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                        isDone 
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400 opacity-60' 
                          : isOnHold
                          ? 'bg-amber-50/70 border-amber-300/80 shadow-2xs'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Left: Complete Circle & Task Details */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskDone(t)}
                          className={`mt-0.5 flex-shrink-0 transition-transform active:scale-95 ${
                            isDone ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-500'
                          }`}
                          title={isDone ? 'Mark as Not Done' : 'Mark Done'}
                        >
                          {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Brand Indicator + Priority + Date Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Brand Pill */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                              <span>{t.brandName}</span>
                            </span>

                            {/* Priority Badge */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.priority === 'Critical' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : t.priority === 'High'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : t.priority === 'Medium'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {t.priority} Priority
                            </span>

                            {/* Due Date Chip */}
                            {taskDateStr && (
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isOverdue
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : isToday
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                <Clock size={10} />
                                <span>{isToday ? 'Today' : isOverdue ? `Overdue • ${taskDateStr}` : taskDateStr}</span>
                              </span>
                            )}

                            {/* Status Pill if On Hold */}
                            {isOnHold && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 flex items-center gap-1">
                                <PauseCircle size={10} />
                                <span>On Hold</span>
                              </span>
                            )}
                          </div>

                          {/* Task Title */}
                          <div
                            onClick={() => setSelectedTaskId(t.id)}
                            className={`text-xs sm:text-sm font-bold truncate cursor-pointer transition-colors ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900 hover:text-brand-600'
                            }`}
                          >
                            {t.title}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions: Hold / Resume Button & Delete */}
                      <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => handleToggleHold(t)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 border ${
                              isOnHold
                                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-2xs'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border-slate-200'
                            }`}
                            title={isOnHold ? 'Resume Task' : 'Put Task On Hold'}
                          >
                            {isOnHold ? <Play size={11} /> : <PauseCircle size={11} />}
                            <span>{isOnHold ? 'Resume' : 'Hold'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteTask(t.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Widgets */}
        <div className="space-y-4">
          
          {/* Widget 1: Today's Schedule & Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-teal-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Today&apos;s Timeline ({todayShoots.length + todayMeetings.length})
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-[10px] text-brand-600 font-semibold hover:underline"
              >
                Calendar View →
              </button>
            </div>

            {todayShoots.length === 0 && todayMeetings.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-400 italic">
                No shoots or meetings scheduled for today.
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeetings.map(m => (
                  <div key={m.id} className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-900">👥 {m.brandName} Meeting</span>
                      <span className="font-mono text-[10px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                        {m.startTime} {m.endTime ? `- ${m.endTime}` : ''}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate">{m.title}</div>
                    {m.meetingLink && (
                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 pt-0.5"
                      >
                        <Video size={10} />
                        <span>Join Call</span>
                      </a>
                    )}
                  </div>
                ))}

                {todayShoots.map(s => (
                  <div key={s.id} className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900">📸 {s.brandName} Shoot</span>
                      <span className="font-mono text-[10px] font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-purple-200">
                        {s.startTime} {s.endTime ? `- ${s.endTime}` : ''}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 truncate">{s.title}</div>
                    {s.location && (
                      <div className="text-[10px] text-slate-500">📍 {s.location}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: Active Ad Campaigns & Auto Follow-ups */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Active Ad Campaigns ({activeAdCampaigns.length})
                </h3>
              </div>
              <button 
                onClick={() => setActiveTab('ads')}
                className="text-[10px] text-indigo-600 font-semibold hover:underline"
              >
                Ads & Follow-ups →
              </button>
            </div>

            {activeAdCampaigns.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-400 italic">
                No active ad campaigns running.
              </div>
            ) : (
              <div className="space-y-2">
                {activeAdCampaigns.slice(0, 3).map((ad) => (
                  <div key={ad.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ad.brandName}</span>
                      <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-700 truncate">{ad.name}</div>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>{ad.startDate} → {ad.endDate}</span>
                      <span className="font-bold text-indigo-600">
                        {ad.analysisDates?.length || 1} Follow-ups
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
