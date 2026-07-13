export type CompanionVisibility = 'public' | 'private';

export type CompanionRecord = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  subject: string;
  topic: string;
  avatar_url: string | null;
  color: string;
  category: string;
  voice: string;
  voice_provider: string;
  voice_id: string;
  greeting: string | null;
  instructions: string | null;
  system_prompt: string | null;
  ai_model: string;
  temperature: number;
  language: string;
  style: string;
  duration: number;
  metadata: Record<string, unknown>;
  knowledge: string | null;
  visibility: CompanionVisibility;
  bookmark: boolean;
  created_at: string;
  updated_at: string;
};

export type CompanionInput = {
  name: string;
  description: string;
  subject: string;
  topic?: string;
  avatar_url?: string | null;
  color?: string;
  category?: string;
  voice?: string;
  voice_provider?: string;
  voice_id?: string;
  greeting?: string | null;
  instructions?: string | null;
  system_prompt?: string | null;
  ai_model?: string;
  temperature?: number;
  language?: string;
  style?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
  knowledge?: string | null;
  visibility?: CompanionVisibility;
  bookmark?: boolean;
};

export type CompanionUpdateInput = Partial<CompanionInput>;

export type VoiceConversationRecord = {
  id: string;
  user_id: string;
  companion_id: string;
  transcript: string;
  duration: number;
  created_at: string;
  updated_at: string;
  companions?: Pick<CompanionRecord, 'name' | 'subject' | 'topic' | 'color'> | null;
};

export type CompanionSort = 'newest' | 'oldest' | 'name';

export type CompanionFilters = {
  search?: string;
  subject?: string;
  visibility?: CompanionVisibility | 'all';
  sort?: CompanionSort;
  mineOnly?: boolean;
};

const VOICE_ID_MAP: Record<string, string> = {
  female: 'alloy',
  male: 'ash',
};

export function resolveVoiceId(voice: string, voiceId?: string) {
  if (voiceId) return voiceId;
  return VOICE_ID_MAP[voice] ?? 'alloy';
}

export function buildCompanionSystemPrompt(companion: Pick<
  CompanionRecord,
  'description' | 'instructions' | 'system_prompt' | 'knowledge' | 'style'
>) {
  const parts = [
    companion.system_prompt,
    companion.description,
    companion.instructions,
    companion.knowledge ? `Knowledge:\n${companion.knowledge}` : null,
    `Communication style: ${companion.style}. Stay concise, warm, and encouraging.`,
  ].filter(Boolean);

  return parts.join('\n\n');
}

export function buildCompanionGreeting(companion: Pick<CompanionRecord, 'name' | 'subject' | 'greeting'>) {
  if (companion.greeting) return companion.greeting;
  return `Hi! I'm ${companion.name}. I can help with ${companion.subject.toLowerCase()}.`;
}
