'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createAdminClient, createAdminClientOrNull } from '@/lib/admin';
import { getOptionalAuth, requireAuth } from '@/lib/auth';
import type {
  CompanionFilters,
  CompanionInput,
  CompanionRecord,
  CompanionUpdateInput,
  CompanionVisibility,
} from '@/types/companion';
import { resolveVoiceId } from '@/types/companion';

const companionInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(20),
  subject: z.string().min(2),
  topic: z.string().optional(),
  avatar_url: z.string().url().nullable().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  voice: z.enum(['male', 'female']).optional(),
  voice_provider: z.string().optional(),
  voice_id: z.string().optional(),
  greeting: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  system_prompt: z.string().nullable().optional(),
  ai_model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  language: z.string().optional(),
  style: z.enum(['formal', 'casual']).optional(),
  duration: z.number().int().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  knowledge: z.string().nullable().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  bookmark: z.boolean().optional(),
});

const CARD_COLORS = ['#ffda6e', '#e5d0ff', '#BDE7FF', '#ffd6e8', '#d4f8d4'];

function normalizeCompanionInput(input: CompanionInput, userId: string) {
  const voice = input.voice ?? 'female';

  return {
    user_id: userId,
    name: input.name.trim(),
    description: input.description.trim(),
    subject: input.subject.trim(),
    topic: (input.topic ?? input.subject).trim(),
    avatar_url: input.avatar_url ?? null,
    color: input.color ?? CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)],
    category: input.category ?? 'general',
    voice,
    voice_provider: input.voice_provider ?? 'openai',
    voice_id: resolveVoiceId(voice, input.voice_id),
    greeting: input.greeting ?? null,
    instructions: input.instructions ?? null,
    system_prompt: input.system_prompt ?? null,
    ai_model: input.ai_model ?? 'gpt-4o-mini',
    temperature: input.temperature ?? 0.7,
    language: input.language ?? 'en',
    style: input.style ?? 'casual',
    duration: input.duration ?? 30,
    metadata: input.metadata ?? {},
    knowledge: input.knowledge ?? null,
    visibility: input.visibility ?? 'private',
    bookmark: input.bookmark ?? false,
  };
}

function buildCompanionsQuery(
  supabase: ReturnType<typeof createAdminClient>,
  filters: CompanionFilters,
  userId: string | null
) {
  let query = supabase.from('companions').select('*');

  if (filters.mineOnly) {
    if (!userId) {
      return query.eq('user_id', '');
    }

    query = query.eq('user_id', userId);
  } else if (userId) {
    query = query.or(`visibility.eq.public,user_id.eq.${userId}`);
  } else {
    query = query.eq('visibility', 'public');
  }

  if (filters.subject) {
    query = query.ilike('subject', `%${filters.subject}%`);
  }

  if (filters.visibility && filters.visibility !== 'all') {
    query = query.eq('visibility', filters.visibility);
  }

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `name.ilike.%${term}%,subject.ilike.%${term}%,topic.ilike.%${term}%,description.ilike.%${term}%`
    );
  }

  switch (filters.sort) {
    case 'oldest':
      return query.order('created_at', { ascending: true });
    case 'name':
      return query.order('name', { ascending: true });
    case 'newest':
    default:
      return query.order('created_at', { ascending: false });
  }
}

async function getOwnedCompanion(id: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('companions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as CompanionRecord | null;
}

export async function getCompanions(filters: CompanionFilters = {}) {
  const userId = await getOptionalAuth();
  const supabase = createAdminClientOrNull();

  if (!supabase) {
    return [];
  }

  const query = buildCompanionsQuery(supabase, filters, userId);

  const { data, error } = await query;

  if (error) {
    // Supabase may not have the migrations applied in some environments.
    // If the companions table doesn't exist yet, return a safe default
    // instead of crashing the whole page.
    if (/Could not find the table/i.test(error.message)) {
      return [] as CompanionRecord[];
    }

    throw new Error(error.message);
  }

  return (data ?? []) as CompanionRecord[];
}

export async function getPopularCompanions(limit = 6) {
  const userId = await getOptionalAuth();
  const supabase = createAdminClientOrNull();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from('companions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) {
    query = query.or(`visibility.eq.public,user_id.eq.${userId}`);
  } else {
    query = query.eq('visibility', 'public');
  }

  const { data, error } = await query;

  if (error) {
    if (/Could not find the table/i.test(error.message)) {
      return [] as CompanionRecord[];
    }

    throw new Error(error.message);
  }

  return (data ?? []) as CompanionRecord[];
}

export async function getCompanionById(id: string) {
  const userId = await getOptionalAuth();
  const supabase = createAdminClientOrNull();

  if (!supabase) {
    return null;
  }

  let query = supabase.from('companions').select('*').eq('id', id);

  if (userId) {
    query = query.or(`visibility.eq.public,user_id.eq.${userId}`);
  } else {
    query = query.eq('visibility', 'public');
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    if (/Could not find the table/i.test(error.message)) {
      return null;
    }

    throw new Error(error.message);
  }

  return data as CompanionRecord | null;
}

export async function createCompanion(input: CompanionInput) {
  const userId = await requireAuth();
  const parsed = companionInputSchema.parse(input);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('companions')
    .insert(normalizeCompanionInput(parsed, userId))
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/companions');
  revalidatePath('/my-journey');

  return data as CompanionRecord;
}

export async function updateCompanion(id: string, input: CompanionUpdateInput) {
  const userId = await requireAuth();
  const parsed = companionInputSchema.partial().parse(input);
  const supabase = createAdminClient();

  const existing = await getOwnedCompanion(id, userId);
  if (!existing) {
    throw new Error('Companion not found or access denied');
  }

  const voice = parsed.voice ?? existing.voice;
  const payload = {
    ...parsed,
    voice_id: parsed.voice_id ?? resolveVoiceId(voice, undefined),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('companions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/companions');
  revalidatePath(`/companions/${id}`);
  revalidatePath('/my-journey');

  return data as CompanionRecord;
}

export async function deleteCompanion(id: string) {
  const userId = await requireAuth();
  const supabase = createAdminClient();

  const existing = await getOwnedCompanion(id, userId);
  if (!existing) {
    throw new Error('Companion not found or access denied');
  }

  const { error } = await supabase
    .from('companions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  revalidatePath('/companions');
  revalidatePath('/my-journey');
}

export async function toggleCompanionBookmark(id: string, bookmark: boolean) {
  return updateCompanion(id, { bookmark });
}

export async function setCompanionVisibility(id: string, visibility: CompanionVisibility) {
  return updateCompanion(id, { visibility });
}
