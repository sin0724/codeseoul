'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { zhTW } from '@/messages/kol/zh-TW';
import type { Profile } from '@/lib/codeseoul/types';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

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
