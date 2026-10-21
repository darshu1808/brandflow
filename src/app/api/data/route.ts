import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ success: true, data: db });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
