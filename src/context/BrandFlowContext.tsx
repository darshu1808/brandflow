'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Brand, 
  TeamMember, 
  Task, 
  Shoot, 
  ContentItem, 
  Workflow, 
  AdCampaign, 
  Project, 
  Meeting, 
  AutomationRule, 
  AutomationExecution, 
  NotificationItem, 
  AuditLog, 
  SystemSettings 
} from '@/lib/types';
import { 
  initialBrands, 
  initialTeamMembers, 
  initialTasks, 
  initialShoots, 
  initialContentItems, 
  initialWorkflows, 
  initialAdCampaigns, 
  initialProjects, 
  initialMeetings, 
  initialAutomations, 
  initialNotifications, 
  initialSettings 
} from '@/lib/database/seedData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}

interface BrandFlowContextType {
  // State
  brands: Brand[];
  team: TeamMember[];
  tasks: Task[];
  shoots: Shoot[];
  content: ContentItem[];
  workflows: Workflow[];
  ads: AdCampaign[];
  projects: Project[];
  meetings: Meeting[];
  automations: AutomationRule[];
  executions: AutomationExecution[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  
  // Navigation & User
  activeBrandId: string;
  setActiveBrandId: (id: string) => void;
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  
  // Modals
  isQuickAddTaskOpen: boolean;
  setIsQuickAddTaskOpen: (open: boolean) => void;
  isQuickAddShootOpen: boolean;
  setIsQuickAddShootOpen: (open: boolean) => void;
  isQuickAddPostOpen: boolean;
  setIsQuickAddPostOpen: (open: boolean) => void;
  isQuickAddMeetingOpen: boolean;
  setIsQuickAddMeetingOpen: (open: boolean) => void;
  isWhatsAppSubmitOpen: boolean;
  setIsWhatsAppSubmitOpen: (open: boolean) => void;
  isImportExportOpen: boolean;
  setIsImportExportOpen: (open: boolean) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedReviewContentId: string | null;
  setSelectedReviewContentId: (id: string | null) => void;
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Actions
  refreshData: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task | null>;
  updateTask: (task: Partial<Task> & { id: string }) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskDone: (task: Task) => Promise<void>;
  
  createShoot: (shoot: Partial<Shoot>) => Promise<Shoot | null>;
  updateShoot: (shoot: Partial<Shoot> & { id: string }) => Promise<Shoot | null>;
  deleteShoot: (id: string) => Promise<boolean>;
  
  createContent: (item: Partial<ContentItem>) => Promise<ContentItem | null>;
  updateContent: (item: Partial<ContentItem> & { id: string }) => Promise<ContentItem | null>;
  approveContent: (id: string, feedback: string) => Promise<void>;
  requestChangesContent: (id: string, feedback: string) => Promise<void>;
  publishContent: (id: string, publishedUrl: string) => Promise<void>;
  deleteContent: (id: string) => Promise<boolean>;
  deleteContentByBrand: (brandId?: string) => Promise<boolean>;
  syncSheetLive: (brandId: string, overwrite?: boolean) => Promise<{ success: boolean; count?: number; message?: string }>;
  
  createBrand: (brand: Partial<Brand>) => Promise<Brand | null>;
  updateBrand: (brand: Partial<Brand> & { id: string }) => Promise<Brand | null>;
  archiveBrand: (id: string) => Promise<boolean>;
  
  createTeamMember: (member: Partial<TeamMember>) => Promise<TeamMember | null>;
  updateTeamMember: (member: Partial<TeamMember> & { id: string }) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  
  createWorkflow: (workflow: Partial<Workflow>) => Promise<Workflow | null>;
  updateWorkflow: (workflow: Partial<Workflow> & { id: string }) => Promise<Workflow | null>;
  
  createAd: (ad: Partial<AdCampaign>) => Promise<AdCampaign | null>;
  updateAd: (ad: Partial<AdCampaign> & { id: string }) => Promise<AdCampaign | null>;
  deleteAd: (id: string) => Promise<boolean>;
  
  createMeeting: (meeting: Partial<Meeting>) => Promise<Meeting | null>;
  updateMeeting: (meeting: Partial<Meeting> & { id: string }) => Promise<Meeting | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
  convertMeetingActionItem: (meetingId: string, actionItemId: string) => Promise<void>;
  
  createAutomation: (rule: Partial<AutomationRule>) => Promise<AutomationRule | null>;
  toggleAutomation: (rule: AutomationRule) => Promise<void>;
  testAutomation: (ruleId: string) => Promise<void>;
  
  markAllNotificationsRead: () => Promise<void>;
  updateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

const BrandFlowContext = createContext<BrandFlowContextType | undefined>(undefined);

export function BrandFlowProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [shoots, setShoots] = useState<Shoot[]>(initialShoots);
  const [content, setContent] = useState<ContentItem[]>(initialContentItems);
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [ads, setAds] = useState<AdCampaign[]>(initialAdCampaigns);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  
  const [activeBrandId, setActiveBrandId] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<TeamMember>(initialTeamMembers[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modals
  const [isQuickAddTaskOpen, setIsQuickAddTaskOpen] = useState(false);
  const [isQuickAddShootOpen, setIsQuickAddShootOpen] = useState(false);
  const [isQuickAddPostOpen, setIsQuickAddPostOpen] = useState(false);
  const [isQuickAddMeetingOpen, setIsQuickAddMeetingOpen] = useState(false);
  const [isWhatsAppSubmitOpen, setIsWhatsAppSubmitOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedReviewContentId, setSelectedReviewContentId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/data', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setBrands((d.brands || []).filter((b: Brand) => b.status !== 'archived'));
          setTeam(d.team || []);
          setTasks(d.tasks || []);
          setShoots(d.shoots || []);
          setContent(d.content || []);
          setWorkflows(d.workflows || []);
          setAds(d.ads || []);
          setProjects(d.projects || []);
          setMeetings(d.meetings || []);
          setAutomations(d.automations || []);
          setExecutions(d.executions || []);
          setNotifications(d.notifications || []);
          setAuditLogs(d.auditLogs || []);
          setSettings(d.settings || initialSettings);
          // Set current user if found
          if (d.team && d.team.length > 0) {
            const found = d.team.find((m: TeamMember) => m.id === currentUser.id);
            if (found) setCurrentUser(found);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch BrandFlow data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser.id]);

  useEffect(() => {
    refreshData();
  }, []);

  // Keyboard shortcut for Cmd+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ----------------- TASK ACTIONS -----------------
  const createTask = async (taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          assignedById: currentUser.id,
          assignedByName: currentUser.name,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Task Created', description: json.data.title });
        return json.data;
      }
      showToast({ type: 'error', title: 'Failed to create task', description: json.error });
      return null;
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', description: err.message });
      return null;
    }
  };

  const updateTask = async (taskData: Partial<Task> & { id: string }): Promise<Task | null> => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          currentUserId: currentUser.id,
          currentUserName: currentUser.name,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        return json.data;
      }
      showToast({ type: 'error', title: 'Failed to update task', description: json.error });
      return null;
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', description: err.message });
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'info', title: 'Task deleted' });
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const toggleTaskDone = async (task: Task) => {
    const isNowDone = task.status !== 'Done';
    const newStatus = isNowDone ? 'Done' : 'In Progress';
    
    if (isNowDone) {
      // Fire confetti celebration!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3156D3', '#19A56A', '#E7A23C', '#233F9D']
        });
      } catch (e) {
        // Confetti fallback
      }
      showToast({ type: 'success', title: 'Task Completed!', description: `"${task.title}" marked Done.` });
    }

    await updateTask({
      id: task.id,
      status: newStatus,
    });
  };

  // ----------------- SHOOT ACTIONS -----------------
  const createShoot = async (shootData: Partial<Shoot>): Promise<Shoot | null> => {
    try {
      const res = await fetch('/api/shoots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shootData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Shoot Scheduled', description: json.data.title });
        return json.data;
      }
      showToast({ type: 'error', title: 'Failed to create shoot', description: json.error });
      return null;
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', description: err.message });
      return null;
    }
  };

  const updateShoot = async (shootData: Partial<Shoot> & { id: string }): Promise<Shoot | null> => {
    try {
      const res = await fetch('/api/shoots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shootData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        if (shootData.status === 'Completed') {
          showToast({ 
            type: 'success', 
            title: 'Shoot Completed & Workflow Triggered!', 
            description: 'Raw data sorting task has been automatically generated.' 
          });
        }
        return json.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const deleteShoot = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/shoots?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // ----------------- CONTENT & REVIEW ACTIONS -----------------
  const createContent = async (itemData: Partial<ContentItem>): Promise<ContentItem | null> => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Content Created', description: json.data.title });
        return json.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const updateContent = async (itemData: Partial<ContentItem> & { id: string }): Promise<ContentItem | null> => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        return json.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const approveContent = async (id: string, feedback: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          approvalStatus: 'Approved',
          publishingStatus: 'Scheduled',
          reviewerName: currentUser.name,
          reviewerFeedback: feedback || 'Approved without further edits.',
        }),
      });
      if (res.ok) {
        await refreshData();
        showToast({ 
          type: 'success', 
          title: 'Creative Approved!', 
          description: 'Content moved into Posting Schedule.' 
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const requestChangesContent = async (id: string, feedback: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          approvalStatus: 'Changes Required',
          reviewerName: currentUser.name,
          reviewerFeedback: feedback || 'Please review notes and update.',
        }),
      });
      if (res.ok) {
        await refreshData();
        showToast({ 
          type: 'warning', 
          title: 'Changes Requested', 
          description: 'Feedback sent back to creator.' 
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const publishContent = async (id: string, publishedUrl: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          publishingStatus: 'Published',
          publishedUrl,
          publisherName: currentUser.name,
        }),
      });
      if (res.ok) {
        await refreshData();
        showToast({ 
          type: 'success', 
          title: 'Content Published Live!', 
          description: 'Publish timestamp and URL recorded.' 
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteContent = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        showToast({ type: 'info', title: 'Post removed from schedule' });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const deleteContentByBrand = async (brandId?: string): Promise<boolean> => {
    try {
      const url = brandId && brandId !== 'all' ? `/api/posts?brandId=${brandId}` : '/api/posts?all=true';
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (brandId && brandId !== 'all') {
          setContent(prev => prev.filter(c => c.brandId !== brandId));
        } else {
          setContent([]);
        }
        await refreshData();
        showToast({ type: 'info', title: 'Posts Deleted', description: 'Schedule cleared successfully.' });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const syncSheetLive = async (brandId: string, overwrite = false): Promise<{ success: boolean; count?: number; message?: string }> => {
    try {
      const res = await fetch('/api/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, overwrite })
      });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        showToast({
          type: 'success',
          title: 'Sheet Synced Live! ✓',
          description: data.message || `Imported ${data.count || 0} postings.`
        });
        return { success: true, count: data.count, message: data.message };
      } else {
        showToast({
          type: 'error',
          title: 'Sync Failed',
          description: data.error || 'Could not sync from Google Sheet.'
        });
        return { success: false, message: data.error };
      }
    } catch (e: any) {
      showToast({
        type: 'error',
        title: 'Sync Error',
        description: e.message || 'Network error connecting to Google Sheet.'
      });
      return { success: false, message: e.message };
    }
  };

  // ----------------- BRAND ACTIONS -----------------
  const createBrand = async (brandData: Partial<Brand>): Promise<Brand | null> => {
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Brand Added', description: json.data.name });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const updateBrand = async (brandData: Partial<Brand> & { id: string }): Promise<Brand | null> => {
    try {
      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Brand Updated' });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const archiveBrand = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/brands?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeBrandId === id) {
          setActiveBrandId('all');
        }
        setBrands(prev => prev.filter(b => b.id !== id));
        await refreshData();
        showToast({ type: 'info', title: 'Brand Deleted', description: 'Brand removed successfully.' });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // ----------------- TEAM ACTIONS -----------------
  const createTeamMember = async (memberData: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Team Member Added', description: json.data.name });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const updateTeamMember = async (memberData: Partial<TeamMember> & { id: string }): Promise<TeamMember | null> => {
    try {
      const res = await fetch('/api/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Team Member Updated' });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        showToast({ type: 'info', title: 'Colleague removed' });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // ----------------- WORKFLOW ACTIONS -----------------
  const createWorkflow = async (wfData: Partial<Workflow>): Promise<Workflow | null> => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wfData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Workflow Created', description: json.data.name });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const updateWorkflow = async (wfData: Partial<Workflow> & { id: string }): Promise<Workflow | null> => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wfData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Workflow Updated', description: `Version v${json.data.version}` });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // ----------------- ADS ACTIONS -----------------
  const createAd = async (adData: Partial<AdCampaign>): Promise<AdCampaign | null> => {
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Ad Campaign Launched', description: json.data.name });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const updateAd = async (adData: Partial<AdCampaign> & { id: string }): Promise<AdCampaign | null> => {
    try {
      const res = await fetch('/api/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Campaign Updated' });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const deleteAd = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        showToast({ type: 'info', title: 'Campaign Deleted' });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // ----------------- MEETINGS ACTIONS -----------------
  const createMeeting = async (meetData: Partial<Meeting>): Promise<Meeting | null> => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Meeting Scheduled', description: json.data.title });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const updateMeeting = async (meetData: Partial<Meeting> & { id: string }): Promise<Meeting | null> => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Meeting Updated' });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const deleteMeeting = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/meetings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
        showToast({ type: 'info', title: 'Meeting Removed' });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const convertMeetingActionItem = async (meetingId: string, actionItemId: string) => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: meetingId, convertActionItemId: actionItemId }),
      });
      if (res.ok) {
        await refreshData();
        showToast({ type: 'success', title: 'Converted to Task!', description: 'Action item is now in your Task list.' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ----------------- AUTOMATION ACTIONS -----------------
  const createAutomation = async (ruleData: Partial<AutomationRule>): Promise<AutomationRule | null> => {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Automation Rule Created', description: json.data.name });
        return json.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const toggleAutomation = async (rule: AutomationRule) => {
    try {
      const res = await fetch('/api/automations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, isEnabled: !rule.isEnabled }),
      });
      if (res.ok) {
        await refreshData();
        showToast({ 
          type: 'info', 
          title: `Rule ${!rule.isEnabled ? 'Enabled' : 'Disabled'}`, 
          description: rule.name 
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const testAutomation = async (ruleId: string) => {
    try {
      const res = await fetch('/api/automations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testRuleId: ruleId }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Automation Test Executed', description: 'Check execution log and new tasks!' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ----------------- NOTIFICATIONS & SETTINGS -----------------
  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Settings Saved' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <BrandFlowContext.Provider
      value={{
        brands,
        team,
        tasks,
        shoots,
        content,
        workflows,
        ads,
        projects,
        meetings,
        automations,
        executions,
        notifications,
        auditLogs,
        settings,
        activeBrandId,
        setActiveBrandId,
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        isLoading,
        isQuickAddTaskOpen,
        setIsQuickAddTaskOpen,
        isQuickAddShootOpen,
        setIsQuickAddShootOpen,
        isQuickAddPostOpen,
        setIsQuickAddPostOpen,
        isQuickAddMeetingOpen,
        setIsQuickAddMeetingOpen,
        isWhatsAppSubmitOpen,
        setIsWhatsAppSubmitOpen,
        isImportExportOpen,
        setIsImportExportOpen,
        isSearchModalOpen,
        setIsSearchModalOpen,
        selectedTaskId,
        setSelectedTaskId,
        selectedReviewContentId,
        setSelectedReviewContentId,
        toasts,
        showToast,
        removeToast,
        refreshData,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        createShoot,
        updateShoot,
        deleteShoot,
        createContent,
        updateContent,
        approveContent,
        requestChangesContent,
        publishContent,
        deleteContent,
        deleteContentByBrand,
        syncSheetLive,
        createBrand,
        updateBrand,
        archiveBrand,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        createWorkflow,
        updateWorkflow,
        createAd,
        updateAd,
        deleteAd,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        convertMeetingActionItem,
        createAutomation,
        toggleAutomation,
        testAutomation,
        markAllNotificationsRead,
        updateSettings,
      }}
    >
      {children}
    </BrandFlowContext.Provider>
  );
}

export function useBrandFlow() {
  const context = useContext(BrandFlowContext);
  if (!context) {
    throw new Error('useBrandFlow must be used within a BrandFlowProvider');
  }
  return context;
}
