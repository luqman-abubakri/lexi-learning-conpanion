'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { CompanionSort, CompanionVisibility } from '@/types/companion';

type CompanionsToolbarProps = {
  initialSearch: string;
  initialSubject: string;
  initialVisibility: CompanionVisibility | 'all';
  initialSort: CompanionSort;
  initialMineOnly: boolean;
};

export default function CompanionsToolbar({
  initialSearch,
  initialSubject,
  initialVisibility,
  initialSort,
  initialMineOnly,
}: CompanionsToolbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [subject, setSubject] = useState(initialSubject);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [sort, setSort] = useState(initialSort);
  const [mineOnly, setMineOnly] = useState(initialMineOnly);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('q', search.trim());
    if (subject.trim()) params.set('subject', subject.trim());
    if (visibility !== 'all') params.set('visibility', visibility);
    if (sort !== 'newest') params.set('sort', sort);
    if (mineOnly) params.set('mine', '1');

    startTransition(() => {
      const query = params.toString();
      router.push(query ? `/companions?${query}` : '/companions');
    });
  };

  const inputClassName =
    'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500';

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companions"
          aria-label="Search companions"
          className={inputClassName}
        />
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Filter by subject"
          aria-label="Filter by subject"
          className={inputClassName}
        />
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as CompanionVisibility | 'all')}
          aria-label="Filter by visibility"
          className={inputClassName}
        >
          <option value="all">All visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as CompanionSort)}
          aria-label="Sort companions"
          className={inputClassName}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          My companions only
        </label>
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={applyFilters}
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isPending ? 'Applying…' : 'Apply filters'}
        </button>
      </div>
    </div>
  );
}
