# BrandFlow — Cloud Deployment & Configuration Guide

**BrandFlow** is a complete, cloud-based Brand Management and Marketing Operations Web Application built for Brand Managers managing multiple brands, content production pipelines, shoot schedules, posting calendars, creative review queues, advertising campaigns, and team handovers.

---

## 1. Cloud Architecture Overview

- **Frontend & API**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (BrandFlow SaaS Design System)
- **Local / Resilient Storage**: Server-side persistent storage engine (`data/brandflow_db.json`)
- **Cloud Database**: PostgreSQL / Supabase PostgreSQL with complete migrations (`supabase/migrations/001_brandflow_schema.sql`)
- **Hosting Target**: Vercel, Railway, Render, Docker, or AWS
- **Timezone**: Configured for `Asia/Kolkata` (IST, UTC+05:30) with UTC storage

---

## 2. Cloud Deployment to Vercel (Recommended)

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy BrandFlow production release"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository (`darshportfolio` or renamed to `brandflow`).
4. Framework Preset: **Next.js**
5. (Optional) Configure Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (e.g., `https://xyz.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key (server-only)
6. Click **Deploy**. Vercel will build and assign an HTTPS URL (e.g. `https://brandflow-app.vercel.app`).

---

## 3. Custom Domain Configuration (e.g. `https://app.mybrand.com`)

To access BrandFlow via your custom domain:

1. Open your Vercel Project Dashboard → **Settings** → **Domains**.
2. Enter your custom domain: e.g. `app.mybrand.com`.
3. In your DNS Provider (GoDaddy, Cloudflare, Namecheap, Google Domains, etc.), add the DNS record:
   - **Type**: `CNAME`
   - **Name / Host**: `app`
   - **Value / Target**: `cname.vercel-dns.com`
   - **TTL**: Auto / 3600
4. Vercel automatically generates and renews the SSL/TLS certificate (HTTPS) within a few minutes.

---

## 4. Supabase Cloud Database Integration

1. Create a free project on [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open the file `supabase/migrations/001_brandflow_schema.sql` in this repo, copy its contents, paste them into the SQL editor, and click **Run**.
   - This creates all 12 core tables: `profiles`, `brands`, `workflows`, `workflow_stages`, `shoots`, `content_items`, `tasks`, `ad_campaigns`, `projects`, `meetings`, `automation_rules`, `audit_logs`.
   - Also sets foreign keys, cascade deletes, and search indexes.
4. In the BrandFlow web interface, navigate to **Settings / Admin** → **Cloud PostgreSQL Database Connection**.
5. Paste your Supabase Project URL and Key, then click **"Test & Save Supabase Connection"**.

---

## 5. Running BrandFlow Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or run optimized production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Running Automated Verification Tests

The test suite validates all 12 end-to-end operational scenarios:
```bash
npm run test
```

Verifies:
1. Universal Task Creation & Persistence
2. Brand Creation & Manager Assignment
3. Task Completion Tracking & Confetti Trigger
4. Shoot Completed → Automated Raw Data Sorting Task Dispatch
5. Creative Review Queue (Submit → Request Changes → Approve)
6. Social Media Publishing Confirmation & Timestamp
7. Ad Campaign Analysis Milestones
8. Meeting Action Item 1-Click Task Conversion
9. Dynamic Workflow Builder Stage Customization & Versioning
10. Notifications Read Tracking
11. Spreadsheet CSV Export & Import Validation

---

## 7. Supported Modules & Daily Operations

| Module | Purpose |
|---|---|
| **Dashboard** | Daily command center with 10 real-time operational sections (Today's Tasks, Creative Review Queue, Posting Today, Shoot Schedule, Data Sorting, Handover, Ads, Meetings, Waiting For, Completed Today) |
| **My Tasks** | Universal task management with priorities, checklists, subtasks, comments, activity logs |
| **Calendar** | Unified timeline of shoot dates, scheduled reels/posts, meetings, and task deadlines |
| **Shoot Schedule** | Production planner with photographer/videographer allocation, location, raw footage cloud link, and post-shoot handover triggers |
| **Posting Schedule** | Social calendar for Instagram, Facebook, LinkedIn, YouTube with dual approval vs live URL publishing verification |
| **Brands** | Independent brand workspaces (HOF, TNC, Hermione Depot, Lafayette, Cquence) with live metrics |
| **Team** | Directory and workload balancing across Brand Management, PMs, Content, and Video Editors |
| **Workflows** | Dynamic drag-and-drop / orderable stage pipeline builder with version protection |
| **Ads Manager** | Multi-channel ad tracking (Budget, Spent, CPL, CTR, ROAS) with automated analysis reminders |
| **Projects** | Creative projects (menu designs, branding, packaging suites) with progress sliders |
| **Meetings** | Meeting notes, agendas, decisions, and 1-click action item to task converter |
| **Automation** | Configurable event rules (WHEN [Event] IF [Condition] THEN [Action]) with execution audit trails |
| **Reports** | Productivity breakdown, brand-wise throughput bars, and CSV export ledger |
| **Notifications** | In-app alerts for reviews, shoots, and team assignments |
| **Settings / Admin** | Cloud database configuration, custom domain guide, and business categories |
