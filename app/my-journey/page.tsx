import Link from 'next/link';
import type { Metadata } from 'next';
import { getVoiceConversationsForJourney } from '@/app/libs/actions/voice';
import JourneyGrid from './journeyGrid';


export const metadata: Metadata = {
  title: {
    default: 'My Journey | Lexi',
    template: '%s | Lexi',
  },
  description: 'View your voice learning sessions and review your progress over time.',
  openGraph: {
    type: 'website',
    title: 'My Journey | Lexi',
    description: 'View your voice learning sessions and review your progress over time.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lexi AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Journey | Lexi',
    description: 'View your voice learning sessions and review your progress over time.',
    images: ['/og-image.png'],
  },
};

export default async function MyJourneyPage() {
  const sessions = await getVoiceConversationsForJourney();

  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
        My Journey
      </h1>
      <p className="mt-2 text-neutral-600">Your voice learning sessions.</p>

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
        // Client-side filtering/searching is handled inside the grid component.
        <JourneyGrid sessions={sessions} />
      )}

    </div>
  );
}

