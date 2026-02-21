import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
  | 'kol_approved'
  | 'kol_rejected'
  | 'mission_selected'
  | 'payout_completed'
  | 'tier_approved';

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: NotificationType,
  title: string,
  message?: string
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message: message ?? null,
  });
}
