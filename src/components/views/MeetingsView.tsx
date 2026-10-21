'use client';

import React, { useState } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Calendar, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Trash2, 
  Video,
  Search,
  Users,
  FileText,
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

function formatTime12(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/am|pm/i.test(trimmed)) return trimmed;
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    if (isNaN(hours)) return trimmed;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  }
  return trimmed;
}

function formatTimeRange(start?: string, end?: string): string {
  const s = formatTime12(start);
  const e = formatTime12(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  if (e) return `Until ${e}`;
  return 'Flexible Time';
}

export default function MeetingsView() {
  const { 
    meetings, 
    brands,
    activeBrandId, 
    setActiveBrandId,
    setIsQuickAddMeetingOpen, 
    convertMeetingActionItem,
    deleteMeeting,
    setActiveTab
  } = useBrandFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<'all' | string>(activeBrandId);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleBrands = brands.filter(b => b.status !== 'archived');

  // Filter meetings
  const filteredMeetings = meetings.filter(m => {
    const matchesBrand = selectedBrandFilter === 'all' || m.brandId === selectedBrandFilter;
    const matchesSearch = !searchQuery.trim() || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.attendees.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBrand && matchesSearch;
  });

  // Sort chronologically (upcoming / latest first)
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    return b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime);
  });

  const handleDeleteMeeting = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete meeting "${title}"?`)) {
      setDeletingId(id);
      await deleteMeeting(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Obsidian Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-teal-950/80 p-6 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <CalendarDays size={12} className="text-teal-400" />
                Meetings & Syncs
              </span>
              <span className="text-[11px] text-slate-400">
                {meetings.length} Scheduled Sessions
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Client Meetings & Review Hub
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Schedule meetings, set time-slots (e.g. 10:00 AM - 11:00 AM), capture discussion notes, and view everything synchronized side-by-side with your shoots on the calendar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15 transition-all"
            >
              <CalendarIcon size={14} />
              <span>View in Calendar</span>
            </button>
            <button
              onClick={() => setIsQuickAddMeetingOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={15} />
              <span>+ Schedule Meeting</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Brand Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedBrandFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              selectedBrandFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>All Brands</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedBrandFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {meetings.length}
            </span>
          </button>

          {visibleBrands.map(b => {
            const bCount = meetings.filter(m => m.brandId === b.id).length;
            const isSelected = selectedBrandFilter === b.id;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBrandFilter(b.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
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

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings or attendees..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800"
          />
        </div>
      </div>

      {/* Meetings Grid */}
      {sortedMeetings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <CalendarDays size={26} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? 'No matching meetings found' : 'No meetings scheduled yet'}
            </h3>
            <p className="text-xs text-slate-500">
              Schedule client review calls, strategy syncs, or shoot prep sessions. All meetings automatically display on your unified calendar with their exact time intervals.
            </p>
          </div>
          <button
            onClick={() => setIsQuickAddMeetingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-500/20"
          >
            <Plus size={14} />
            <span>Schedule First Meeting</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sortedMeetings.map((m) => (
            <div
              key={m.id}
              className="glass-card glass-card-hover rounded-2xl border border-slate-200/90 p-6 space-y-4 transition-all duration-200 relative group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 mb-1.5 inline-block">
                    {m.brandName}
                  </span>
                  <h3 className="text-base font-bold text-slate-800">{m.title}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {m.meetingLink && (
                    <a
                      href={m.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition-colors font-semibold shadow-2xs"
                    >
                      <Video size={13} />
                      <span>Join Call</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteMeeting(m.id, m.title)}
                    disabled={deletingId === m.id}
                    title="Delete meeting"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Exact Time Slot & Attendees */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-teal-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800">{m.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-teal-600 flex-shrink-0" />
                  <span className="font-mono font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded">
                    {formatTimeRange(m.startTime, m.endTime)}
                  </span>
                </div>
                {m.attendees && m.attendees.length > 0 && (
                  <div className="col-span-2 text-[11px] text-slate-500 truncate pt-2 border-t border-slate-200/70 mt-1 flex items-center gap-1.5">
                    <Users size={12} className="text-slate-400 flex-shrink-0" />
                    <span>Attendees: <strong className="text-slate-700">{m.attendees.join(', ')}</strong></span>
                  </div>
                )}
              </div>

              {/* Agenda & Notes */}
              {(m.notes || m.agenda) && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <FileText size={11} />
                    <span>Agenda & Discussion Notes</span>
                  </div>
                  <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
                    {m.notes || m.agenda}
                  </div>
                </div>
              )}

              {/* Decisions / Signoff */}
              {m.decisions && (
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs text-emerald-950">
                  <strong className="text-emerald-800">Client Signoff & Decisions:</strong> {m.decisions}
                </div>
              )}

              {/* Action Items with 1-Click Task Conversion */}
              {m.actionItems && m.actionItems.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Action Items:</span>
                    <span className="text-teal-700 font-semibold text-[11px]">1-Click convert to Universal Task</span>
                  </div>

                  {m.actionItems.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{act.text}</div>
                        {act.assignee && (
                          <div className="text-[11px] text-slate-500 mt-0.5">Assigned to: <strong className="text-slate-700">{act.assignee}</strong></div>
                        )}
                      </div>

                      {act.isConvertedToTask ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 size={13} />
                          Task Active
                        </span>
                      ) : (
                        <button
                          onClick={() => convertMeetingActionItem(m.id, act.id)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-sm flex-shrink-0 transition-all"
                        >
                          Convert to Task →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer action to view on calendar */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                >
                  <CalendarIcon size={12} />
                  <span>Show on Calendar Timeline →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
