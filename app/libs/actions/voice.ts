'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient, createAdminClientOrNull } from '@/lib/admin';
import { getOptionalAuth, requireAuth } from '@/lib/auth';
import type { VoiceConversationRecord } from '@/types/companion';

export async function saveVoiceConversation(input: {
  companionId: string;
  transcript: string;
  duration: number;
  // Optional: stored for debugging/analytics only.
  subjectGate?: { allowed: boolean; confidence: number };
}) {

  const userId = await requireAuth();

  const supabase = createAdminClient();

  const { data: companion, error: companionError } = await supabase
    .from('companions')
    .select('id')
    .eq('id', input.companionId)
    .or(`visibility.eq.public,user_id.eq.${userId}`)
    .maybeSingle();

  if (companionError) {
    throw new Error(companionError.message);
  }

  if (!companion) {
    throw new Error('Companion not found or access denied');
  }

  const { error } = await supabase.from('voice_conversations').insert({
    user_id: userId,
    companion_id: input.companionId,
    transcript: input.transcript.trim(),
    duration: input.duration,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/my-journey');

  return { ok: true };
}

export async function getRecentVoiceConversations(limit = 8) {

  const userId = await getOptionalAuth();

  if (!userId) {
    return [];
  }

  const supabase = createAdminClientOrNull();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('voice_conversations')
    .select('*, companions(name, subject, topic, color)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as VoiceConversationRecord[];
}

export async function getVoiceConversationsForJourney() {
  return getRecentVoiceConversations(50);
}

export async function deleteVoiceConversation(id: string) {
  const userId = await requireAuth();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('voice_conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/my-journey');
}
