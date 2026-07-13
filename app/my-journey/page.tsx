import Link from 'next/link';
import { getVoiceConversationsForJourney } from '@/app/libs/actions/voice';

export default async function MyJourneyPage() {
  const sessions = await getVoiceConversationsForJourney();

  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
        My Journey
      </h1>
      <p className="mt-2 text-neutral-600">
        Your voice learning sessions and transcripts.
      </p>

      {sessions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center">
          <p className="text-neutral-600">No voice sessions yet.</p>
          <Link
            href="/companions"
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Browse companions
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900">
                    {session.companions?.name ?? 'Voice session'}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {session.companions?.subject ?? 'General'} · {session.companions?.topic ?? 'Session'}
                  </p>
                </div>
                <div className="text-sm text-neutral-500">
                  {new Date(session.created_at).toLocaleString()} · {session.duration}s
                </div>
              </div>
              {session.companion_id ? (
                <Link
                  href={`/companions/${session.companion_id}`}
                  className="mt-3 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Open companion
                </Link>
              ) : null}
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                {session.transcript || 'No transcript captured for this session.'}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
