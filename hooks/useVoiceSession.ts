'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { saveVoiceConversation } from '@/app/libs/actions/voice';
import type { CompanionRecord } from '@/types/companion';
import { buildCompanionGreeting, buildCompanionSystemPrompt } from '@/types/companion';
import { useVapi } from './useVapi';
import { validateSubjectTurn } from '@/lib/subject/validateSubjectTurn';




export function useVoiceSession(companion: CompanionRecord) {
  const {
    isConfigured,
    status,
    isMuted,
    volumeLevel,
    error,
    transcriptLines,
    startCall,
    stopCall,
    reconnect,
    toggleMute,
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
  } = useVapi();

  const [callDuration, setCallDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<string[]>([]);

  const lastTranscriptIndexRef = useRef<number>(0);



  useEffect(() => {
    transcriptRef.current = transcriptLines;

    // Call-killer gate: validate newly added user transcript chunks.
    // Best-effort: if an off-topic/prompt-injection-like turn is detected,
    // stop the call immediately (prevent further model output).
    (async () => {
      const companionSubject = companion.subject;
      const companionTopic = companion.topic;

      const prevCount = lastTranscriptIndexRef.current;
      const newSegments = transcriptLines.slice(prevCount);
      if (newSegments.length === 0) return;

      // Advance index early to avoid re-checking the same segments.
      lastTranscriptIndexRef.current = transcriptLines.length;

      const candidate = newSegments[newSegments.length - 1]?.trim();
      if (!candidate) return;

      const endpointUrl = '/api/topic-classification';
      const decision = await validateSubjectTurn({
        endpointUrl,
        companionSubject,
        companionTopic,
        text: candidate,
      });

      if (!decision.allowed) {
        stopCall();
      }
    })().catch(() => {
      // If classification fails, do not hard-block conversation.
    });
  }, [transcriptLines, companion, stopCall]);



  useEffect(() => {
    if (isConnected && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallDuration((value) => value + 1);
      }, 1000);
    }

    if (!isConnected && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [isConnected]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const buildAssistantConfig = useCallback(() => ({
    name: companion.name,
    firstMessage: buildCompanionGreeting(companion),
    model: {
      provider: 'openai' as const,
      model: 'gpt-4o-mini' as const,
      temperature: companion.temperature,
      messages: [
        {
          role: 'system' as const,
          content: buildCompanionSystemPrompt(companion),
        },
      ],
    },
    voice: {
      provider: 'openai' as const,
      voiceId: companion.voice_id || 'alloy',
    },
  }), [companion]);

  const persistTranscript = useCallback(async (duration: number) => {

    const transcript = transcriptRef.current.join('\n').trim();
    if (!transcript || duration <= 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveVoiceConversation({
        companionId: companion.id,
        transcript,
        duration,
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save transcript');
    } finally {
      setIsSaving(false);
    }
  }, [companion.id]);

  const startConversation = useCallback(async () => {
    setCallDuration(0);
    setSaveError(null);
    await startCall(buildAssistantConfig());
  }, [buildAssistantConfig, startCall]);

  const endConversation = useCallback(async () => {
    const duration = callDuration;
    stopCall();
    await persistTranscript(duration);
  }, [callDuration, persistTranscript, stopCall]);

  const reconnectConversation = useCallback(async () => {
    setCallDuration(0);
    setSaveError(null);
    await reconnect(buildAssistantConfig());
  }, [buildAssistantConfig, reconnect]);

  return {
    isConfigured,
    status,
    isMuted,
    volumeLevel,
    error: error ?? saveError,
    transcriptLines,
    callDuration,
    isSaving,
    isConnected,
    isConnecting,
    isSpeaking,
    isListening,
    startConversation,
    endConversation,
    reconnectConversation,
    toggleMute,
  };
}
