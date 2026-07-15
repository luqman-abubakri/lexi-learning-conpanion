"use client";

import { useEffect, useRef, useState } from "react";

type SWUpdateStatus = "idle" | "installed";

function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return online;
}

function InstallBanner() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (dismissed) return;

    const handler = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      e.preventDefault();
      deferredPromptRef.current = evt;
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, [dismissed]);

  const onInstall = async () => {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent) return;

    promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    deferredPromptRef.current = null;
    setCanInstall(false);

    if (choice && choice.outcome === "accepted") {
      setDismissed(true);
    }
  };

  const onDismiss = () => {
    setDismissed(true);
    setCanInstall(false);
  };

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] flex items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-neutral-900">Install Lexi</div>
        <div className="text-xs text-neutral-600">Access your AI companion directly from your home screen.</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.99]"
          onClick={onInstall}
        >
          Install
        </button>
        <button
          className="rounded-xl bg-neutral-900/5 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-900/10 active:scale-[0.99]"
          onClick={onDismiss}
          aria-label="Dismiss install prompt"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

function OnlineOfflineBanners() {
  const online = useOnlineStatus();
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    if (!online) return;

    setShowOnlineToast(true);

    const t = window.setTimeout(() => setShowOnlineToast(false), 3000);
    return () => window.clearTimeout(t);
  }, [online]);

  if (!online) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] rounded-2xl bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
        🔴 You're offline.
      </div>
    );
  }

  if (!showOnlineToast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
      🟢 Back online.
    </div>
  );
}

function ServiceWorkerRegistration() {
  const [swSupported, setSwSupported] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<SWUpdateStatus>("idle");

  useEffect(() => {
    const supported = typeof window !== "undefined" && "serviceWorker" in navigator;
    setSwSupported(supported);
    if (!supported) return;

    let isMounted = true;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        if (!isMounted) return;

        navigator.serviceWorker.addEventListener("message", (event) => {
          if (!event?.data) return;
          if (event.data.type === "LEXI_SW_UPDATED") {
            setUpdateStatus("installed");
          }
        });

        // Detect updates (best-effort)
        navigator.serviceWorker.ready.then((reg) => {
          reg.update();
        });

        // Listen for controller change to refresh instantly.
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      })
      .catch(() => {
        // ignore
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = async () => {
    if (!navigator.serviceWorker) return;
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg?.update();
    } catch {
      // ignore
    }
    // Force reload so the new SW takes effect.
    window.location.reload();
  };

  if (!swSupported) return null;
  if (updateStatus !== "installed") return null;

  return (
    <div className="fixed bottom-4 left-4 z-[70] w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-900">A new version of Lexi is available.</div>
          <div className="text-xs text-neutral-600">Refresh to update.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.99]"
            onClick={onRefresh}
          >
            Refresh
          </button>
          <button
            className="rounded-xl bg-neutral-900/5 px-3 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-900/10 active:scale-[0.99]"
            onClick={() => setUpdateStatus("idle")}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PwaClient() {
  return (
    <>
      <OnlineOfflineBanners />
      <InstallBanner />
      <ServiceWorkerRegistration />
    </>
  );
}

