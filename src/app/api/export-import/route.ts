import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { Task, ContentItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'tasks';
    const db = getDatabase();

    if (type === 'tasks') {
      const headers = ['ID', 'Title', 'Brand', 'Category', 'Priority', 'Status', 'Assignee', 'DueDate', 'CompletedAt'];
      const rows = db.tasks.map(t => [
        t.id,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.brandName || ''}"`,
        t.category,
        t.priority,
        t.status,
        `"${t.assigneeName || ''}"`,
        t.dueDate,
        t.completedAt || ''
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="brandflow_tasks.csv"'
        }
      });
    } else if (type === 'posting') {
      const headers = ['ID', 'Title', 'Brand', 'ContentType', 'Platform', 'ScheduledDate', 'ScheduledTime', 'ApprovalStatus', 'PublishingStatus', 'Creator', 'Publisher'];
      const rows = db.content.map(c => [
        c.id,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${c.brandName || ''}"`,
        c.contentType,
        c.platform,
        c.scheduledDate,
        c.scheduledTime,
        c.approvalStatus,
        c.publishingStatus,
        `"${c.assignedCreator || ''}"`,
        `"${c.assignedPublisher || ''}"`
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="brandflow_posting_schedule.csv"'
        }
      });
    }

    return NextResponse.json({ success: true, data: db });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const { type, records } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'No records provided' }, { status: 400 });
    }

    let importedCount = 0;

    if (type === 'tasks') {
      for (const r of records) {
        if (!r.title) continue;
        const brand = db.brands.find(b => b.name.toLowerCase() === (r.brandName || '').toLowerCase()) || db.brands[0];
        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: r.title,
          description: r.description || 'Imported via CSV spreadsheet',
          brandId: brand.id,
          brandName: brand.name,
          category: r.category || 'General',
          priority: r.priority || 'Medium',
          status: r.status || 'To Do',
          assigneeId: 'user-1',
          assigneeName: r.assigneeName || 'Darsh',
          assignedById: 'user-1',
          assignedByName: 'Darsh',
          dueDate: r.dueDate || new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.tasks.unshift(newTask);
        importedCount++;
      }
    } else if (type === 'posting') {
      for (const r of records) {
        if (!r.title) continue;
        const brand = db.brands.find(b => b.name.toLowerCase() === (r.brandName || '').toLowerCase()) || db.brands[0];
        const newPost: ContentItem = {
          id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          brandId: brand.id,
          brandName: brand.name,
          title: r.title,
          contentType: r.contentType || 'Reel',
          platform: r.platform || 'Instagram',
          scheduledDate: r.scheduledDate || new Date().toISOString().split('T')[0],
          scheduledTime: r.scheduledTime || '18:00',
          caption: r.caption || '',
          hashtags: r.hashtags || '',
          approvalStatus: r.approvalStatus || 'In Production',
          publishingStatus: r.publishingStatus || 'Draft',
          assignedPublisher: r.assignedPublisher || 'Isha',
          assignedCreator: r.assignedCreator || 'Chandan',
          version: 1,
          createdAt: new Date().toISOString()
        };
        db.content.unshift(newPost);
        importedCount++;
      }
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Admin',
      action: `Imported ${importedCount} ${type} records from spreadsheet`,
      entityType: 'Import',
      entityId: `import-${Date.now()}`,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, count: importedCount, message: `Successfully imported ${importedCount} items` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
