import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { Workflow } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: body.name,
      description: body.description || '',
      version: 1,
      isActive: true,
      category: body.category || 'Custom',
      stages: body.stages || [],
      createdAt: new Date().toISOString(),
    };

    db.workflows.unshift(newWorkflow);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Admin',
      action: `Created workflow "${newWorkflow.name}"`,
      entityType: 'Workflow',
      entityId: newWorkflow.id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, data: newWorkflow });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.workflows.findIndex(w => w.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    const existing = db.workflows[index];
    const updated: Workflow = {
      ...existing,
      ...body,
      version: (existing.version || 1) + 1, // Auto increment version to protect active projects
    };

    db.workflows[index] = updated;
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Admin',
      action: `Updated workflow "${updated.name}" to version v${updated.version}`,
      entityType: 'Workflow',
      entityId: updated.id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const db = getDatabase();
    const index = db.workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      db.workflows[index].isActive = false;
      saveDatabase(db);
    }

    return NextResponse.json({ success: true, message: 'Workflow deactivated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
