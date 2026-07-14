'use client';

import Vapi from '@vapi-ai/web';
import { VAPI_PUBLIC_KEY, isVapiConfigured } from '@/lib/vapi';
import type { CompanionRecord } from '@/types/companion';


export type VoiceConnectionState =
  | 'idle'
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'connection_lost'
  | 'ended'
  | 'error'
  | 'ending';

export type VoiceControllerState = {
  isConfigured: boolean;
  connectionState: VoiceConnectionState;
  isMuted: boolean;
  volumeLevel: number;
  error: string | null;
  transcriptLineBuffer: string[];
  activeCallId: string | null;
  isOnline: boolean;
  isVisible: boolean;
};

type Subscriber = (state: VoiceControllerState) => void;

const DEFAULT_STATE: VoiceControllerState = {
  isConfigured: isVapiConfigured(),
  connectionState: 'idle',
  isMuted: false,
  volumeLevel: 0,
  error: null,
  transcriptLineBuffer: [],
  activeCallId: null,
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  isVisible: typeof document === 'undefined' ? true : !document.hidden,
};

let vapiSingleton: Vapi | null = null;
let hasRegisteredVapiListeners = false;

let controllerState: VoiceControllerState = { ...DEFAULT_STATE };
const subscribers = new Set<Subscriber>();


let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempt = 0;
let reconnectInFlight = false;

let onlineHandlerInstalled = false;
let visibilityHandlerInstalled = false;

let micPermissionRevoked = false;

const MAX_RETRIES = 5; // 1,2,4,8,16 => 5 attempts
const BASE_DELAY_SECONDS = 1;

function notifySubscribers() {
  for (const cb of subscribers) cb({ ...controllerState });
}

function setState(patch: Partial<VoiceControllerState>) {
  controllerState = { ...controllerState, ...patch };
  notifySubscribers();
}

function ensureVapi() {
  if (!controllerState.isConfigured) return null;
  if (vapiSingleton) return vapiSingleton;
  vapiSingleton = new Vapi(VAPI_PUBLIC_KEY);
  return vapiSingleton;
}

function computeReconnectDelaySeconds(attempt: number) {
  // attempt: 0 => 1s, 1 => 2s ...
  return Math.min(16, BASE_DELAY_SECONDS * Math.pow(2, attempt));
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function resetReconnectController() {
  reconnectAttempt = 0;
  reconnectInFlight = false;
  clearReconnectTimer();
}

function canAttemptReconnect() {
  if (!controllerState.isOnline) return false;
  if (!controllerState.isVisible) return false;
  if (reconnectInFlight) return false;
  if (reconnectAttempt >= MAX_RETRIES) return false;
  return true;
}

async function tryReconnect(assistantConfig: Parameters<Vapi['start']>[0]) {
  if (!canAttemptReconnect()) return;
  reconnectInFlight = true;

  const delaySeconds = computeReconnectDelaySeconds(reconnectAttempt);

  reconnectAttempt += 1;

  clearReconnectTimer();
  setState({ connectionState: 'reconnecting', error: null });

  reconnectTimer = setTimeout(async () => {
    try {
      const vapi = ensureVapi();
      if (!vapi) return;

      // Starting again should resume streaming; we keep controller transcript buffer.
      await vapi.start(assistantConfig);
      // If it succeeds, Vapi should emit call-start.
      // Fallback in case it doesn't:
      if (controllerState.connectionState !== 'connected') {
        setState({ connectionState: 'connected' });
      }
      resetReconnectController();

    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to reconnect';
      setState({ connectionState: 'connection_lost', error: msg });
      reconnectInFlight = false;
      if (reconnectAttempt < MAX_RETRIES) {
        // allow next attempt to be scheduled via error handler
        reconnectInFlight = false;
      }
    }
  }, delaySeconds * 1000);
}

function registerVapiListenersOnce() {
  if (!vapiSingleton) return;
  if (hasRegisteredVapiListeners) return;
  hasRegisteredVapiListeners = true;

  vapiSingleton.on('call-start', () => {
    // reset reconnect attempts on successful call
    resetReconnectController();

    setState({
      connectionState: 'connected',
      error: null,
    });
  });


  vapiSingleton.on('call-end', () => {

    resetReconnectController();
    setState({ connectionState: 'ended', error: null, activeCallId: null, volumeLevel: 0 });
  });


  vapiSingleton.on('speech-start', () => {
    setState({ connectionState: 'connected', error: controllerState.error });
  });

  vapiSingleton.on('speech-end', () => {
    setState({ connectionState: 'connected', error: controllerState.error });
  });

  vapiSingleton.on('volume-level', (level: number) => {
    setState({ volumeLevel: level });
  });

  vapiSingleton.on('message', (message: { type?: string; transcript?: string }) => {
    if (message?.type === 'transcript' && message.transcript) {
      setState({ transcriptLineBuffer: [...controllerState.transcriptLineBuffer, message.transcript as string] });
    }
  });

  vapiSingleton.on('error', (event: { message?: string } = {}) => {
    const msg = event?.message || 'Voice connection error';
    setState({ connectionState: 'connection_lost', error: msg });
    // mic permission revoked isn't standardized; handle best-effort by message matching.
    if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('microphone')) {
      micPermissionRevoked = true;
    }

    // Reconnect scheduling is driven by the controller's last known assistantConfig.
    // We'll rely on start() to have set lastAssistantConfig.
    scheduleReconnectFromLastConfig();
  });

}


let lastAssistantConfig: Parameters<Vapi['start']>[0] | null = null;

function scheduleReconnectFromLastConfig() {
  if (!lastAssistantConfig) return;
  void tryReconnect(lastAssistantConfig);
}

function ensureNetworkAndVisibilityHandlers() {
  if (onlineHandlerInstalled === false && typeof window !== 'undefined') {
    onlineHandlerInstalled = true;
    window.addEventListener('online', () => {
      setState({ isOnline: true });
      scheduleReconnectFromLastConfig();
    });
    window.addEventListener('offline', () => {
      setState({ isOnline: false, connectionState: 'disconnected' });
      clearReconnectTimer();
      reconnectInFlight = false;
    });
  }

  if (visibilityHandlerInstalled === false && typeof document !== 'undefined') {
    visibilityHandlerInstalled = true;
    document.addEventListener('visibilitychange', () => {
      const isVisible = !document.hidden;
      setState({ isVisible });
      if (isVisible) scheduleReconnectFromLastConfig();
      else clearReconnectTimer();
    });
  }
}

export function subscribeVoiceController(cb: Subscriber) {
  subscribers.add(cb);
  cb({ ...controllerState });

  ensureNetworkAndVisibilityHandlers();
  const vapi = ensureVapi();
  if (vapi) registerVapiListenersOnce();

  return () => {
    subscribers.delete(cb);
    // Keep singleton alive; do not destroy automatically here to avoid losing call.
  };
}

export function getVoiceControllerState(): VoiceControllerState {
  return { ...controllerState };
}

export function startVoiceCall(assistantConfig: Parameters<Vapi['start']>[0]) {
  if (!controllerState.isConfigured) {
    throw new Error('Voice client is not configured (missing NEXT_PUBLIC_VAPI_PUBLIC_KEY).');
  }
  lastAssistantConfig = assistantConfig;
  const vapi = ensureVapi();
  if (!vapi) throw new Error('Voice client not ready');

  ensureNetworkAndVisibilityHandlers();
  registerVapiListenersOnce();

  // Starting a new call should clear ended state + reset transcript buffer.
  micPermissionRevoked = false;
  setState({ connectionState: 'connecting', error: null, transcriptLineBuffer: [] });

  return vapi.start(assistantConfig);
}

export function stopVoiceCall() {
  const vapi = vapiSingleton;
  if (!vapi) return;
  setState({ connectionState: 'ending' });

  clearReconnectTimer();
  resetReconnectController();

  vapi.stop();
  setState({ connectionState: 'ended', activeCallId: null, volumeLevel: 0 });
}

export function setMuted(nextMuted: boolean) {
  const vapi = vapiSingleton;
  if (!vapi) return;
  vapi.setMuted(nextMuted);
  setState({ isMuted: nextMuted });
}

export function toggleMuted() {
  const next = !controllerState.isMuted;
  setMuted(next);
  return next;
}

export function getMicPermissionRevoked() {
  return micPermissionRevoked;
}

export function resetMicPermissionRevoked() {
  micPermissionRevoked = false;
}

export function destroyVoiceController() {
  clearReconnectTimer();
  resetReconnectController();
  subscribers.clear();

  if (vapiSingleton) {
    try {
      vapiSingleton.stop();
    } catch {
      // ignore
    }
  }

  vapiSingleton = null;
  hasRegisteredVapiListeners = false;
  controllerState = { ...DEFAULT_STATE };
  notifySubscribers();
}

// Helper to build assistant config (used by UI/hooks)
export function buildAssistantConfig(_companion: CompanionRecord) {
  // Kept for compatibility; real assistant config is built by useVoiceSession.
  // Intentionally not using the parameter.
  return {};
}



