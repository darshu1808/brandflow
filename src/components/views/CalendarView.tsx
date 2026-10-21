'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Send, 
  CheckSquare, 
  CalendarDays, 
  Plus, 
  Clock, 
  Video, 
  MapPin, 
  Users, 
  ExternalLink, 
  X, 
  Filter 
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

function formatTimeSlot(start?: string, end?: string): string {
  const s = formatTime12(start);
  const e = formatTime12(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  if (e) return `Until ${e}`;
  return 'Flexible';
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface UnifiedEvent {
  id: string;
  type: 'shoot' | 'meeting' | 'post' | 'task';
  title: string;
  brandId: string;
  brandName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  timeSlot: string;
  location?: string;
  meetingLink?: string;
  attendees?: string[];
  team?: string;
  contentType?: string;
  priority?: string;
  status?: string;
  color: string;
  rawId: string;
}

export default function CalendarView() {
  const { 
    tasks, 
    shoots, 
    content, 
    meetings, 
    activeBrandId, 
    setSelectedTaskId, 
    setSelectedReviewContentId,
    setIsQuickAddShootOpen,
    setIsQuickAddMeetingOpen,
    setActiveTab
  } = useBrandFlow();

  const today = new Date();
  const todayStr = toDateKey(today);

  // Default to 'day' or 'month'. Let user easily switch.
  const [viewType, setViewType] = useState<'day' | 'month' | 'agenda'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedModalEvent, setSelectedModalEvent] = useState<UnifiedEvent | null>(null);

  const selectedDateStr = toDateKey(selectedDate);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper date keys for labels
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = toDateKey(tomorrow);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateKey(yesterday);

  // Day Navigation (Google Calendar Style: Today -> Tomorrow -> 23rd -> 24th...)
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Month Navigation (for month view)
  const handlePrevMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() - 1);
    setSelectedDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + 1);
    setSelectedDate(d);
  };

  // Label for current selected date
  const formatDayHeading = (dateKey: string) => {
    if (dateKey === todayStr) return 'Today';
    if (dateKey === tomorrowStr) return 'Tomorrow';
    if (dateKey === yesterdayStr) return 'Yesterday';
    const dObj = new Date(dateKey + 'T00:00:00');
    return isNaN(dObj.getTime())
      ? dateKey
      : dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const currentDayLabel = (() => {
    const heading = formatDayHeading(selectedDateStr);
    const fullDate = selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    if (heading === 'Today' || heading === 'Tomorrow' || heading === 'Yesterday') {
      return `${heading} • ${fullDate}`;
    }
    return fullDate;
  })();

  // 1. Compile All Unified Events (All Agenda Members — no special category)
  const allEvents: UnifiedEvent[] = [];

  // Shoots
  shoots.forEach(s => {
    if (!activeBrandId || activeBrandId === 'all' || s.brandId === activeBrandId) {
      if (s.shootDate) {
        allEvents.push({
          id: `shoot-${s.id}`,
          type: 'shoot',
          title: s.title,
          brandId: s.brandId,
          brandName: s.brandName,
          date: s.shootDate,
          startTime: s.startTime,
          endTime: s.endTime,
          timeSlot: formatTimeSlot(s.startTime, s.endTime),
          location: s.location,
          team: s.shootTeam || [s.photographer, s.videographer].filter(Boolean).join(', '),
          status: s.status,
          color: '#8B5CF6',
          rawId: s.id
        });
      }
    }
  });

  // Meetings
  meetings.forEach(m => {
    if (!activeBrandId || activeBrandId === 'all' || m.brandId === activeBrandId) {
      if (m.date) {
        allEvents.push({
          id: `meet-${m.id}`,
          type: 'meeting',
          title: m.title,
          brandId: m.brandId,
          brandName: m.brandName,
          date: m.date,
          startTime: m.startTime,
          endTime: m.endTime,
          timeSlot: formatTimeSlot(m.startTime, m.endTime),
          meetingLink: m.meetingLink,
          attendees: m.attendees,
          color: '#0D9488',
          rawId: m.id
        });
      }
    }
  });

  // Content / Posts
  content.forEach(c => {
    if (!activeBrandId || activeBrandId === 'all' || c.brandId === activeBrandId) {
      if (c.scheduledDate) {
        allEvents.push({
          id: `post-${c.id}`,
          type: 'post',
          title: c.title,
          brandId: c.brandId,
          brandName: c.brandName,
          date: c.scheduledDate,
          startTime: c.scheduledTime,
          timeSlot: formatTime12(c.scheduledTime) || 'Scheduled',
          contentType: c.contentType,
          status: c.publishingStatus,
          color: '#EC4899',
          rawId: c.id
        });
      }
    }
  });

  // Tasks
  tasks.forEach(t => {
    if (!activeBrandId || activeBrandId === 'all' || t.brandId === activeBrandId) {
      if (t.dueDate) {
        const dStr = t.dueDate.includes('T') ? t.dueDate.split('T')[0] : t.dueDate;
        allEvents.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          brandId: t.brandId,
          brandName: t.brandName,
          date: dStr,
          timeSlot: 'Deadline',
          priority: t.priority,
          status: t.status,
          color: t.priority === 'Critical' ? '#EF4444' : '#3B82F6',
          rawId: t.id
        });
      }
    }
  });

  // Events strictly for the selected date (No bleeding from other dates)
  const selectedDayEvents = allEvents
    .filter(e => e.date === selectedDateStr)
    .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'));

  // Month grid calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Google Calendar style 7-day strip centered around selectedDate
  const stripDates: Date[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    stripDates.push(d);
  }

  // Group events by date for Agenda Feed
  const groupedAgendaEvents: { [dateKey: string]: UnifiedEvent[] } = {};
  allEvents.forEach(evt => {
    if (!groupedAgendaEvents[evt.date]) {
      groupedAgendaEvents[evt.date] = [];
    }
    groupedAgendaEvents[evt.date].push(evt);
  });

  const sortedAgendaDates = Object.keys(groupedAgendaEvents).sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-5 pb-20">
      {/* Calendar Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-indigo-950/80 p-6 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 text-brand-300 rounded-xl border border-brand-500/30">
              <CalendarIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/20 px-2.5 py-0.5 rounded-full border border-brand-500/30">
                  Universal Calendar
                </span>
                <span className="text-xs text-slate-400">All Scheduled Agenda & Time-Slots</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {viewType === 'month' ? `${monthNames[month]} ${year}` : currentDayLabel}
              </h1>
              <p className="text-xs text-slate-300">
                Track all shoots, client meetings, reels, graphics, and deadlines date-wise without confusion.
              </p>
            </div>
          </div>

          {/* Quick Schedule Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsQuickAddMeetingOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CalendarDays size={14} />
              <span>+ Schedule Meeting</span>
            </button>
            <button
              onClick={() => setIsQuickAddShootOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Camera size={14} />
              <span>+ Plan Shoot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Toolbar: Google Calendar Style Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Steppers: Day-by-Day or Month */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={viewType === 'month' ? handlePrevMonth : handlePrevDay}
                className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
                title={viewType === 'month' ? 'Previous Month' : 'Previous Day'}
              >
                <ChevronLeft size={16} />
              </button>
              
              <button
                onClick={handleToday}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedDateStr === todayStr
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
              >
                Today
              </button>

              <button
                onClick={viewType === 'month' ? handleNextMonth : handleNextDay}
                className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-colors"
                title={viewType === 'month' ? 'Next Month' : 'Next Day (Tomorrow, etc.)'}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Current Active Date Display */}
            <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="text-sm">
                {viewType === 'month' 
                  ? `${monthNames[month]} ${year}` 
                  : currentDayLabel}
              </span>
            </div>
          </div>

          {/* View Switcher: Day View / Month Grid / Agenda Feed */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewType === 'day' 
                  ? 'bg-brand-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day Schedule
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewType === 'month' 
                  ? 'bg-brand-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewType('agenda')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewType === 'agenda' 
                  ? 'bg-brand-600 text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda Feed
            </button>
          </div>
        </div>

        {/* Google Calendar Style Interactive Date Strip (Day-by-Day Selector) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            {stripDates.map((dObj) => {
              const dKey = toDateKey(dObj);
              const isSelected = dKey === selectedDateStr;
              const isToday = dKey === todayStr;
              const dayNum = dObj.getDate();
              const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
              
              const dayEventCount = allEvents.filter(e => e.date === dKey).length;
              const hasShoot = allEvents.some(e => e.date === dKey && e.type === 'shoot');
              const hasMeeting = allEvents.some(e => e.date === dKey && e.type === 'meeting');

              return (
                <button
                  key={dKey}
                  type="button"
                  onClick={() => {
                    setSelectedDate(new Date(dObj));
                    if (viewType === 'month') setViewType('day');
                  }}
                  className={`flex-1 min-w-[65px] sm:min-w-[85px] py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                      : isToday
                      ? 'bg-brand-50 text-brand-900 border-brand-200 hover:bg-brand-100'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-slate-300' : isToday ? 'text-brand-600' : 'text-slate-400'
                  }`}>
                    {isToday ? 'Today' : dKey === tomorrowStr ? 'Tmrw' : dayName}
                  </span>
                  
                  <span className={`text-sm sm:text-base font-bold my-0.5 ${
                    isSelected ? 'text-white' : isToday ? 'text-brand-700' : 'text-slate-800'
                  }`}>
                    {dayNum}
                  </span>

                  {/* Micro Badges for Shoots / Meetings */}
                  <div className="flex items-center gap-1 mt-0.5">
                    {hasShoot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Shoot Scheduled" />
                    )}
                    {hasMeeting && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500" title="Meeting Scheduled" />
                    )}
                    {dayEventCount > 0 && !hasShoot && !hasMeeting && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : 'bg-slate-400'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIEW 1: DAY SCHEDULE (GOOGLE CALENDAR SINGLE DAY FOCUS) */}
      {viewType === 'day' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
            
            {/* Day Title and Quick Date Nav */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded">
                    Schedule for Selected Date
                  </span>
                  {selectedDateStr === todayStr && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded">
                      Today
                    </span>
                  )}
                  {selectedDateStr === tomorrowStr && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded">
                      Tomorrow
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {currentDayLabel}
                </h2>
              </div>

              {/* Prev / Next day steppers */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevDay}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Previous Day</span>
                </button>
                <button
                  onClick={handleNextDay}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>Next Day</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* List of items strictly for this selected date */}
            {selectedDayEvents.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <CalendarDays size={26} />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <div className="text-sm font-bold text-slate-700">No events scheduled for {formatDayHeading(selectedDateStr)}</div>
                  <div className="text-xs text-slate-500">
                    There are no shoots, meetings, or postings set on {selectedDateStr}. Click "Next Day" above or pick another date from the strip.
                  </div>
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    onClick={() => setIsQuickAddMeetingOpen(true)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold"
                  >
                    + Schedule Meeting
                  </button>
                  <button
                    onClick={() => setIsQuickAddShootOpen(true)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold"
                  >
                    + Plan Shoot
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(evt => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (evt.type === 'task') setSelectedTaskId(evt.rawId);
                      else if (evt.type === 'post') setSelectedReviewContentId(evt.rawId);
                      else setSelectedModalEvent(evt);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                      evt.type === 'shoot'
                        ? 'bg-purple-50/80 border-purple-200 hover:border-purple-300'
                        : evt.type === 'meeting'
                        ? 'bg-teal-50/80 border-teal-200 hover:border-teal-300'
                        : evt.type === 'post'
                        ? 'bg-pink-50/60 border-pink-200 hover:border-pink-300'
                        : 'bg-blue-50/60 border-blue-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="text-xl pt-0.5">
                        {evt.type === 'shoot' && '📸'}
                        {evt.type === 'meeting' && '👥'}
                        {evt.type === 'post' && (evt.contentType === 'Reel' ? '🎬' : '📱')}
                        {evt.type === 'task' && '✓'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                            {evt.brandName}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {evt.type === 'shoot' ? 'Shoot' : evt.type === 'meeting' ? 'Meeting' : evt.type === 'post' ? 'Social Post' : 'Task Deadline'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-purple-600" />
                              <span>{evt.location}</span>
                            </span>
                          )}
                          {evt.team && (
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-purple-600" />
                              <span>Crew: {evt.team}</span>
                            </span>
                          )}
                          {evt.attendees && evt.attendees.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users size={12} className="text-teal-600" />
                              <span>Attendees: {evt.attendees.join(', ')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        {evt.timeSlot}
                      </span>
                      {evt.meetingLink && (
                        <a
                          href={evt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-teal-700 bg-teal-100/80 hover:bg-teal-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                        >
                          <Video size={11} />
                          <span>Join Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTH GRID */}
      {viewType === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 auto-rows-[135px]">
            {calendarCells.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="bg-slate-50/30" />;
              }

              const formattedDay = String(dayNum).padStart(2, '0');
              const formattedMonth = String(month + 1).padStart(2, '0');
              const cellDateStr = `${year}-${formattedMonth}-${formattedDay}`;
              const isToday = cellDateStr === todayStr;
              const isSelected = cellDateStr === selectedDateStr;

              const cellEvents = allEvents.filter(e => e.date === cellDateStr);

              return (
                <div 
                  key={`day-${dayNum}`}
                  onClick={() => {
                    const newD = new Date(year, month, dayNum);
                    setSelectedDate(newD);
                    setViewType('day');
                  }}
                  className={`p-2 flex flex-col justify-between overflow-hidden cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/70 ring-2 ring-indigo-500/50 ring-inset z-10' 
                      : isToday 
                      ? 'bg-brand-50/40 hover:bg-brand-50/60' 
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isToday 
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105' 
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>

                    {cellEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Chips List */}
                  <div className="space-y-1.5 my-1 overflow-y-auto max-h-[88px] pr-0.5 custom-scrollbar">
                    {cellEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (evt.type === 'task') setSelectedTaskId(evt.rawId);
                          else if (evt.type === 'post') setSelectedReviewContentId(evt.rawId);
                          else setSelectedModalEvent(evt);
                        }}
                        className={`text-[10px] p-1.5 rounded-lg border font-medium truncate ${
                          evt.type === 'shoot'
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : evt.type === 'meeting'
                            ? 'bg-teal-50 text-teal-900 border-teal-200'
                            : evt.type === 'post'
                            ? 'bg-pink-50 text-pink-900 border-pink-200'
                            : 'bg-blue-50 text-blue-900 border-blue-200'
                        }`}
                        title={`${evt.brandName}: ${evt.title} (${evt.timeSlot})`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          <span>{evt.type === 'shoot' ? '📸' : evt.type === 'meeting' ? '👥' : evt.type === 'post' ? '🎬' : '✓'}</span>
                          <span className="truncate">{evt.brandName}: {evt.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[9px] text-slate-400 text-right">
                    {isToday ? 'Today' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: AGENDA FEED (GROUPED STRICTLY DATE-BY-DATE) */}
      {viewType === 'agenda' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Schedule & Agenda Feed</h3>
              <p className="text-xs text-slate-500">Every shoot, meeting, posting, and task clearly grouped under its own date</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
              {allEvents.length} Events Total
            </span>
          </div>

          {sortedAgendaDates.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 italic">
              No upcoming scheduled events found.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedAgendaDates.map(dateKey => {
                const dayEvts = groupedAgendaEvents[dateKey];
                const headingLabel = formatDayHeading(dateKey);
                const dObj = new Date(dateKey + 'T00:00:00');
                const fullFormatted = isNaN(dObj.getTime())
                  ? dateKey
                  : dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

                const isToday = dateKey === todayStr;

                return (
                  <div key={dateKey} className="space-y-2.5">
                    {/* Clear Sticky Date Header for this day */}
                    <div className="flex items-center gap-2.5 py-1.5 border-b border-slate-200">
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                        isToday 
                          ? 'bg-brand-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {headingLabel === 'Today' || headingLabel === 'Tomorrow' || headingLabel === 'Yesterday'
                          ? `${headingLabel} • ${fullFormatted}`
                          : fullFormatted}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({dayEvts.length} {dayEvts.length === 1 ? 'item' : 'items'})
                      </span>
                    </div>

                    {/* Events on this specific date */}
                    <div className="space-y-2 pl-1 sm:pl-3">
                      {dayEvts.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            if (evt.type === 'task') setSelectedTaskId(evt.rawId);
                            else if (evt.type === 'post') setSelectedReviewContentId(evt.rawId);
                            else setSelectedModalEvent(evt);
                          }}
                          className="p-3 bg-slate-50/80 hover:bg-slate-100/90 rounded-xl border border-slate-200/90 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span 
                              className="w-2.5 h-10 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: evt.color }} 
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
                                <span>
                                  {evt.type === 'shoot' && '📸'}
                                  {evt.type === 'meeting' && '👥'}
                                  {evt.type === 'post' && (evt.contentType === 'Reel' ? '🎬' : '📱')}
                                  {evt.type === 'task' && '✓'}
                                </span>
                                <span className="truncate">{evt.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <strong className="text-slate-700">{evt.brandName}</strong>
                                <span>•</span>
                                <span className="font-mono text-slate-800 font-semibold">{evt.timeSlot}</span>
                                {evt.location && (
                                  <>
                                    <span>•</span>
                                    <span>📍 {evt.location}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0 pl-2">
                            <div className="text-[10px] text-brand-600 font-semibold hover:underline">
                              Open Details →
                            </div>
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
      )}

      {/* Quick Event Detail Modal */}
      {selectedModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-hover border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {selectedModalEvent.type === 'shoot' ? '📸' : '👥'}
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {selectedModalEvent.type === 'shoot' ? 'Shoot Schedule' : 'Meeting Session'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">{selectedModalEvent.brandName}</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedModalEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedModalEvent.title}</h2>
              </div>

              {/* Exact Time Slot */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Scheduled Date:</span>
                  <span className="font-bold text-slate-800">{selectedModalEvent.date}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Time Window:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {selectedModalEvent.timeSlot}
                  </span>
                </div>
              </div>

              {/* Shoot Location / Meeting Link */}
              {selectedModalEvent.type === 'shoot' && selectedModalEvent.location && (
                <div className="text-xs space-y-1">
                  <div className="text-slate-400 font-semibold text-[10px] uppercase">Location:</div>
                  <div className="font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin size={13} className="text-purple-600" />
                    <span>{selectedModalEvent.location}</span>
                  </div>
                </div>
              )}

              {selectedModalEvent.type === 'meeting' && selectedModalEvent.meetingLink && (
                <div className="pt-1">
                  <a
                    href={selectedModalEvent.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-500/20"
                  >
                    <Video size={14} />
                    <span>Join Google Meet / Video Call</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {selectedModalEvent.attendees && selectedModalEvent.attendees.length > 0 && (
                <div className="text-xs space-y-1">
                  <div className="text-slate-400 font-semibold text-[10px] uppercase">Attendees:</div>
                  <div className="text-slate-700 font-medium">{selectedModalEvent.attendees.join(', ')}</div>
                </div>
              )}

              {/* Quick Navigation Button */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedModalEvent(null);
                    if (selectedModalEvent.type === 'shoot') setActiveTab('shoots');
                    else if (selectedModalEvent.type === 'meeting') setActiveTab('meetings');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Go to {selectedModalEvent.type === 'shoot' ? 'Shoot Planner' : 'Meetings Hub'} →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
