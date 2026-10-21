import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { parseSheetRow } from '@/lib/postingUtils';
import { ContentItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

function getGoogleSheetCsvUrl(rawUrl: string): { csvUrl: string | null; error?: string } {
  const url = rawUrl.trim();
  if (!url) return { csvUrl: null, error: 'Empty sheet URL' };

  // Already CSV export URL
  if (url.includes('/export?format=csv') || url.includes('/pub?output=csv') || url.includes('gviz/tq?tqx=out:csv')) {
    return { csvUrl: url };
  }

  // Published to web sheet: /d/e/2PACX-.../pubhtml
  const pubMatch = url.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch) {
    const pubId = pubMatch[1];
    return { csvUrl: `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv` };
  }

  // Standard sheet: /spreadsheets/d/{SPREADSHEET_ID}
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (idMatch) {
    const sheetId = idMatch[1];
    const gidMatch = url.match(/[?&#]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    // Use direct export CSV endpoint which accurately respects specific monthly tab gid
    return { csvUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}` };
  }

  return { csvUrl: null, error: 'Not a recognized Google Sheets URL format' };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandId, overwrite = false } = body;
    const db = getDatabase();

    const brand = db.brands.find(b => b.id === brandId);
    if (!brand) {
      return NextResponse.json({ success: false, error: 'Brand not found' }, { status: 404 });
    }

    const sheetUrl = body.sheetUrl || brand.postingSheetUrl;
    if (!sheetUrl) {
      return NextResponse.json({ 
        success: false, 
        error: `No Google Sheet URL configured for brand "${brand.name}". Please add a sheet URL first.` 
      }, { status: 400 });
    }

    const { csvUrl, error: urlError } = getGoogleSheetCsvUrl(sheetUrl);
    if (!csvUrl) {
      return NextResponse.json({ 
        success: false, 
        error: urlError || 'Could not parse Google Sheet link' 
      }, { status: 400 });
    }

    // Fetch CSV content
    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BrandFlow/1.0',
        'Accept': 'text/csv, text/plain, */*'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `Failed to download sheet (HTTP ${response.status}). If the sheet is private, please set Share to "Anyone with the link can view".` 
      }, { status: response.status });
    }

    const text = await response.text();

    // Check if Google returned an HTML login page instead of CSV
    if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('accounts.google.com')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Google Sheet requires login. Please click "Share" in your Google Sheet and change General Access to "Anyone with the link can view", or use "File > Share > Publish to web (CSV)". You can also copy-paste rows into the Sync modal.' 
      }, { status: 403 });
    }

    // Optionally clear existing posts for this brand if overwrite is set
    if (overwrite) {
      db.content = db.content.filter(c => c.brandId !== brand.id);
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let importedCount = 0;
    const today = new Date();

    for (const line of lines) {
      const parsed = parseSheetRow(line, today);
      if (parsed) {
        // Prevent duplicate title on exact same date for this brand
        const exists = db.content.some(c => 
          c.brandId === brand.id && 
          c.scheduledDate === parsed.date && 
          c.title.toLowerCase() === parsed.title.toLowerCase()
        );

        if (!exists) {
          const newPost: ContentItem = {
            id: `content-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            brandId: brand.id,
            brandName: brand.name,
            title: parsed.title,
            contentType: parsed.contentType,
            platform: 'Instagram',
            scheduledDate: parsed.date,
            scheduledTime: '18:00',
            caption: 'Auto-synced from Google Sheet',
            hashtags: '',
            creativeFileUrl: '',
            approvalStatus: 'Approved',
            publishingStatus: parsed.isPosted ? 'Published' : 'Scheduled',
            assignedPublisher: 'Me',
            assignedCreator: 'Content Team',
            version: 1,
            createdAt: new Date().toISOString()
          };

          db.content.unshift(newPost);
          importedCount++;
        }
      }
    }

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      user: 'Brand Manager',
      action: `1-Click Sheet Sync for ${brand.name}: imported ${importedCount} posts`,
      entityType: 'Content',
      entityId: brand.id,
      timestamp: new Date().toISOString()
    });

    saveDatabase(db);

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Successfully synced ${importedCount} posting(s) for ${brand.name} directly from Google Sheet!`
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error during sheet sync' }, { status: 500 });
  }
}
