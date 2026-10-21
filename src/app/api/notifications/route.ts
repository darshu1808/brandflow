import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    if (body.markAllRead) {
      db.notifications.forEach(n => n.isRead = true);
    } else if (body.id) {
      const notif = db.notifications.find(n => n.id === body.id);
      if (notif) notif.isRead = true;
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, notifications: db.notifications });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
