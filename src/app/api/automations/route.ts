import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, runAutomations } from '@/lib/database/storage';
import { AutomationRule } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({
      success: true,
      rules: db.automations,
      executions: db.executions
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newRule: AutomationRule = {
      id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: body.name,
      description: body.description || '',
      trigger: body.trigger,
      condition: body.condition || '',
      action: body.action,
      config: body.config || {},
      isEnabled: true,
      executionCount: 0,
    };

    db.automations.unshift(newRule);
    saveDatabase(db);

    return NextResponse.json({ success: true, data: newRule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    // If triggering a test run
    if (body.testRuleId) {
      const rule = db.automations.find(r => r.id === body.testRuleId);
      if (!rule) return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
      
      const samplePayload = db.shoots[0] || { brandName: 'Test Brand', id: 'sample' };
      runAutomations(rule.trigger as any, samplePayload, db);
      saveDatabase(db);
      return NextResponse.json({ success: true, message: 'Test execution completed' });
    }

    const index = db.automations.findIndex(a => a.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Rule not found' }, { status: 404 });
    }

    db.automations[index] = { ...db.automations[index], ...body };
    saveDatabase(db);

    return NextResponse.json({ success: true, data: db.automations[index] });
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
    db.automations = db.automations.filter(a => a.id !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'Rule deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
