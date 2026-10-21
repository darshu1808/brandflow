-- BRANDFLOW ENTERPRISE CLOUD POSTGRESQL SCHEMA
-- PRODUCTION-READY SCHEMA WITH INDEXES, CONSTRAINTS & AUDIT TRAILS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'brand_manager',
    department TEXT NOT NULL DEFAULT 'Brand Management',
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BRANDS
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    tagline TEXT,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    whatsapp_group_url TEXT,
    drive_folder_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    linkedin_url TEXT,
    youtube_url TEXT,
    logo_url TEXT,
    brand_color TEXT DEFAULT '#3156D3',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKFLOWS & STAGES
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    category TEXT DEFAULT 'Shoot to Publish',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workflow_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    responsible_role TEXT NOT NULL,
    default_assignee_name TEXT,
    action_type TEXT NOT NULL,
    due_days_from_previous INTEGER DEFAULT 1,
    auto_trigger_next BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SHOOT SCHEDULES
CREATE TABLE IF NOT EXISTS public.shoots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    shoot_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT NOT NULL,
    photographer TEXT,
    videographer TEXT,
    brand_manager TEXT,
    project_manager TEXT,
    shoot_brief TEXT,
    shot_list JSONB DEFAULT '[]'::jsonb,
    client_requirements TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Planned',
    raw_data_location TEXT,
    workflow_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CONTENT ITEMS & POSTING SCHEDULE
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    caption TEXT,
    hashtags TEXT,
    creative_file_url TEXT,
    creative_link TEXT,
    approval_status TEXT DEFAULT 'In Production',
    publishing_status TEXT DEFAULT 'Draft',
    assigned_publisher TEXT,
    assigned_creator TEXT,
    published_url TEXT,
    published_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    review_notes TEXT,
    feedback_history JSONB DEFAULT '[]'::jsonb,
    whatsapp_source_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. UNIVERSAL TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    project_id UUID,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'To Do',
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignee_name TEXT,
    assigned_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by_name TEXT,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    completed_by_name TEXT,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
    workflow_stage TEXT,
    shoot_id UUID REFERENCES public.shoots(id) ON DELETE SET NULL,
    content_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
    checklist JSONB DEFAULT '[]'::jsonb,
    subtasks JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    activity_log JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AD CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
    objective TEXT NOT NULL,
    campaign_manager TEXT,
    status TEXT DEFAULT 'Planning',
    analysis_dates JSONB DEFAULT '[]'::jsonb,
    client_update_dates JSONB DEFAULT '[]'::jsonb,
    spent NUMERIC(12, 2) DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    cpl NUMERIC(10, 2) DEFAULT 0,
    ctr NUMERIC(6, 2) DEFAULT 0,
    cpc NUMERIC(10, 2) DEFAULT 0,
    roas NUMERIC(6, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PROJECTS & DELIVERABLES
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    brief TEXT,
    assigned_team JSONB DEFAULT '[]'::jsonb,
    deadline DATE,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Briefing',
    progress_percent INTEGER DEFAULT 0,
    deliverables JSONB DEFAULT '[]'::jsonb,
    drive_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MEETINGS
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    meeting_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    attendees JSONB DEFAULT '[]'::jsonb,
    meeting_link TEXT,
    agenda TEXT,
    notes TEXT,
    decisions TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUTOMATION RULES & EXECUTIONS
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL,
    condition_expression TEXT,
    action_type TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES public.automation_rules(id) ON DELETE CASCADE,
    rule_name TEXT,
    trigger_event TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL,
    target_tab TEXT,
    target_id TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tasks_brand_id ON public.tasks(brand_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_shoots_brand_id ON public.shoots(brand_id);
CREATE INDEX IF NOT EXISTS idx_shoots_shoot_date ON public.shoots(shoot_date);
CREATE INDEX IF NOT EXISTS idx_content_brand_id ON public.content_items(brand_id);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_date ON public.content_items(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_brand_id ON public.ad_campaigns(brand_id);
