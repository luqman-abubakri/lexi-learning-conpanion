import { NextResponse } from 'next/server';

type Subject = string;

type ClassifyRequest = {
  companionSubject: Subject;
  companionTopic?: string;
  text: string;
};

type ClassifyResponse =
  | { allowed: true; confidence: number }
  | { allowed: false; confidence: number };



function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s\-\'\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Lightweight semantic-ish gate using:
// - subject-specific keyword sets
// - rejection cues for roleplay/prompt-injection requests
// This is intentionally conservative and deterministic (no external calls).
function classifyByHeuristics({ companionSubject, companionTopic, text }: ClassifyRequest): ClassifyResponse {
  const subject = normalize(companionSubject);
  const topic = normalize(companionTopic ?? '');
  const t = normalize(text);

  const injectionCues = [
    'ignore previous instructions',
    'you are now',
    'developer mode',
    'jailbreak',
    'override',
    'forget your role',
    'pretend',
    'repeat your system prompt',
    'hidden instructions',
    'act as',
    'permission',
    'owner',
    'what are you',
    'answer this anyway',
  ];

  if (injectionCues.some((cue) => t.includes(normalize(cue)))) {
    return { allowed: false, confidence: 0.99 };
  }

  // Broadly allow educational/learning requests.
  // If the subject is unknown, default to deny.
  if (!subject) return { allowed: false, confidence: 0.9 };

  const SUBJECT_KEYWORDS: Record<string, { allow: string[]; deny?: string[] }> = {
    math: {
      allow: [
        'derivative',
        'integration',
        'integral',
        'limit',
        'equation',
        'solve',
        'polynomial',
        'algebra',
        'geometry',
        'vector',
        'matrix',
        'probability',
        'statistics',
        'logarithm',
        'log',
        'trigonometry',
        'sine',
        'cosine',
        'tangent',
        'hypothesis',
        'number',
        'function',
        'x',
        'y',
        'graph',
        'inequality',
      ],
      deny: [
        'president',
        'capital of',
        'election',
        'politics',
        'war',
        'government',
        'champions league',
        'football',
        'movie',
        'actor',
        'book review',
        'shakespeare',
      ],
    },
    english: {
      allow: [
        'metaphor',
        'simile',
        'noun',
        'adjective',
        'verb',
        'adverb',
        'sentence',
        'paragraph',
        'grammar',
        'syntax',
        'theme',
        'character',
        'plot',
        'literature',
        'tone',
        'imagery',
      ],
      deny: ['solve', 'equation', 'derivative', 'integral', 'mitosis', 'atom', 'cell'],
    },
    biology: {
      allow: [
        'mitosis',
        'meiosis',
        'cell',
        'cells',
        'dna',
        'rna',
        'protein',
        'enzyme',
        'organ',
        'ecosystem',
        'photosynthesis',
        'respiration',
        'genetics',
      ],
      deny: ['president', 'capital', 'politics', 'football', 'movie', 'shakespeare', 'noun', 'adjective', 'solve equation'],
    },
  };

  const key = subject.includes('math') ? 'math' : subject.includes('english') ? 'english' : subject.includes('biology') ? 'biology' : subject;
  const rules = SUBJECT_KEYWORDS[key];

  if (!rules) {
    // Unknown subject; be safe.
    return { allowed: false, confidence: 0.85 };
  }

  if (rules.deny && rules.deny.some((d) => t.includes(normalize(d)))) {
    return { allowed: false, confidence: 0.95 };
  }

  const allowHits = rules.allow.filter((a) => t.includes(normalize(a))).length;
  const topicBoost = topic && t.includes(topic) ? 1 : 0;

  // Confidence heuristic: require at least 1 allow hit for allow.
  const confidence = Math.min(0.99, 0.5 + allowHits * 0.12 + topicBoost * 0.2);

  if (allowHits >= 1) {
    return { allowed: true, confidence };
  }

  // If question explicitly asks for a general definition within the subject name, allow.
  if (t.includes(subject)) {
    return { allowed: true, confidence: 0.7 };
  }

  return { allowed: false, confidence: 0.8 };
}

export async function POST(req: Request) {
  let body: ClassifyRequest;
  try {
    body = (await req.json()) as ClassifyRequest;
  } catch {
    return NextResponse.json({ allowed: false, confidence: 0.9 } satisfies ClassifyResponse, { status: 400 });
  }

  const text = (body?.text ?? '').trim();
  if (!text) {
    return NextResponse.json({ allowed: false, confidence: 0.9 } satisfies ClassifyResponse, { status: 400 });
  }

  const companionSubject = (body?.companionSubject ?? '').trim();
  if (!companionSubject) {
    return NextResponse.json({ allowed: false, confidence: 0.9 } satisfies ClassifyResponse, { status: 400 });
  }

  const result = classifyByHeuristics({
    companionSubject,
    companionTopic: body?.companionTopic,
    text,
  });

  return NextResponse.json(result satisfies ClassifyResponse);
}

