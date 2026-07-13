import { cn } from "@/lib/utils";


interface CompanionListProps {
  title: string;
  companions?: Array<{
    id: string;
    name?: string;
    subject: string;
    topic: string;
    duration: number;
    color?: string;
    bookmark?: boolean;
  }>;
  classNames?: string;
}


const CompanionList = ({ title, companions, classNames }: CompanionListProps) => {
  const sessions = companions ?? [];


  return (
    <article className={cn("rounded-2xl", classNames)}>
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">{title}</h2>

        <div className="mt-4">
          {sessions.length === 0 ? (
            <div className="text-sm text-neutral-600">No sessions yet.</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 truncate">{c.name ?? c.topic}</div>
                      <div className="text-sm text-neutral-700 truncate">{c.topic}</div>
                    </div>

                    <div className="shrink-0 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                      {c.duration} mins
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">Subject: {c.subject}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CompanionList;
