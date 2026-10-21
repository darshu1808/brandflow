import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { Meeting, Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newMeeting: Meeting = {
      id: `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title,
      brandId: body.brandId,
      brandName: body.brandName || db.brands.find(b => b.id === body.brandId)?.name || 'Brand',
      date: body.date || new Date().toISOString().split('T')[0],
      startTime: body.startTime || '10:00',
      endTime: body.endTime || '11:00',
      attendees: body.attendees || [],
      meetingLink: body.meetingLink || '',
      agenda: body.agenda || '',
      notes: body.notes || '',
      decisions: body.decisions || '',
      actionItems: body.actionItems || [],
    };

    db.meetings.unshift(newMeeting);
    saveDatabase(db);

    return NextResponse.json({ success: true, data: newMeeting });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.meetings.findIndex(m => m.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Meeting not found' }, { status: 404 });
    }

    // Check if converting an action item to a task
    if (body.convertActionItemId) {
      const meeting = db.meetings[index];
      const item = meeting.actionItems.find(a => a.id === body.convertActionItemId);
      if (item && !item.isConvertedToTask) {
        item.isConvertedToTask = true;
        const assignee = db.team.find(t => t.name.toLowerCase().includes((item.assignee || '').toLowerCase())) || db.team[0];
        const convertedTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: `Action: ${item.text}`,
          description: `Meeting Action Item from "${meeting.title}" (${meeting.date}).`,
          brandId: meeting.brandId,
          brandName: meeting.brandName,
          category: 'Meeting Action',
          priority: 'High',
          status: 'To Do',
          assigneeId: assignee.id,
          assigneeName: assignee.name,
          assignedById: 'user-1',
          assignedByName: 'Darsh',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          meetingId: meeting.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.tasks.unshift(convertedTask);
      }
    } else {
      db.meetings[index] = { ...db.meetings[index], ...body };
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, data: db.meetings[index] });
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
    db.meetings = db.meetings.filter(m => m.id !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'Meeting deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
