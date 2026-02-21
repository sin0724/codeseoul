import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
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

  const adminEmail = process.env.CODESEUL_ADMIN_EMAIL;
  if (user.email === adminEmail) {
    redirect('/admin/codeseoul');
  }

  if (profile?.status === 'approved') {
    redirect('/dashboard');
  }
  if (profile?.status === 'pending') {
    redirect('/waiting');
  }
  if (profile?.status === 'rejected') {
    redirect('/rejected');
  }

  redirect('/waiting');
}
