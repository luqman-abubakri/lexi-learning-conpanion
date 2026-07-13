'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { VAPI_PUBLIC_KEY, isVapiConfigured } from '@/lib/vapi';

export type VapiCallStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'speaking'
  | 'listening'
  | 'ended'
  | 'error';

export function useVapi() {
  const vapiRef = useRef<Vapi | null>(null);
  const [isConfigured] = useState(() => isVapiConfigured());
  const [status, setStatus] = useState<VapiCallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);

  useEffect(() => {
    if (!isConfigured || vapiRef.current) return;

    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      setStatus('connected');
      setError(null);
      setTranscriptLines([]);
    });

    vapi.on('call-end', () => {
      setStatus('ended');
      setVolumeLevel(0);
    });

    vapi.on('speech-start', () => {
      setStatus('speaking');
    });

    vapi.on('speech-end', () => {
      setStatus('listening');
    });

    vapi.on('volume-level', (level: number) => {
      setVolumeLevel(level);
      if (level > 0.05) {
        setStatus((current) => (current === 'speaking' ? current : 'listening'));
      }
    });

    vapi.on('message', (message: { type?: string; transcript?: string }) => {
      if (message?.type === 'transcript' && message.transcript) {
        setTranscriptLines((prev) => [...prev, message.transcript as string]);
      }
    });

    vapi.on('error', (event: { message?: string }) => {
      setError(event?.message || 'Voice connection error');
      setStatus('error');
    });

    return () => {
      vapi.stop();
      vapiRef.current = null;
    };
  }, [isConfigured]);

  const startCall = useCallback(async (assistantConfig: Parameters<Vapi['start']>[0]) => {
    if (!vapiRef.current) {
      throw new Error('Voice client is not ready yet.');
    }

    if (!isConfigured) {
      throw new Error('Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to enable voice conversations.');
    }

    setError(null);
    setStatus('connecting');
    await vapiRef.current.start(assistantConfig);
    setStatus('connected');
  }, [isConfigured]);

  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
    setStatus('ended');
    setVolumeLevel(0);
  }, []);

  const reconnect = useCallback(async (assistantConfig: Parameters<Vapi['start']>[0]) => {
    stopCall();
    await startCall(assistantConfig);
  }, [startCall, stopCall]);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return false;
    const nextValue = !isMuted;
    vapiRef.current.setMuted(nextValue);
    setIsMuted(nextValue);
    return nextValue;
  }, [isMuted]);

  return {
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
    isConnected: status === 'connected' || status === 'speaking' || status === 'listening',
    isConnecting: status === 'connecting',
    isSpeaking: status === 'speaking',
    isListening: status === 'listening' || status === 'connected',
  };
}
