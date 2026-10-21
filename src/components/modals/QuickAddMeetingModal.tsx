'use client';

import React, { useState } from 'react';
import { X, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function QuickAddMeetingModal() {
  const { 
    isQuickAddMeetingOpen, 
    setIsQuickAddMeetingOpen, 
    createMeeting, 
    brands, 
    team, 
    activeBrandId 
  } = useBrandFlow();

  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(activeBrandId === 'all' ? (brands[0]?.id || '') : activeBrandId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('15:00');
  const [endTime, setEndTime] = useState('15:45');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
  const [agenda, setAgenda] = useState('');
  const [attendees, setAttendees] = useState<string[]>(['Darsh (Brand Manager)']);
  const [newAttendee, setNewAttendee] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickAddMeetingOpen) return null;

  const handleAddAttendee = () => {
    if (!newAttendee.trim()) return;
    setAttendees(prev => [...prev, newAttendee.trim()]);
    setNewAttendee('');
  };

  const handleRemoveAttendee = (index: number) => {
    setAttendees(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brandId) return;

    setIsSubmitting(true);
    const selectedBrand = brands.find(b => b.id === brandId);

    await createMeeting({
      title: title.trim(),
      brandId,
      brandName: selectedBrand?.name || 'Brand',
      date,
      startTime,
      endTime,
      meetingLink: meetingLink.trim(),
      agenda: agenda.trim(),
      attendees,
      notes: '',
      decisions: '',
      actionItems: [],
    });

    setIsSubmitting(false);
    setTitle('');
    setAgenda('');
    setIsQuickAddMeetingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-brand-500" />
            <h2 className="text-sm font-bold text-slate-primary">Schedule Meeting / Client Sync</h2>
          </div>
          <button 
            onClick={() => setIsQuickAddMeetingOpen(false)}
            className="p-1 rounded-md text-slate-muted hover:text-slate-primary hover:bg-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Meeting Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HOF Weekly Review with Sanjay, Lafayette Shoot Sync..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Meeting Link / Location</label>
            <input
              type="text"
              placeholder="https://meet.google.com/xyz or Office Conference Room"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Agenda */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Agenda & Discussion Points</label>
            <textarea
              rows={2}
              placeholder="1. Review reel edits\n2. Next month shoot budget\n3. Client approvals"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1.5">Attendees</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attendees.map((att, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                  <span>{att}</span>
                  <button type="button" onClick={() => handleRemoveAttendee(i)} className="text-slate-400 hover:text-rose-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add attendee (e.g. Pinky, Sanjay Singhania)..."
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAttendee(); } }}
                className="flex-1 text-xs px-3 py-1.5 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
              <button
                type="button"
                onClick={handleAddAttendee}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsQuickAddMeetingOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-muted hover:text-slate-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Save Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
