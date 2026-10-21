export type Role = 
  | 'admin' 
  | 'brand_manager' 
  | 'project_manager' 
  | 'content_team' 
  | 'video_editor' 
  | 'graphic_designer' 
  | 'viewer';

export type Department = 
  | 'Brand Management' 
  | 'Project Management' 
  | 'Content Team' 
  | 'Video Editing' 
  | 'Graphic Design' 
  | 'Performance Marketing' 
  | 'Other';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: Department;
  assignedBrandIds: string[];
  avatar: string;
  phone?: string;
  isActive: boolean;
  activeTasksCount: number;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  tagline: string;
  managerId: string;
  managerName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  whatsappGroupUrl: string;
  driveFolderUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  logo: string;
  brandColor: string;
  status: 'active' | 'archived';
  postingSheetUrl?: string;
  monthlyShootTarget?: number;
  teamMemberIds: string[];
  createdAt: string;
}

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 
  | 'To Do' 
  | 'In Progress' 
  | 'On Hold'
  | 'Waiting' 
  | 'Blocked' 
  | 'In Review' 
  | 'Changes Required' 
  | 'Approved' 
  | 'Done' 
  | 'Cancelled';

export type TaskCategory = 
  | 'General' 
  | 'Shoot' 
  | 'Data Sorting' 
  | 'PM Handover' 
  | 'Content Creation' 
  | 'Video Editing' 
  | 'Graphic Design' 
  | 'Review' 
  | 'Posting' 
  | 'Ad Campaign' 
  | 'Meeting Action' 
  | 'Client Follow-up';

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
  assigneeName?: string;
}

export interface TaskActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brandName: string;
  projectId?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  collaboratorName?: string;
  assignedById: string;
  assignedByName: string;
  startDate?: string;
  dueDate: string;
  completedAt?: string;
  completedById?: string;
  completedByName?: string;
  workflowId?: string;
  workflowStage?: string;
  dependencies?: string[];
  attachments?: { name: string; url: string; type: string }[];
  externalLinks?: { title: string; url: string }[];
  comments?: TaskComment[];
  checklist?: TaskChecklistItem[];
  subtasks?: TaskSubtask[];
  activityLog?: TaskActivity[];
  source?: string;
  shootId?: string;
  contentId?: string;
  campaignId?: string;
  meetingId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShootStatus = 'Planned' | 'Confirmed' | 'In Progress' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface Shoot {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  shootDate: string;
  startTime: string;
  endTime: string;
  month?: string;
  shootNumber?: number;
  shootTeam?: string;
  location: string;
  photographer: string;
  videographer: string;
  brandManager: string;
  projectManager: string;
  contentTeam: string[];
  shootBrief: string;
  shotList: string[];
  clientRequirements: string;
  referenceFiles: string[];
  notes: string;
  status: ShootStatus;
  rawDataLocation: string; // e.g., "Google Drive / HOF / Raw_2026_10_20"
  workflowTriggered?: boolean;
  createdAt: string;
}

export type ContentType = 'Reel' | 'Post' | 'Graphic' | 'Story' | 'Carousel' | 'Short Video' | 'Other';
export type SocialPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'YouTube' | 'Other';
export type ApprovalStatus = 'In Production' | 'Submitted for Review' | 'Changes Required' | 'Approved';
export type PublishingStatus = 'Draft' | 'Scheduled' | 'Published' | 'Missed';

export interface ContentFeedback {
  version: number;
  reviewer: string;
  decision: 'Approved' | 'Changes Required';
  feedback: string;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  contentType: ContentType;
  platform: SocialPlatform;
  scheduledDate: string;
  scheduledTime: string;
  caption: string;
  hashtags: string;
  creativeFileUrl?: string;
  creativeLink?: string; // drive/whatsapp link
  sheetUrl?: string; // direct Google Sheet link
  approvalStatus: ApprovalStatus;
  publishingStatus: PublishingStatus;
  assignedPublisher: string;
  assignedCreator: string;
  publishedUrl?: string;
  publishedAt?: string;
  version: number;
  reviewNotes?: string;
  feedbackHistory?: ContentFeedback[];
  whatsappSourceLink?: string;
  createdAt: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  responsibleRole: string;
  defaultAssigneeName?: string;
  actionType: 'task' | 'review' | 'approval_gate' | 'publishing' | 'handover';
  dueDaysFromPrevious: number;
  autoTriggerNext: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: number;
  isActive: boolean;
  category: 'Shoot to Publish' | 'Design Request' | 'Ad Campaign' | 'Custom';
  stages: WorkflowStage[];
  createdAt: string;
}

export interface AdCampaign {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  platform: 'Meta Ads' | 'Google Ads' | 'LinkedIn Ads' | 'YouTube Ads' | 'Other';
  startDate: string;
  endDate: string;
  budget: number;
  objective: 'Lead Generation' | 'Brand Awareness' | 'Traffic' | 'Conversions' | 'Sales';
  campaignManager: string;
  status: 'Planning' | 'Active' | 'Under Review' | 'Paused' | 'Completed';
  analysisDates: string[];
  clientUpdateDates: string[];
  spent: number;
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  ctr: number;
  cpc: number;
  roas: number;
  notes: string;
  closingReminderSent?: boolean;
}

export interface Project {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  category: 'Menu Design' | 'Website Design' | 'Branding' | 'Presentation' | 'Social Campaign' | 'Printing Material' | 'Other';
  brief: string;
  assignedTeam: string[];
  deadline: string;
  priority: TaskPriority;
  status: 'Briefing' | 'In Progress' | 'Review' | 'Client Approval' | 'Delivered' | 'On Hold';
  progressPercent: number;
  deliverables: string[];
  driveUrl?: string;
}

export interface MeetingActionItem {
  id: string;
  text: string;
  assignee: string;
  isConvertedToTask: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  meetingLink: string;
  agenda: string;
  notes: string;
  decisions: string;
  actionItems: MeetingActionItem[];
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 
    | 'SHOOT_COMPLETED' 
    | 'TASK_COMPLETED' 
    | 'CONTENT_SUBMITTED' 
    | 'REVIEW_APPROVED' 
    | 'CHANGES_REQUESTED' 
    | 'POSTING_DATE_APPROACHING' 
    | 'CAMPAIGN_ANALYSIS_DUE' 
    | 'CAMPAIGN_ENDING';
  condition?: string;
  action: 
    | 'CREATE_TASK' 
    | 'ASSIGN_TASK' 
    | 'CHANGE_STATUS' 
    | 'SEND_NOTIFICATION' 
    | 'ACTIVATE_NEXT_STAGE';
  config: Record<string, any>;
  isEnabled: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  triggerEvent: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  detail: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'task' | 'review' | 'shoot' | 'posting' | 'ad' | 'meeting' | 'team';
  targetTab?: string;
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface SystemSettings {
  appName: string;
  timezone: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isSupabaseConnected: boolean;
  visibleTabs: string[];
  taskCategories: string[];
  priorities: string[];
  departments: string[];
}
