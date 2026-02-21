import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { zhTW } from '@/messages/kol/zh-TW';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 font-mono tracking-wider">
        {zhTW.profile}
      </h1>
      <p className="text-white/60 text-sm mb-8 font-mono">
        為結算請填寫銀行資訊。
      </p>
      <ProfileForm profile={profile} />
    </div>
  );
}
