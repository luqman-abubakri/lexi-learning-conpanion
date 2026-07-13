import { History } from "lucide-react";
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
            <div className="relative rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-8">
              <div
                className="flex flex-col items-center justify-center gap-4 text-center animate-[fadeIn_260ms_ease-out]"
                style={{ minHeight: 160 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600/10 ring-1 ring-emerald-600/15">
                  <History className="h-7 w-7 text-emerald-700" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">
                    No recent sessions
                  </h3>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-neutral-600">
                    Start a conversation with one of your AI companions to see your learning sessions here.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-neutral-900">{c.name ?? c.topic}</div>
                      <div className="truncate text-sm text-neutral-700">{c.topic}</div>
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

