'use client';

import { useMemo } from 'react';

export function useTranscript(lines: string[], maxItems = 4) {
  const transcript = useMemo(() => lines.filter(Boolean), [lines]);
  const recentLines = useMemo(() => transcript.slice(-maxItems), [maxItems, transcript]);
  const fullText = useMemo(() => transcript.join('\n'), [transcript]);

  return {
    transcript,
    recentLines,
    fullText,
    isEmpty: transcript.length === 0,
  };
}

export function useWaveformBars(volumeLevel: number, isActive: boolean, count = 10) {
  return useMemo(() => {
    const base = [20, 40, 60, 80, 55, 35, 70, 90, 50, 30];

    return base.slice(0, count).map((height, index) => {
      if (!isActive) {
        return Math.max(12, height * 0.35);
      }

      const wave = Math.sin((index + volumeLevel * 10) * 0.8) * 25;
      return Math.min(100, Math.max(12, height + wave + volumeLevel * 40));
    });
  }, [count, isActive, volumeLevel]);
}
