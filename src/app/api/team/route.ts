import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { TeamMember } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newMember: TeamMember = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: body.name,
      email: body.email,
      role: body.role || 'content_team',
      department: body.department || 'Content Team',
      assignedBrandIds: body.assignedBrandIds || [],
      avatar: body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: body.phone || '',
      isActive: true,
      activeTasksCount: 0,
    };

    db.team.unshift(newMember);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Admin',
      action: `Added team member "${newMember.name}" (${newMember.role})`,
      entityType: 'Team',
      entityId: newMember.id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, data: newMember });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.team.findIndex(m => m.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
    }

    db.team[index] = { ...db.team[index], ...body };
    saveDatabase(db);

    return NextResponse.json({ success: true, data: db.team[index] });
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
    db.team = db.team.filter(m => m.id !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
