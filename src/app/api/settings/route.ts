import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/database/storage';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ success: true, settings: db.settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    // Check if test Supabase connection requested
    if (body.testSupabase) {
      const url = body.supabaseUrl || db.settings.supabaseUrl;
      const key = body.supabaseAnonKey || db.settings.supabaseAnonKey;
      if (!url || !key) {
        return NextResponse.json({ 
          success: false, 
          message: 'Both Supabase URL and Key are required to test connection.' 
        });
      }
      try {
        const client = createClient(url, key);
        // Ping auth or public table
        const { error } = await client.from('brands').select('id').limit(1);
        // Even if table doesn't exist yet, if auth succeeds it won't fail with invalid API key
        if (error && error.message.includes('Invalid API key')) {
          return NextResponse.json({ success: false, message: `Connection failed: ${error.message}` });
        }
        db.settings.isSupabaseConnected = true;
        db.settings.supabaseUrl = url;
        db.settings.supabaseAnonKey = key;
        saveDatabase(db);
        return NextResponse.json({ success: true, message: 'Successfully connected to Supabase PostgreSQL cloud database!' });
      } catch (e: any) {
        return NextResponse.json({ success: false, message: `Connection error: ${e.message}` });
      }
    }

    db.settings = { ...db.settings, ...body };
    saveDatabase(db);

    return NextResponse.json({ success: true, settings: db.settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
