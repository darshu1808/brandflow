import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, runAutomations } from '@/lib/database/storage';
import { Shoot } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newShoot: Shoot = {
      id: `shoot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title,
      brandId: body.brandId,
      brandName: body.brandName || db.brands.find(b => b.id === body.brandId)?.name || 'Brand',
      shootDate: body.shootDate,
      startTime: body.startTime || '10:00',
      endTime: body.endTime || '18:00',
      location: body.location || '',
      photographer: body.photographer || '',
      videographer: body.videographer || '',
      brandManager: body.brandManager || 'Darsh',
      projectManager: body.projectManager || 'Pinky',
      contentTeam: body.contentTeam || ['Isha'],
      shootBrief: body.shootBrief || '',
      shotList: body.shotList || [],
      clientRequirements: body.clientRequirements || '',
      referenceFiles: body.referenceFiles || [],
      notes: body.notes || '',
      status: body.status || 'Planned',
      rawDataLocation: body.rawDataLocation || '',
      workflowTriggered: false,
      createdAt: new Date().toISOString(),
    };

    db.shoots.unshift(newShoot);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: body.brandManager || 'Darsh',
      action: `Created shoot "${newShoot.title}" for ${newShoot.brandName}`,
      entityType: 'Shoot',
      entityId: newShoot.id,
      timestamp: new Date().toISOString()
    });

    // If created directly as completed, trigger workflow
    if (newShoot.status === 'Completed') {
      newShoot.workflowTriggered = true;
      runAutomations('SHOOT_COMPLETED', newShoot, db);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, data: newShoot });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.shoots.findIndex(s => s.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Shoot not found' }, { status: 404 });
    }

    const existing = db.shoots[index];
    const isNowCompleted = body.status === 'Completed' && existing.status !== 'Completed';

    const updatedShoot: Shoot = {
      ...existing,
      ...body,
    };

    if (isNowCompleted && !updatedShoot.workflowTriggered) {
      updatedShoot.workflowTriggered = true;
      runAutomations('SHOOT_COMPLETED', updatedShoot, db);
    }

    db.shoots[index] = updatedShoot;
    saveDatabase(db);

    return NextResponse.json({ success: true, data: updatedShoot });
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
    db.shoots = db.shoots.filter(s => s.id !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'Shoot deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
