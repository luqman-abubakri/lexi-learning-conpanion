import Link from 'next/link';
import CompanionCard from '@/app/components/CompanionCard';
import CompanionsToolbar from '@/app/components/CompanionsToolbar';
import { getCompanions } from '@/app/libs/actions/companions';
import type { CompanionSort, CompanionVisibility } from '@/types/companion';

interface CompanionsPageProps {
  searchParams: Promise<{
    q?: string;
    subject?: string;
    visibility?: string;
    sort?: string;
    mine?: string;
  }>;
}

export default async function CompanionsPage({ searchParams }: CompanionsPageProps) {
  const params = await searchParams;
  const sort = (['newest', 'oldest', 'name'].includes(params.sort ?? '')
    ? params.sort
    : 'newest') as CompanionSort;

  const visibility = (['public', 'private', 'all'].includes(params.visibility ?? '')
    ? params.visibility
    : 'all') as CompanionVisibility | 'all';

  const companions = await getCompanions({
    search: params.q,
    subject: params.subject,
    visibility,
    sort,
    mineOnly: params.mine === '1',
  });

  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            Companions
          </h1>
          <p className="mt-2 text-neutral-600">
            Browse, search, and launch your learning companions.
          </p>
        </div>
        <Link
          href="/companions/new"
          className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Create companion
        </Link>
      </div>

      <CompanionsToolbar
        initialSearch={params.q ?? ''}
        initialSubject={params.subject ?? ''}
        initialVisibility={visibility}
        initialSort={sort}
        initialMineOnly={params.mine === '1'}
      />

      {companions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center text-neutral-600">
          No companions match your filters.
        </div>
      ) : (
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              id={companion.id}
              name={companion.name}
              topic={companion.topic}
              subject={companion.subject}
              duration={companion.duration}
              color={companion.color}
            />
          ))}
        </section>
      )}
    </div>
  );
}
