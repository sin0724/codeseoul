'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { zhTW, t } from '@/messages/kol/zh-TW';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, title, message, read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) {
        console.warn('[NotificationBell] Table may not exist:', error.message);
        return;
      }
      setNotifications(data ?? []);
    } catch (err) {
      console.warn('[NotificationBell] Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const init = async () => {
      await fetchNotifications();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchNotifications()
        )
        .subscribe();
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchNotifications());
    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('[NotificationBell] markAsRead error:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;
      await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('[NotificationBell] markAllRead error:', err);
    }
  };

  const formatDate = (s: string) => {
    const d = new Date(s);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return zhTW.justNow;
    if (diff < 3600_000) return t('minutesAgo', { n: Math.floor(diff / 60_000) });
    if (diff < 86400_000) return t('hoursAgo', { n: Math.floor(diff / 3600_000) });
    return d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) fetchNotifications();
        }}
        className="relative p-2 rounded hover:bg-white/10 transition-colors"
        aria-label={zhTW.notifications}
      >
        <Bell className="w-5 h-5 text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#FF0000] text-xs font-mono text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[360px] overflow-y-auto rounded border border-white/10 bg-black/95 backdrop-blur shadow-xl z-50">
          <div className="sticky top-0 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/90">
            <span className="font-mono text-sm font-medium text-white">{zhTW.notifications}</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-mono text-[#FF0000] hover:underline"
              >
                {zhTW.markAllRead}
              </button>
            )}
          </div>
          <div className="divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/50 font-mono text-sm">
                {zhTW.noNotifications}
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                  className={`px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors ${
                    !n.read ? 'bg-[#FF0000]/5' : ''
                  }`}
                >
                  <p className={`font-mono text-sm ${!n.read ? 'text-white font-medium' : 'text-white/90'}`}>
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="mt-0.5 font-mono text-xs text-white/60 line-clamp-2">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-xs text-white/40">{formatDate(n.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
