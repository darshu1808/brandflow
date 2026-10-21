import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, runAutomations } from '@/lib/database/storage';
import { ContentItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newItem: ContentItem = {
      id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandId: body.brandId,
      brandName: body.brandName || db.brands.find(b => b.id === body.brandId)?.name || 'Brand',
      title: body.title,
      contentType: body.contentType || 'Reel',
      platform: body.platform || 'Instagram',
      scheduledDate: body.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: body.scheduledTime || '18:00',
      caption: body.caption || '',
      hashtags: body.hashtags || '',
      creativeFileUrl: body.creativeFileUrl || '',
      creativeLink: body.creativeLink || '',
      approvalStatus: body.approvalStatus || 'In Production',
      publishingStatus: body.publishingStatus || 'Draft',
      assignedPublisher: body.assignedPublisher || 'Isha',
      assignedCreator: body.assignedCreator || 'Chandan',
      version: body.version || 1,
      reviewNotes: body.reviewNotes || '',
      feedbackHistory: body.feedbackHistory || [],
      whatsappSourceLink: body.whatsappSourceLink || '',
      createdAt: new Date().toISOString(),
    };

    db.content.unshift(newItem);
    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: body.assignedCreator || 'User',
      action: `Created content item "${newItem.title}" for ${newItem.brandName}`,
      entityType: 'Content',
      entityId: newItem.id,
      timestamp: new Date().toISOString()
    });

    if (newItem.approvalStatus === 'Submitted for Review') {
      runAutomations('CONTENT_SUBMITTED', newItem, db);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, data: newItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.content.findIndex(c => c.id === body.id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Content item not found' }, { status: 404 });
    }

    const existing = db.content[index];
    const isSubmitted = body.approvalStatus === 'Submitted for Review' && existing.approvalStatus !== 'Submitted for Review';
    const isApproved = body.approvalStatus === 'Approved' && existing.approvalStatus !== 'Approved';
    const isChangesReq = body.approvalStatus === 'Changes Required' && existing.approvalStatus !== 'Changes Required';
    const isPublished = body.publishingStatus === 'Published' && existing.publishingStatus !== 'Published';

    const updatedItem: ContentItem = {
      ...existing,
      ...body,
    };

    if (body.reviewerFeedback && (isApproved || isChangesReq)) {
      if (!updatedItem.feedbackHistory) updatedItem.feedbackHistory = [];
      updatedItem.feedbackHistory.unshift({
        version: updatedItem.version,
        reviewer: body.reviewerName || 'Darsh',
        decision: isApproved ? 'Approved' : 'Changes Required',
        feedback: body.reviewerFeedback,
        timestamp: new Date().toISOString()
      });
      if (isChangesReq) {
        updatedItem.version = updatedItem.version + 1;
      }
    }

    if (isPublished) {
      updatedItem.publishedAt = new Date().toISOString();
      if (body.publishedUrl) updatedItem.publishedUrl = body.publishedUrl;
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        user: body.publisherName || 'Isha',
        action: `Published content item "${updatedItem.title}" on ${updatedItem.platform}`,
        entityType: 'Content',
        entityId: updatedItem.id,
        timestamp: new Date().toISOString()
      });
    }

    if (isSubmitted) {
      runAutomations('CONTENT_SUBMITTED', updatedItem, db);
    } else if (isApproved) {
      runAutomations('REVIEW_APPROVED', updatedItem, db);
    }

    db.content[index] = updatedItem;
    saveDatabase(db);

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const brandId = searchParams.get('brandId');
    const all = searchParams.get('all');

    const db = getDatabase();

    if (id) {
      db.content = db.content.filter(c => c.id !== id);
    } else if (brandId && brandId !== 'all') {
      const brandObj = db.brands.find(b => b.id === brandId);
      const prevCount = db.content.length;
      db.content = db.content.filter(c => c.brandId !== brandId);
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        user: 'Me',
        action: `Cleared ${prevCount - db.content.length} posts for ${brandObj?.name || brandId}`,
        entityType: 'Content',
        entityId: brandId,
        timestamp: new Date().toISOString()
      });
    } else if (all === 'true' || brandId === 'all') {
      db.content = [];
      db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        user: 'Me',
        action: 'Cleared all posts in schedule',
        entityType: 'Content',
        entityId: 'all',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ success: false, error: 'ID or brandId or all=true required' }, { status: 400 });
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, message: 'Posts deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
