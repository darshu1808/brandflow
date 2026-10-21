import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { Brand } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newBrand: Brand = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: body.name,
      code: body.code || body.name.substring(0, 4).toUpperCase(),
      tagline: body.tagline || '',
      managerId: body.managerId || 'user-1',
      managerName: body.managerName || 'Darsh',
      clientName: body.clientName || '',
      clientEmail: body.clientEmail || '',
      clientPhone: body.clientPhone || '',
      whatsappGroupUrl: body.whatsappGroupUrl || '',
      driveFolderUrl: body.driveFolderUrl || '',
      instagramUrl: body.instagramUrl || '',
      facebookUrl: body.facebookUrl || '',
      linkedinUrl: body.linkedinUrl || '',
      youtubeUrl: body.youtubeUrl || '',
      logo: body.logo || 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=120&auto=format&fit=crop&q=80',
      brandColor: body.brandColor || '#3156D3',
      status: body.status || 'active',
      teamMemberIds: body.teamMemberIds || ['user-1'],
      createdAt: new Date().toISOString(),
    };

    db.brands.unshift(newBrand);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Admin',
      action: `Created new brand "${newBrand.name}"`,
      entityType: 'Brand',
      entityId: newBrand.id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);
    return NextResponse.json({ success: true, data: newBrand });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.brands.findIndex(b => b.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    db.brands[index] = { ...db.brands[index], ...body };
    saveDatabase(db);

    return NextResponse.json({ success: true, data: db.brands[index] });
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
    const brandToDelete = db.brands.find(b => b.id === id);
    if (!brandToDelete) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    // Permanently remove the brand from db.brands
    db.brands = db.brands.filter(b => b.id !== id);

    // Also remove or clean up associated audit logs
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Me',
      action: `Deleted brand "${brandToDelete.name}"`,
      entityType: 'Brand',
      entityId: id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);

    return NextResponse.json({ success: true, message: `Brand "${brandToDelete.name}" deleted successfully` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
