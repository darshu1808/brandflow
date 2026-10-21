import fs from 'fs';
import path from 'path';
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
} from '../types';
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
} from './seedData';

export interface BrandFlowDatabase {
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
}

let inMemoryDb: BrandFlowDatabase | null = null;

function getDbFilePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'brandflow_db.json');
  }
  return path.join(process.cwd(), 'data', 'brandflow_db.json');
}

function initializeDefaultDatabase(): BrandFlowDatabase {
  return {
    brands: initialBrands,
    team: initialTeamMembers,
    tasks: initialTasks,
    shoots: initialShoots,
    content: initialContentItems,
    workflows: initialWorkflows,
    ads: initialAdCampaigns,
    projects: initialProjects,
    meetings: initialMeetings,
    automations: initialAutomations,
    executions: [
      {
        id: 'exec-1',
        ruleId: 'auto-1',
        ruleName: 'Shoot Completed → Trigger Raw Data Sorting',
        triggerEvent: 'SHOOT_COMPLETED',
        status: 'SUCCESS',
        detail: 'Created Data Sorting task for HOF Autumn Shoot and assigned to Darsh',
        timestamp: '2026-10-19T18:00:00Z'
      }
    ],
    notifications: initialNotifications,
    auditLogs: [
      {
        id: 'log-1',
        user: 'Darsh',
        action: 'System initialized with production seed data',
        entityType: 'System',
        entityId: 'root',
        timestamp: new Date().toISOString()
      }
    ],
    settings: initialSettings
  };
}

export function getDatabase(): BrandFlowDatabase {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const filePath = getDbFilePath();
  const seedFilePath = path.join(process.cwd(), 'data', 'brandflow_db.json');

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      inMemoryDb = JSON.parse(content);
      return inMemoryDb!;
    }

    if (fs.existsSync(seedFilePath)) {
      const content = fs.readFileSync(seedFilePath, 'utf8');
      inMemoryDb = JSON.parse(content);
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(inMemoryDb, null, 2), 'utf8');
      } catch (writeErr) {
        console.warn('Could not write seed to path:', writeErr);
      }
      return inMemoryDb!;
    }

    const defaultDb = initializeDefaultDatabase();
    inMemoryDb = defaultDb;
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultDb, null, 2), 'utf8');
    } catch (writeErr) {
      console.warn('Could not write default to path:', writeErr);
    }
    return inMemoryDb;
  } catch (err) {
    console.error('Error reading BrandFlow database:', err);
    if (!inMemoryDb) inMemoryDb = initializeDefaultDatabase();
    return inMemoryDb;
  }
}

export function saveDatabase(db: BrandFlowDatabase): void {
  inMemoryDb = db;
  const filePath = getDbFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving BrandFlow database:', err);
  }
}

// ----------------- AUTOMATION ENGINE -----------------
export function runAutomations(
  event: 
    | 'SHOOT_COMPLETED' 
    | 'TASK_COMPLETED' 
    | 'CONTENT_SUBMITTED' 
    | 'REVIEW_APPROVED' 
    | 'CHANGES_REQUESTED' 
    | 'POSTING_DATE_APPROACHING' 
    | 'CAMPAIGN_ANALYSIS_DUE',
  payload: any,
  db: BrandFlowDatabase
): void {
  const activeRules = db.automations.filter(r => r.isEnabled && r.trigger === event);

  for (const rule of activeRules) {
    try {
      if (rule.trigger === 'SHOOT_COMPLETED') {
        const shoot = payload as Shoot;
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: `Sort ${shoot.brandName} shoot raw data & selects`,
          description: `Shoot wrapped at ${shoot.location}. Review raw footage at: ${shoot.rawDataLocation || 'Drive'}. Sort hero clips for editing.`,
          brandId: shoot.brandId,
          brandName: shoot.brandName,
          category: 'Data Sorting',
          priority: 'Critical',
          status: 'To Do',
          assigneeId: 'user-1',
          assigneeName: shoot.brandManager || 'Darsh',
          assignedById: 'system',
          assignedByName: 'BrandFlow Automation',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          shootId: shoot.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activityLog: [{
            id: `act-${Date.now()}`,
            user: 'Automation Engine',
            action: `Auto-created via rule: "${rule.name}"`,
            timestamp: new Date().toISOString()
          }]
        };
        db.tasks.unshift(newTask);
        db.notifications.unshift({
          id: `notif-${Date.now()}`,
          title: `Raw Data Sorting Needed: ${shoot.brandName}`,
          message: `Shoot completed. Auto-created Data Sorting task for ${shoot.brandManager || 'Darsh'}.`,
          category: 'shoot',
          targetTab: 'tasks',
          targetId: newTask.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (rule.trigger === 'TASK_COMPLETED') {
        const completedTask = payload as Task;
        if (completedTask.category === 'Data Sorting') {
          // Trigger PM Handover
          const handoverTask: Task = {
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: `PM Handover: ${completedTask.brandName} post-sorting deliverables`,
            description: `Data sorting completed by ${completedTask.completedByName || 'Brand Manager'}. Align content team and editors.`,
            brandId: completedTask.brandId,
            brandName: completedTask.brandName,
            category: 'PM Handover',
            priority: 'High',
            status: 'To Do',
            assigneeId: 'user-2',
            assigneeName: 'Pinky',
            assignedById: completedTask.completedById || 'user-1',
            assignedByName: completedTask.completedByName || 'Darsh',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            activityLog: [{
              id: `act-${Date.now()}`,
              user: 'Automation Engine',
              action: `Triggered upon Data Sorting completion`,
              timestamp: new Date().toISOString()
            }]
          };
          db.tasks.unshift(handoverTask);
          db.notifications.unshift({
            id: `notif-${Date.now()}`,
            title: `PM Handover Activated: ${completedTask.brandName}`,
            message: `Data sorting finished. Handed over to Pinky.`,
            category: 'task',
            targetTab: 'tasks',
            targetId: handoverTask.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      } else if (rule.trigger === 'CONTENT_SUBMITTED') {
        const item = payload as ContentItem;
        const reviewTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: `Review ${item.contentType}: ${item.title}`,
          description: `Creative submitted by ${item.assignedCreator || 'Editor'}. Check pacing, copy, audio and grading.`,
          brandId: item.brandId,
          brandName: item.brandName,
          category: 'Review',
          priority: 'High',
          status: 'In Review',
          assigneeId: 'user-1',
          assigneeName: 'Darsh',
          assignedById: 'system',
          assignedByName: 'BrandFlow Automation',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          contentId: item.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.tasks.unshift(reviewTask);
        db.notifications.unshift({
          id: `notif-${Date.now()}`,
          title: `Creative Review Queued: ${item.title}`,
          message: `${item.brandName} ${item.contentType} submitted by ${item.assignedCreator}.`,
          category: 'review',
          targetTab: 'reviews',
          targetId: item.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      } else if (rule.trigger === 'REVIEW_APPROVED') {
        const item = payload as ContentItem;
        item.publishingStatus = 'Scheduled';
        const postTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: `Publish approved ${item.contentType}: ${item.title}`,
          description: `Scheduled for ${item.scheduledDate} at ${item.scheduledTime} on ${item.platform}. Caption: ${item.caption}`,
          brandId: item.brandId,
          brandName: item.brandName,
          category: 'Posting',
          priority: 'Critical',
          status: 'To Do',
          assigneeId: 'user-3',
          assigneeName: item.assignedPublisher || 'Isha',
          assignedById: 'user-1',
          assignedByName: 'Darsh',
          dueDate: `${item.scheduledDate}T${item.scheduledTime}:00Z`,
          contentId: item.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.tasks.unshift(postTask);
      }

      rule.executionCount = (rule.executionCount || 0) + 1;
      rule.lastExecutedAt = new Date().toISOString();
      db.executions.unshift({
        id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        triggerEvent: event,
        status: 'SUCCESS',
        detail: `Successfully executed rule for event ${event}`,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      db.executions.unshift({
        id: `exec-${Date.now()}`,
        ruleId: rule.id,
        ruleName: rule.name,
        triggerEvent: event,
        status: 'FAILED',
        detail: `Execution error: ${err?.message || 'Unknown'}`,
        timestamp: new Date().toISOString()
      });
    }
  }
}
