import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const origin = `${protocol}://${host}`;
  
  return NextResponse.redirect(new URL('/login', origin), { status: 302 });
}
