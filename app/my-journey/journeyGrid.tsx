'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';

import type { VoiceConversationRecord } from '@/types/companion';

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function parseSearchTokens(raw: string) {
  const normalized = normalizeText(raw);
  if (!normalized) return { normalized, tokens: [] as string[] };

  const tokens = normalized
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  return { normalized, tokens };
}

function formatSessionDate(date: Date) {
  // Mirrors the existing UI approach (toLocaleString) but we also keep
  // smaller pieces for more intuitive matching.
  const localeDate = date.toLocaleDateString();
  const localeTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const full = date.toLocaleString();
  return { localeDate, localeTime, full };
}

function toTimeSearchCandidates(input: string) {
  // Input is already normalized.
  // We intentionally keep this forgiving: users may type “10”, “10:30”, “10am”, etc.
  // We generate a couple common variants and also match raw partials.
  const s = input.replace(/\s+/g, '');

  const candidates = new Set<string>();
  candidates.add(input);
  candidates.add(s);

  // If user types 10am / 10pm
  candidates.add(s.replace(/am$/i, ' am'));
  candidates.add(s.replace(/pm$/i, ' pm'));

  return Array.from(candidates);
}

export default function JourneyGrid({ sessions }: { sessions: VoiceConversationRecord[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return sessions;

    const { normalized, tokens } = parseSearchTokens(trimmed);

    // Date range search helpers
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const thisWeekStart = new Date(todayStart);
    // Start of week (Monday-like) for intuitive UX.
    const day = thisWeekStart.getDay(); // 0=Sun
    const diffToMonday = (day + 6) % 7;
    thisWeekStart.setDate(thisWeekStart.getDate() - diffToMonday);

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    const parsePossibleYMD = (value: string) => {
      // Accept: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
      const m1 = value.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (m1) {
        const y = Number(m1[1]);
        const mo = Number(m1[2]) - 1;
        const d = Number(m1[3]);
        const dt = new Date(y, mo, d);
        if (!Number.isNaN(dt.getTime())) return dt;
      }

      // Accept: DD/MM/YYYY or MM/DD/YYYY (best-effort)
      const m2 = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (m2) {
        const a = Number(m2[1]);
        const b = Number(m2[2]);
        const y = Number(m2[3]);
        // Try both interpretations: a/b and b/a.
        const dt1 = new Date(y, a - 1, b);
        const dt2 = new Date(y, b - 1, a);
        if (!Number.isNaN(dt1.getTime())) return dt1;
        if (!Number.isNaN(dt2.getTime())) return dt2;
      }

      return null;
    };

    const queryMonthYear = (value: string) => {
      // Accept: "june" or "july".
      const months: Record<string, number> = {
        january: 0,
        february: 1,
        march: 2,
        april: 3,
        may: 4,
        june: 5,
        july: 6,
        august: 7,
        september: 8,
        october: 9,
        november: 10,
        december: 11,
      };
      const m = Object.keys(months).find((k) => value.includes(k));
      if (!m) return null;
      return months[m];
    };

    const matches = (session: VoiceConversationRecord) => {
      const companion = session.companions;
      const companionName = companion?.name ?? '';
      const subject = companion?.subject ?? '';
      const topic = companion?.topic ?? '';

      const createdAt = new Date(session.created_at);
      const { localeDate, localeTime, full } = formatSessionDate(createdAt);

      const timeCandidates = toTimeSearchCandidates(normalized);

      const dateLower = localeDate.toLowerCase();
      const fullLower = full.toLowerCase();

      // Date matching (semantic words + formatted date partials)
      const tokenMatch = (haystack: string) => {
        const h = haystack.toLowerCase();
        // support partial matching across the entire query
        if (h.includes(normalized)) return true;

        // also support token-level matching
        return tokens.every((t) => h.includes(t));
      };

      const matchesCompanionOrSubject = () => {
        const h1 = companionName;
        const h2 = subject;
        const h3 = topic;
        return tokenMatch(h1) || tokenMatch(h2) || tokenMatch(h3);
      };

      const matchesDate = () => {
        if (normalized === 'today') {
          return createdAt >= todayStart && createdAt <= todayEnd;
        }
        if (normalized === 'yesterday') {
          return createdAt >= yesterdayStart && createdAt <= yesterdayEnd;
        }
        if (normalized === 'this week') {
          return createdAt >= thisWeekStart && createdAt <= thisWeekEnd;
        }

        const monthIndex = queryMonthYear(normalized);
        if (monthIndex !== null) {
          return createdAt.getMonth() === monthIndex;
        }

        // Year-only
        const yearOnly = normalized.match(/^\d{4}$/);
        if (yearOnly) {
          return createdAt.getFullYear() === Number(yearOnly[0]);
        }

        const parsed = parsePossibleYMD(normalized);
        if (parsed) {
          // Compare YYYY-MM-DD
          return (
            parsed.getFullYear() === createdAt.getFullYear() &&
            parsed.getMonth() === createdAt.getMonth() &&
            parsed.getDate() === createdAt.getDate()
          );
        }

        // Fallback: match against locale strings (partial matching)
        return fullLower.includes(normalized) || dateLower.includes(normalized) || tokenMatch(fullLower);
      };

      const matchesTime = () => {
        // If user types time-like values, match against time formatting.
        // We match partials to allow “10” to match “10:00 AM”.
        const timeLower = localeTime.toLowerCase();
        if (timeCandidates.some((c) => timeLower.includes(c))) return true;

        // Also allow token match
        return tokens.every((t) => timeLower.includes(t));
      };

      return matchesCompanionOrSubject() || matchesDate() || matchesTime();
    };

    return sessions.filter(matches);
  }, [query, sessions]);

  const hasSessions = filtered.length > 0;
  return (
    <div className="mt-8">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companion, topic, date, or time…"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-10 py-3 text-sm md:text-base shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-0"
        />

        {query.trim().length > 0 ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-700"
            aria-label="Clear search"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {!hasSessions ? (
        <div className="mt-10 rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-500">
            <Search className="h-6 w-6" />
          </div>
          <p className="mt-4 text-neutral-700 font-medium">No learning sessions matched your search.</p>
          <p className="mt-1 text-sm text-neutral-500">Try a different companion name, topic, date, or time.</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold"
          >
            Clear Search
          </button>

        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((session) => {
            const companion = session.companions;
            const companionName = companion?.name ?? 'Voice session';
            const subject = companion?.subject ?? 'General';
            const topic = companion?.topic ?? 'Session';
            const color = companion?.color ?? '#ffffff';
            const createdAt = new Date(session.created_at);
            const dateStr = createdAt.toLocaleDateString();
            const timeStr = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <article
                key={session.id}
                className="h-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-neutral-500 text-xs font-semibold">{subject}</div>
                    <h2 className="mt-1 text-lg font-semibold text-neutral-900 break-words">
                      {companionName}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600 break-words">
                      {topic}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-neutral-50 px-3 py-2">
                  <div className="text-sm text-neutral-700">
                    <span className="font-medium">{dateStr}</span>
                    <span className="text-neutral-400"> · </span>
                    <span>{timeStr}</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">Duration: {session.duration}s</div>
                </div>

                <div className="mt-auto pt-5">
                  {session.companion_id ? (
                    <Link
                      href={`/companions/${session.companion_id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Continue Learning
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

