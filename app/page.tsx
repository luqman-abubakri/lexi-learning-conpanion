import CompanionCard from './components/CompanionCard';
import CompanionList from './components/CompanionList';
import CTA from './components/CTA';
import { getPopularCompanions } from './libs/actions/companions';
import { getRecentVoiceConversations } from './libs/actions/voice';

export default async function HomePage() {
  const [companions, recentSessions] = await Promise.all([
    getPopularCompanions(6),
    getRecentVoiceConversations(8),
  ]);

  const sessionItems = recentSessions.map((session) => ({
    id: session.id,
    name: session.companions?.name ?? 'Voice session',
    subject: session.companions?.subject ?? 'General',
    topic: (session.companions?.topic ?? session.transcript.slice(0, 80)) || 'Completed session',
    duration: Math.max(1, Math.round(session.duration / 60)),
    color: session.companions?.color ?? '#059669',
  }));

  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-neutral-900">
        Popular Companions
      </h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {companions.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-600">
            No companions yet. Create your first learning companion to get started.
          </div>
        ) : (
          companions.map((companion) => (
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
