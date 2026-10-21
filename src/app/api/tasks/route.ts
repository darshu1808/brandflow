import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, runAutomations } from '@/lib/database/storage';
import { Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title,
      description: body.description || '',
      brandId: body.brandId,
      brandName: body.brandName || db.brands.find(b => b.id === body.brandId)?.name || 'General',
      projectId: body.projectId,
      category: body.category || 'General',
      priority: body.priority || 'Medium',
      status: body.status || 'To Do',
      assigneeId: body.assigneeId || 'user-1',
      assigneeName: body.assigneeName || 'Darsh',
      assignedById: body.assignedById || 'user-1',
      assignedByName: body.assignedByName || 'Darsh',
      dueDate: body.dueDate || new Date(Date.now() + 86400000).toISOString(),
      workflowId: body.workflowId,
      workflowStage: body.workflowStage,
      checklist: body.checklist || [],
      subtasks: body.subtasks || [],
      comments: body.comments || [],
      activityLog: [
        {
          id: `act-${Date.now()}`,
          user: body.assignedByName || 'Darsh',
          action: 'Created task',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.tasks.unshift(newTask);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: body.assignedByName || 'Darsh',
      action: `Created task "${newTask.title}" for brand ${newTask.brandName}`,
      entityType: 'Task',
      entityId: newTask.id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, data: newTask });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.tasks.findIndex(t => t.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const existing = db.tasks[index];
    const isNowDone = body.status === 'Done' && existing.status !== 'Done';
    const isReopened = existing.status === 'Done' && body.status && body.status !== 'Done';

    const updatedTask: Task = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (isNowDone) {
      updatedTask.completedAt = new Date().toISOString();
      updatedTask.completedById = body.currentUserId || 'user-1';
      updatedTask.completedByName = body.currentUserName || 'Darsh';
      if (!updatedTask.activityLog) updatedTask.activityLog = [];
      updatedTask.activityLog.unshift({
        id: `act-${Date.now()}`,
        user: updatedTask.completedByName || 'Darsh',
        action: `Marked task Done at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString()
      });
      // Run automations!
      runAutomations('TASK_COMPLETED', updatedTask, db);
    } else if (isReopened) {
      updatedTask.completedAt = undefined;
      updatedTask.completedById = undefined;
      updatedTask.completedByName = undefined;
      if (!updatedTask.activityLog) updatedTask.activityLog = [];
      updatedTask.activityLog.unshift({
        id: `act-${Date.now()}`,
        user: body.currentUserName || 'Darsh',
        action: `Reopened task`,
        timestamp: new Date().toISOString()
      });
    }

    db.tasks[index] = updatedTask;
    saveDatabase(db);

    return NextResponse.json({ success: true, data: updatedTask });
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
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
