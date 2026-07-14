import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CompanionCard from './components/CompanionCard';
import CompanionList from './components/CompanionList';
import CTA from './components/CTA';
import { getPopularCompanions } from './libs/actions/companions';
import { getRecentVoiceConversations } from './libs/actions/voice';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: {
    default: 'Lexi – AI Voice Study Companion',
    template: '%s | Lexi',
  },
  description:
    'Learn faster with Lexi, an AI-powered voice study companion. Practice concepts, ask questions naturally, and improve your learning with personalized AI conversations.',
  openGraph: {
    type: 'website',
    url: 'https://lexi-ai.vercel.app/',
    title: 'Lexi – AI Voice Study Companion',
    description:
      'Talk naturally with an AI tutor that helps you study smarter, practice concepts, and learn faster.',
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
    title: 'Lexi – AI Voice Study Companion',
    description: 'Your intelligent AI study companion powered by voice.',
    images: ['/og-image.png'],
  },
};

export default async function HomePage() {
  const [companions, recentSessions] = await Promise.all([
    getPopularCompanions(6),
    getRecentVoiceConversations(8),
  ]);

  const sessionItems = recentSessions.map((session) => ({
    id: session.id,
    name: session.companions?.name ?? 'Voice session',
    subject: session.companions?.subject ?? 'General',
    topic:
      (session.companions?.topic ?? session.transcript.slice(0, 80)) ||
      'Completed session',
    duration: Math.max(1, Math.round(session.duration / 60)),
    color: session.companions?.color ?? '#059669',
  }));

  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-neutral-900">
          Popular Companions
        </h1>

        <Link
          href="/companions"
          className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.99]"
        >
          View More
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <section className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {companions.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-600">
            No companions yet. Create your first learning companion to get started.
          </div>
        ) : (
          companions.slice(0, 3).map((companion) => (
            <CompanionCard
              key={companion.id}
              id={companion.id}
              name={companion.name}
              topic={companion.topic}
              subject={companion.subject}
              duration={companion.duration}
              color={companion.color}
            />
          ))
        )}

        {companions.length > 0 ? (
          <div className="sm:hidden absolute bottom-0 right-0">
            <Link
              href="/companions"
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.99]"
            >
              View More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </section>


      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-neutral-100">
        <div className="min-h-0">
          <CompanionList
            title="Recent Completed Sessions"
            classNames="w-full"
            companions={sessionItems}
          />
        </div>
        <div className="min-h-0">
          <CTA />
        </div>
      </section>
    </div>
  );
}

