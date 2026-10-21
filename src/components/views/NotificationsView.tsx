'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  Film, 
  Camera, 
  Send, 
  BarChart3, 
  CalendarDays, 
  Users,
  Filter
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function NotificationsView() {
  const { 
    notifications, 
    markAllNotificationsRead, 
    setActiveTab, 
    setSelectedTaskId, 
    setSelectedReviewContentId 
  } = useBrandFlow();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredNotifs = notifications.filter(n => categoryFilter === 'all' || n.category === categoryFilter);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-surface-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-brand-500" />
            <h2 className="text-lg font-bold text-slate-primary">Notification Center & Alerts</h2>
          </div>
          <p className="text-xs text-slate-muted mt-1">
            Real-time handovers, review deadlines, shoot reminders, and automated workflow notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold transition-all"
          >
            <Check size={14} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-muted font-medium flex items-center gap-1 mr-1">
          <Filter size={13} /> Category:
        </span>
        {['all', 'task', 'review', 'shoot', 'posting', 'ad'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
              categoryFilter === cat
                ? 'bg-brand-500 text-white border-brand-500 font-semibold shadow-2xs'
                : 'bg-white border-surface-border text-slate-600 hover:bg-surface-subtle'
            }`}
          >
            {cat === 'all' ? 'All Alerts' : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-surface-border shadow-subtle divide-y divide-surface-border overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-muted">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.targetTab) setActiveTab(n.targetTab);
                if (n.targetTab === 'tasks' && n.targetId) setSelectedTaskId(n.targetId);
                if (n.targetTab === 'reviews' && n.targetId) setSelectedReviewContentId(n.targetId);
              }}
              className={`p-4 flex items-center justify-between gap-4 hover:bg-surface-subtle cursor-pointer transition-colors ${
                !n.isRead ? 'bg-brand-50/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  n.category === 'review' ? 'bg-amber-50 text-amber-600' :
                  n.category === 'shoot' ? 'bg-purple-50 text-purple-600' :
                  n.category === 'posting' ? 'bg-rose-50 text-rose-600' :
                  n.category === 'ad' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-brand-50 text-brand-600'
                }`}>
                  {n.category === 'review' && <Film size={16} />}
                  {n.category === 'shoot' && <Camera size={16} />}
                  {n.category === 'posting' && <Send size={16} />}
                  {n.category === 'ad' && <BarChart3 size={16} />}
                  {n.category === 'task' && <CheckCircle2 size={16} />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-primary">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{n.message}</p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
