'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  GitFork,
  Calendar,
  Layers,
  Kanban,
  List,
  Sparkles,
  Flame,
  ArrowUpRight,
  Trash2,
  Users,
  PauseCircle,
  Play
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { Task, TaskPriority, TaskStatus } from '@/lib/types';

export default function TasksView() {
  const { 
    tasks, 
    brands, 
    team, 
    activeBrandId, 
    toggleTaskDone, 
    createTask,
    updateTask,
    deleteTask,
    setSelectedTaskId, 
    setIsQuickAddTaskOpen,
    settings,
    currentUser,
    showToast
  } = useBrandFlow();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>(activeBrandId);
  const [selectedCollab, setSelectedCollab] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const visibleBrands = brands.filter(b => b.status !== 'archived');

  // Inline Quick Add
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineBrand, setInlineBrand] = useState(visibleBrands[0]?.id || 'b-1');

  const priorityWeight: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
  };

  const filtered = tasks.filter((t) => {
    if (activeBrandId !== 'all' && t.brandId !== activeBrandId) return false;
    if (selectedBrand !== 'all' && t.brandId !== selectedBrand) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedCollab !== 'all' && t.collaboratorName !== selectedCollab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.brandName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort tasks chronologically: Earliest due date first (19 -> 20 -> 21 -> 23 -> 27), then High priority first
  const sortedTasks = [...filtered].sort((a, b) => {
    const aDone = a.status === 'Done' ? 1 : 0;
    const bDone = b.status === 'Done' ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;

    const dateA = a.dueDate ? (a.dueDate.includes('T') ? a.dueDate.split('T')[0] : a.dueDate) : '9999-99-99';
    const dateB = b.dueDate ? (b.dueDate.includes('T') ? b.dueDate.split('T')[0] : b.dueDate) : '9999-99-99';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const pA = priorityWeight[a.priority] || 2;
    const pB = priorityWeight[b.priority] || 2;
    if (pA !== pB) return pB - pA;

    return a.title.localeCompare(b.title);
  });

  const handleToggleHold = async (task: Task) => {
    const isHold = task.status === 'On Hold';
    const newStatus: TaskStatus = isHold ? 'To Do' : 'On Hold';
    await updateTask({ id: task.id, status: newStatus });
    showToast({
      type: isHold ? 'info' : 'warning',
      title: isHold ? 'Task Resumed (To Do)' : 'Task On Hold ⏸️',
      description: task.title
    });
  };

  const handleInlineAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    const brandObj = brands.find(b => b.id === inlineBrand) || brands[0];
    await createTask({
      title: inlineTitle.trim(),
      description: 'Quick task entry',
      brandId: brandObj?.id || 'b-1',
      brandName: brandObj?.name || 'Brand',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'To Do',
      category: 'General',
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      assignedById: currentUser.id,
      assignedByName: currentUser.name
    });

    setInlineTitle('');
    showToast({ type: 'success', title: 'Task Added', description: inlineTitle.trim() });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  return (
    <div className="space-y-5 pb-16 max-w-6xl mx-auto">
      {/* Top Banner & Quick Controls */}
      <div className="glass-card p-4 rounded-2xl shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search your daily tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'list' ? 'bg-white shadow-2xs font-bold text-slate-800' : 'text-slate-400 hover:text-slate-700'}`}
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-all ${viewMode === 'kanban' ? 'bg-white shadow-2xs font-bold text-slate-800' : 'text-slate-400 hover:text-slate-700'}`}
              title="Kanban Board"
            >
              <Kanban size={15} />
            </button>
          </div>

          <button
            onClick={() => setIsQuickAddTaskOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus size={15} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Notion-Style Quick Add Row */}
      <form onSubmit={handleInlineAdd} className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <input
          type="text"
          value={inlineTitle}
          onChange={(e) => setInlineTitle(e.target.value)}
          placeholder="+ Add a quick to-do task (type title and hit Enter)..."
          className="flex-1 text-xs px-3 py-1.5 bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
        />
        <select
          value={inlineBrand}
          onChange={(e) => setInlineBrand(e.target.value)}
          className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
        >
          {visibleBrands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!inlineTitle.trim()}
          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
        >
          Add To-Do
        </button>
      </form>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-1 font-semibold text-[11px]">
          <Filter size={13} />
          <span>Filters:</span>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none shadow-2xs"
        >
          <option value="all">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="On Hold">⏸️ On Hold</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none shadow-2xs"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">🔴 Critical Priority</option>
          <option value="High">🟠 High Priority</option>
          <option value="Medium">🟡 Medium Priority</option>
          <option value="Low">🟢 Low Priority</option>
        </select>

        {/* Colleague / Discussion Filter */}
        <select
          value={selectedCollab}
          onChange={(e) => setSelectedCollab(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none shadow-2xs"
        >
          <option value="all">All Discussion Partners</option>
          {team.map(m => (
            <option key={m.id} value={m.name}>w/ {m.name} ({m.department})</option>
          ))}
        </select>

        {(selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCollab !== 'all' || search) && (
          <button
            onClick={() => {
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSelectedCollab('all');
              setSearch('');
            }}
            className="text-brand-600 hover:text-brand-800 text-[11px] font-bold underline ml-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main View: List or Kanban */}
      {viewMode === 'list' ? (
        <div className="glass-card rounded-2xl overflow-hidden shadow-card border border-slate-200">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-7 sm:col-span-6">To-Do Task & Brand</div>
            <div className="col-span-2 hidden sm:block">Discussion Partner</div>
            <div className="col-span-2 sm:col-span-2 text-center">Status</div>
            <div className="col-span-3 sm:col-span-2 text-right pr-2">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {sortedTasks.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No tasks found matching your criteria.
              </div>
            ) : (
              sortedTasks.map((t) => {
                const isDone = t.status === 'Done';
                const isHold = t.status === 'On Hold';
                const isOverdue = t.dueDate && t.dueDate < new Date().toISOString().split('T')[0] && !isDone && !isHold;

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-colors group ${isHold ? 'bg-amber-50/20' : ''}`}
                  >
                    {/* Task Title & Brand */}
                    <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                      <button
                        onClick={() => toggleTaskDone(t)}
                        className="text-slate-300 hover:text-emerald-500 transition-colors flex-shrink-0"
                        title={isDone ? 'Mark Incomplete' : 'Mark Done'}
                      >
                        {isDone ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} />}
                      </button>

                      <div 
                        onClick={() => setSelectedTaskId(t.id)}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                            {t.brandName}
                          </span>
                          {t.priority === 'Critical' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded border border-rose-200">
                              Critical
                            </span>
                          )}
                          {t.priority === 'High' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-700 rounded border border-amber-200">
                              High
                            </span>
                          )}
                        </div>
                        <div className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : isHold ? 'text-amber-800' : 'text-slate-800 hover:text-brand-600 transition-colors'}`}>
                          {t.title}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isOverdue ? 'text-rose-600 font-bold' : isHold ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                          {isHold ? '⏸️ Paused / On Hold' : `Due: ${t.dueDate || 'Today'}`}
                        </div>
                      </div>
                    </div>

                    {/* Colleague / Discussion Partner */}
                    <div className="col-span-2 hidden sm:block text-xs text-slate-600 truncate">
                      {t.collaboratorName ? (
                        <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 text-[11px] font-medium">
                          w/ {t.collaboratorName}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">Solo</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2 sm:col-span-2 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        t.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        t.status === 'On Hold' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        t.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        t.status === 'In Review' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {t.status === 'On Hold' ? '⏸️ On Hold' : t.status}
                      </span>
                    </div>

                    {/* Actions: Details & Hold & Delete Button */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-1.5 pr-2">
                      <button
                        onClick={() => handleToggleHold(t)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                          t.status === 'On Hold'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                            : 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                        title={t.status === 'On Hold' ? 'Resume Task' : 'Put Task On Hold'}
                      >
                        {t.status === 'On Hold' ? <Play size={12} className="text-amber-700 fill-current" /> : <PauseCircle size={13} />}
                        <span className="hidden md:inline">{t.status === 'On Hold' ? 'Resume' : 'Hold'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedTaskId(t.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Details
                      </button>

                      <button
                        onClick={(e) => handleDelete(e, t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(['To Do', 'In Progress', 'In Review', 'On Hold', 'Done'] as TaskStatus[]).map((st) => {
            const columnTasks = sortedTasks.filter(t => t.status === st);
            return (
              <div key={st} className="glass-card p-3 rounded-2xl flex flex-col h-[70vh] shadow-card border border-slate-200">
                <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: st === 'Done' ? '#10B981' : st === 'On Hold' ? '#F59E0B' : st === 'In Progress' ? '#3B82F6' : st === 'In Review' ? '#8B5CF6' : '#94A3B8'
                    }} />
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{st}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                  {columnTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs cursor-pointer space-y-2 group transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700">
                          {t.brandName}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleHold(t);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                            title={t.status === 'On Hold' ? 'Resume' : 'Hold'}
                          >
                            {t.status === 'On Hold' ? <Play size={11} className="fill-current text-amber-600" /> : <PauseCircle size={12} />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, t.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove task"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className={`text-xs font-bold ${t.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {t.title}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                        <span>Due: {t.dueDate || 'Today'}</span>
                        {t.collaboratorName && (
                          <span className="text-purple-600 font-medium">w/ {t.collaboratorName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
