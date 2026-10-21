'use client';

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DashboardView from '@/components/views/DashboardView';
import TasksView from '@/components/views/TasksView';
import ShootsView from '@/components/views/ShootsView';
import PostingView from '@/components/views/PostingView';
import CalendarView from '@/components/views/CalendarView';
import BrandsView from '@/components/views/BrandsView';
import TeamView from '@/components/views/TeamView';
import WorkflowsView from '@/components/views/WorkflowsView';
import AdsView from '@/components/views/AdsView';
import ProjectsView from '@/components/views/ProjectsView';
import MeetingsView from '@/components/views/MeetingsView';
import AutomationView from '@/components/views/AutomationView';
import ReportsView from '@/components/views/ReportsView';
import NotificationsView from '@/components/views/NotificationsView';
import SettingsAdminView from '@/components/views/SettingsAdminView';

// Modals
import QuickAddTaskModal from '@/components/modals/QuickAddTaskModal';
import QuickAddShootModal from '@/components/modals/QuickAddShootModal';
import QuickAddPostModal from '@/components/modals/QuickAddPostModal';
import QuickAddMeetingModal from '@/components/modals/QuickAddMeetingModal';
import TaskDetailDrawer from '@/components/modals/TaskDetailDrawer';
import CreativeReviewModal from '@/components/modals/CreativeReviewModal';
import WhatsAppSubmitModal from '@/components/modals/WhatsAppSubmitModal';
import ImportExportModal from '@/components/modals/ImportExportModal';
import GlobalSearchModal from '@/components/modals/GlobalSearchModal';

import { useBrandFlow } from '@/context/BrandFlowContext';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function BrandFlowApp() {
  const { activeTab, toasts, removeToast, isLoading } = useBrandFlow();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'shoots':
        return <ShootsView />;
      case 'posting':
        return <PostingView />;
      case 'calendar':
        return <CalendarView />;
      case 'brands':
        return <BrandsView />;
      case 'team':
        return <TeamView />;
      case 'workflows':
        return <WorkflowsView />;
      case 'ads':
        return <AdsView />;
      case 'projects':
        return <ProjectsView />;
      case 'meetings':
        return <MeetingsView />;
      case 'automations':
        return <AutomationView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsAdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-20 lg:pl-64 flex flex-col min-w-0 transition-all duration-200">
        <TopBar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Drawers */}
      <QuickAddTaskModal />
      <QuickAddShootModal />
      <QuickAddPostModal />
      <QuickAddMeetingModal />
      <TaskDetailDrawer />
      <CreativeReviewModal />
      <WhatsAppSubmitModal />
      <ImportExportModal />
      <GlobalSearchModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-hover flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'success' ? 'bg-white border-emerald-200 text-slate-primary' :
              toast.type === 'error' ? 'bg-white border-rose-200 text-slate-primary' :
              toast.type === 'warning' ? 'bg-white border-amber-200 text-slate-primary' :
              'bg-white border-brand-200 text-slate-primary'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle size={16} className="text-rose-500" />}
              {toast.type === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
              {toast.type === 'info' && <Info size={16} className="text-brand-500" />}
            </div>

            <div className="flex-1 text-xs">
              <div className="font-bold text-slate-primary">{toast.title}</div>
              {toast.description && (
                <div className="text-slate-muted mt-0.5 leading-relaxed">{toast.description}</div>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}