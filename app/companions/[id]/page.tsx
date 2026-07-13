import { notFound } from 'next/navigation';
import VoiceSessionPanel from '@/app/components/VoiceSessionPanel';
import { getCompanionById } from '@/app/libs/actions/companions';

interface CompanionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanionDetailPage({ params }: CompanionDetailPageProps) {
  const { id } = await params;
  const companion = await getCompanionById(id);

  if (!companion) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-8 lg:px-12">
      <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Companion profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-900">{companion.name}</h1>
        <p className="mt-3 max-w-3xl text-base text-neutral-600">{companion.description}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-neutral-700">
          <span className="rounded-full bg-neutral-100 px-3 py-1">Subject: {companion.subject}</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">Topic: {companion.topic}</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">Style: {companion.style}</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">Suggested duration: {companion.duration} mins</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 capitalize">Visibility: {companion.visibility}</span>
        </div>
      </section>

      <VoiceSessionPanel companion={companion} />
    </main>
  );
}
