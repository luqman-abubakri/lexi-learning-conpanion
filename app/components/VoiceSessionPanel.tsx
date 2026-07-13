'use client';

import { Mic, MicOff, Radio, PhoneOff, RotateCw, Loader2, Brain, Sparkles, Volume2 } from 'lucide-react';
import type { CompanionRecord } from '@/types/companion';
import { useVoiceSession } from '@/hooks/useVoiceSession';
import { useTranscript, useWaveformBars } from '@/hooks/useTranscript';

interface VoiceSessionPanelProps {
  companion: CompanionRecord;
}

export default function VoiceSessionPanel({ companion }: VoiceSessionPanelProps) {
  const {
    isConfigured,
    status,
    isMuted,
    volumeLevel,
    error,
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
  } = useVoiceSession(companion);

  const { recentLines, isEmpty } = useTranscript(transcriptLines);
  const waveformBars = useWaveformBars(volumeLevel, isConnected);

  const connectionLabel = !isConfigured
    ? 'Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to enable voice'
    : isConnecting
      ? 'Connecting…'
      : isConnected
        ? 'Live voice session'
        : status === 'ended'
          ? 'Call ended'
          : 'Ready to speak';

  const statusLabel = isSpeaking
    ? 'Companion is speaking'
    : isListening
      ? 'Listening for you'
      : isConnecting
        ? 'Connecting…'
        : isConnected
          ? 'Connected'
          : status === 'ended'
            ? 'Call ended'
            : 'Ready to connect';

  return (
    <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Voice companion</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">Speak naturally with {companion.name}</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">{companion.description}</p>
        </div>
        <div className="rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-700">
          {connectionLabel}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isConnected ? 'bg-emerald-600 text-white' : 'bg-neutral-900 text-white'
                }`}
              >
                {isSpeaking ? <Volume2 className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-900">
                  {isConnected ? 'Live conversation' : 'Ready when you are'}
                </div>
                <div className="text-sm text-neutral-500">{statusLabel}</div>
              </div>
            </div>
            <div className="text-right text-sm text-neutral-500">
              <div className="font-semibold text-neutral-900">{callDuration}s</div>
              <div>call timer</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void startConversation()}
              disabled={isConnecting || isConnected || !isConfigured}
              aria-label="Start conversation"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              {isConnected ? 'Connected' : 'Start conversation'}
            </button>
            <button
              onClick={() => void endConversation()}
              disabled={!isConnected && !isSaving}
              aria-label="End call"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
            >
              <PhoneOff className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'End call'}
            </button>
            <button
              onClick={toggleMute}
              disabled={!isConnected}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={() => void reconnectConversation()}
              disabled={isConnecting || !isConfigured}
              aria-label="Reconnect call"
              className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:opacity-60"
            >
              <RotateCw className="h-4 w-4" />
              Reconnect
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
            <div className="text-sm text-neutral-600">{isConnected ? 'Connected and listening' : 'Idle'}</div>
            <div className="ml-auto flex items-center gap-2 text-sm text-neutral-500">
              <Brain className="h-4 w-4" />
              <span>{isSpeaking ? 'Speaking' : isConnecting ? 'Connecting' : isListening ? 'Listening' : 'Ready'}</span>
            </div>
          </div>

          <div className="mt-6 h-24 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-100 via-white to-sky-100 p-4">
            <div className="flex h-full items-end gap-2" aria-hidden="true">
              {waveformBars.map((height, index) => (
                <div
                  key={index}
                  className={`w-2 rounded-full bg-emerald-500 transition-all duration-150 ${
                    isConnected ? 'opacity-100' : 'opacity-50'
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-neutral-950 p-5 text-white shadow-inner">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Live transcript
          </div>
          <div className="mt-4 space-y-3 text-sm text-neutral-300">
            {isEmpty ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-neutral-400">
                Your conversation transcript will appear here as the call progresses.
              </div>
            ) : (
              recentLines.map((entry, index) => (
                <div key={`${entry}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  {entry}
                </div>
              ))
            )}
          </div>
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
