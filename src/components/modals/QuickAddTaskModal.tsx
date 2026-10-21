'use client';

import React, { useState } from 'react';
import { X, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { TaskCategory, TaskPriority } from '@/lib/types';

export default function QuickAddTaskModal() {
  const { 
    isQuickAddTaskOpen, 
    setIsQuickAddTaskOpen, 
    createTask, 
    brands, 
    team, 
    activeBrandId, 
    settings 
  } = useBrandFlow();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState(activeBrandId === 'all' ? (brands[0]?.id || '') : activeBrandId);
  const [category, setCategory] = useState<TaskCategory>('General');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [collaboratorName, setCollaboratorName] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [checklist, setChecklist] = useState<{ id: string; title: string; isCompleted: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickAddTaskOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist(prev => [...prev, { id: `c-${Date.now()}`, title: newChecklistText.trim(), isCompleted: false }]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brandId) return;

    setIsSubmitting(true);
    const selectedBrand = brands.find(b => b.id === brandId);

    const fullDueDate = `${dueDate}T${dueTime}:00Z`;

    await createTask({
      title: title.trim(),
      description: description.trim(),
      brandId,
      brandName: selectedBrand?.name || 'General',
      category,
      priority,
      status: 'To Do',
      assigneeId: 'me',
      assigneeName: 'Darsh',
      collaboratorName: collaboratorName || undefined,
      dueDate: fullDueDate,
      checklist,
    });

    setIsSubmitting(false);
    // Reset form
    setTitle('');
    setDescription('');
    setChecklist([]);
    setIsQuickAddTaskOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-brand-500" />
            <h2 className="text-sm font-bold text-slate-primary">Create New Universal Task</h2>
          </div>
          <button 
            onClick={() => setIsQuickAddTaskOpen(false)}
            className="p-1 rounded-md text-slate-muted hover:text-slate-primary hover:bg-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sort HOF shoot raw selects, Review Reel cut #2, Client checkin..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Description / Brief</label>
            <textarea
              rows={2}
              placeholder="Detailed instructions, links, or expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
            />
          </div>

          {/* Brand & Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Discuss / Coordinate With</label>
              <select
                value={collaboratorName}
                onChange={(e) => setCollaboratorName(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
              >
                <option value="">Solo Task (No partner)</option>
                {team.map(m => (
                  <option key={m.id} value={m.name}>w/ {m.name} ({m.department})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
              >
                {settings.taskCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary font-medium"
              >
                <option value="Critical">🔴 Critical</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white text-slate-primary"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1.5">Action Checklist</label>
            <div className="space-y-1.5 mb-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs bg-surface-subtle px-2.5 py-1.5 rounded border border-surface-border">
                  <span className="text-slate-primary">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-slate-muted hover:text-rose-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add checklist sub-item..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                className="flex-1 text-xs px-3 py-1.5 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsQuickAddTaskOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-muted hover:text-slate-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
