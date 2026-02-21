import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WaitingContent } from './WaitingContent';

export const dynamic = 'force-dynamic';

export default async function WaitingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single();
  
  const status = profile?.status;
  
  if (status === 'approved') {
    redirect('/dashboard');
  }
  
  if (status === 'rejected') {
    redirect('/rejected');
  }
  
  return <WaitingContent />;
}
