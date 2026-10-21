import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { AdCampaign, Task } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newCampaign: AdCampaign = {
      id: `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandId: body.brandId,
      brandName: body.brandName || db.brands.find(b => b.id === body.brandId)?.name || 'Brand',
      name: body.name,
      platform: body.platform || 'Meta Ads',
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || new Date(Date.now() + 864000000).toISOString().split('T')[0],
      budget: Number(body.budget) || 0,
      objective: body.objective || 'Lead Generation',
      campaignManager: body.campaignManager || 'Darsh',
      status: body.status || 'Active',
      analysisDates: body.analysisDates || [],
      clientUpdateDates: body.clientUpdateDates || [],
      spent: Number(body.spent) || 0,
      reach: Number(body.reach) || 0,
      impressions: Number(body.impressions) || 0,
      clicks: Number(body.clicks) || 0,
      leads: Number(body.leads) || 0,
      cpl: Number(body.cpl) || 0,
      ctr: Number(body.ctr) || 0,
      cpc: Number(body.cpc) || 0,
      roas: Number(body.roas) || 0,
      notes: body.notes || '',
    };

    // Calculate CTR, CPC, CPL automatically if metrics provided
    if (newCampaign.clicks > 0 && newCampaign.impressions > 0) {
      newCampaign.ctr = Number(((newCampaign.clicks / newCampaign.impressions) * 100).toFixed(2));
    }
    if (newCampaign.clicks > 0 && newCampaign.spent > 0) {
      newCampaign.cpc = Number((newCampaign.spent / newCampaign.clicks).toFixed(2));
    }
    if (newCampaign.leads > 0 && newCampaign.spent > 0) {
      newCampaign.cpl = Number((newCampaign.spent / newCampaign.leads).toFixed(2));
    }

    // Auto-calculate follow-up checkpoints based on campaign duration
    const start = new Date(newCampaign.startDate);
    const end = new Date(newCampaign.endDate);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Follow-up count rules: 1-3 days -> 1; 4-5 days -> 2; 6-10 days -> 3; 11-20 days -> 6; >20 days -> every 4 days
    let followUpCount = 1;
    if (totalDays <= 3) followUpCount = 1;
    else if (totalDays <= 5) followUpCount = 2;
    else if (totalDays <= 10) followUpCount = 3;
    else if (totalDays <= 20) followUpCount = 6;
    else followUpCount = Math.min(8, Math.ceil(totalDays / 4));

    const followUpCheckpoints: { dateStr: string; label: string; index: number }[] = [];
    const seenDates = new Set<string>();

    for (let i = 1; i <= followUpCount; i++) {
      const dayOffset = Math.round((i / followUpCount) * totalDays);
      const d = new Date(start);
      d.setDate(d.getDate() + (dayOffset - 1));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      if (!seenDates.has(dateKey)) {
        seenDates.add(dateKey);
        let label = `Follow-up #${i}: Ad Check`;
        if (i === 1) label = `Follow-up #1: Initial Traction & CPL Check`;
        else if (i === followUpCount) label = `Follow-up #${i}: Final Performance & ROI Report`;
        else if (i === Math.floor(followUpCount / 2)) label = `Follow-up #${i}: Mid-Campaign CTR & Creative Review`;

        followUpCheckpoints.push({ dateStr: dateKey, label, index: i });
      }
    }

    newCampaign.analysisDates = followUpCheckpoints.map(cp => cp.dateStr);

    // Auto-create universal tasks for all scheduled follow-ups
    followUpCheckpoints.forEach((cp) => {
      const analysisTask: Task = {
        id: `task-${Date.now()}-${cp.index}-${Math.random().toString(36).substring(2, 5)}`,
        title: `📊 ${cp.label}: ${newCampaign.name} (${newCampaign.brandName})`,
        description: `Ad campaign running from ${newCampaign.startDate} to ${newCampaign.endDate}. Check CPL, CTR, spend pacing, and take necessary optimization actions.`,
        brandId: newCampaign.brandId,
        brandName: newCampaign.brandName,
        category: 'Ad Campaign',
        priority: 'High',
        status: 'To Do',
        assigneeId: 'user-1',
        assigneeName: newCampaign.campaignManager || 'Darsh',
        assignedById: 'system',
        assignedByName: 'BrandFlow Ads Engine',
        dueDate: cp.dateStr,
        campaignId: newCampaign.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.tasks.unshift(analysisTask);
    });

    db.ads.unshift(newCampaign);
    saveDatabase(db);

    return NextResponse.json({ success: true, data: newCampaign });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.ads.findIndex(a => a.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
    }

    const updated = { ...db.ads[index], ...body };
    // Recalculate metrics
    if (updated.clicks > 0 && updated.impressions > 0) {
      updated.ctr = Number(((updated.clicks / updated.impressions) * 100).toFixed(2));
    }
    if (updated.clicks > 0 && updated.spent > 0) {
      updated.cpc = Number((updated.spent / updated.clicks).toFixed(2));
    }
    if (updated.leads > 0 && updated.spent > 0) {
      updated.cpl = Number((updated.spent / updated.leads).toFixed(2));
    }

    db.ads[index] = updated;
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
    db.ads = db.ads.filter(a => a.id !== id);
    db.tasks = db.tasks.filter(t => t.campaignId !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true, message: 'Campaign deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
