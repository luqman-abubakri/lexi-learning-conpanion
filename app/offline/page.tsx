export default function OfflinePage() {
  return (
    <main>
      {/* Render a lightweight offline shell (PWA requirement). */}
      {/* Using the same styling as public/offline.html via iframe-less approach would require CSS duplication,
          so we keep it minimal and consistent with branding here. */}
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div
          className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-gradient-to-b from-emerald-600/10 to-white p-6 shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600/15 flex items-center justify-center text-2xl">
              📡
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">You're offline</h1>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                Some features require an internet connection.
                <br />
                Please reconnect and try again.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.99]"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.reload();
              }}
            >
              Retry
            </button>
            <button
              className="rounded-xl bg-neutral-900/5 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-900/10 active:scale-[0.99]"
              onClick={() => {
                if (typeof window !== 'undefined') window.history.back();
              }}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

