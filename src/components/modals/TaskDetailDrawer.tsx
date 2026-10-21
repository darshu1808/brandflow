'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  User, 
  Tag, 
  MessageSquare, 
  ListChecks, 
  History, 
  Trash2, 
  ExternalLink,
  GitFork,
  Send,
  Plus
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { TaskStatus, TaskPriority } from '@/lib/types';

export default function TaskDetailDrawer() {
  const { 
    selectedTaskId, 
    setSelectedTaskId, 
    tasks, 
    updateTask, 
    deleteTask, 
    toggleTaskDone, 
    currentUser, 
    team, 
    brands 
  } = useBrandFlow();

  const task = tasks.find(t => t.id === selectedTaskId);

  const [commentText, setCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId);
    }
  }, [task]);

  if (!task) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    await updateTask({
      id: task.id,
      status: newStatus,
    });
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setPriority(newPriority);
    await updateTask({
      id: task.id,
      priority: newPriority,
    });
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    const member = team.find(m => m.id === newAssigneeId);
    setAssigneeId(newAssigneeId);
    await updateTask({
      id: task.id,
      assigneeId: newAssigneeId,
      assigneeName: member?.name || 'Assigned',
    });
  };

  const handleToggleChecklist = async (itemId: string) => {
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    await updateTask({
      id: task.id,
      checklist: updatedChecklist,
    });
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistText.trim()) return;
    const updatedChecklist = [
      ...(task.checklist || []),
      { id: `c-${Date.now()}`, title: newChecklistText.trim(), isCompleted: false }
    ];
    await updateTask({
      id: task.id,
      checklist: updatedChecklist,
    });
    setNewChecklistText('');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedComments = [...(task.comments || []), newComment];
    await updateTask({
      id: task.id,
      comments: updatedComments,
    });
    setCommentText('');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
      setSelectedTaskId(null);
    }
  };

  const isDone = task.status === 'Done';

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-hover border-l border-surface-border flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleTaskDone(task)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-all border"
              style={{
                backgroundColor: isDone ? '#ECFDF5' : '#F8FAFC',
                borderColor: isDone ? '#10B981' : '#CBD5E1',
                color: isDone ? '#047857' : '#475569'
              }}
            >
              {isDone ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Circle size={15} />}
              <span>{isDone ? 'Completed' : 'Mark as Done'}</span>
            </button>
            <span className="text-xs text-slate-muted font-mono">{task.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-muted hover:text-rose-600 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 text-slate-muted hover:text-slate-primary rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Title & Brand */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                {task.brandName}
              </span>
              <span className="text-[11px] font-medium text-slate-muted bg-slate-100 px-2 py-0.5 rounded">
                {task.category}
              </span>
              {task.workflowStage && (
                <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                  <GitFork size={11} />
                  {task.workflowStage}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-primary leading-snug">
              {task.title}
            </h2>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-surface-subtle border border-surface-border rounded-xl">
            <div>
              <span className="block text-[11px] font-semibold text-slate-muted mb-1">Status</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-surface-border rounded-lg text-slate-primary"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting">Waiting</option>
                <option value="Blocked">Blocked</option>
                <option value="In Review">In Review</option>
                <option value="Changes Required">Changes Required</option>
                <option value="Approved">Approved</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-muted mb-1">Priority</span>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-surface-border rounded-lg text-slate-primary"
              >
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-muted mb-1">Assignee</span>
              <select
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full text-xs font-semibold px-2 py-1.5 bg-white border border-surface-border rounded-lg text-slate-primary"
              >
                {team.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Meta Dates & Completion */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-muted pb-3 border-b border-surface-border">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>Due: {new Date(task.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            {task.completedAt && (
              <div className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Completed by {task.completedByName || 'Team'} on {new Date(task.completedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-1.5">Instructions</h4>
              <p className="text-xs text-slate-600 bg-surface-subtle p-3 rounded-lg border border-surface-border leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider flex items-center gap-1.5">
                <ListChecks size={14} className="text-brand-500" />
                Checklist ({task.checklist?.filter(c => c.isCompleted).length || 0}/{(task.checklist || []).length})
              </h4>
            </div>

            <div className="space-y-1.5 mb-2">
              {(task.checklist || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className="flex items-center gap-2.5 p-2 bg-surface-subtle hover:bg-surface-muted rounded-lg border border-surface-border cursor-pointer transition-colors"
                >
                  {item.isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle size={16} className="text-slate-400 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-primary'}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add sub-task..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                className="flex-1 text-xs px-3 py-1.5 bg-surface-subtle border border-surface-border rounded-lg text-slate-primary focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handleAddChecklistItem}
                className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Activity History */}
          <div>
            <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History size={14} className="text-slate-400" />
              Activity Log & Audit Trail
            </h4>
            <div className="space-y-2 border-l-2 border-surface-border pl-3 ml-2">
              {(task.activityLog || []).map((act) => (
                <div key={act.id} className="text-[11px]">
                  <span className="font-semibold text-slate-primary">{act.user}: </span>
                  <span className="text-slate-600">{act.action}</span>
                  <span className="text-slate-400 text-[10px] ml-1">
                    ({new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Thread */}
          <div>
            <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-slate-400" />
              Team Comments
            </h4>
            <div className="space-y-2 mb-3">
              {(task.comments || []).map((comm) => (
                <div key={comm.id} className="p-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-primary">{comm.authorName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(comm.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{comm.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Leave feedback or note..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-slate-primary focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
