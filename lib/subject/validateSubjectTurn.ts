import type { SubjectGateDecision } from './subjectGate';

export async function validateSubjectTurn(params: {
  endpointUrl: string;
  companionSubject: string;
  companionTopic?: string;
  text: string;
}): Promise<SubjectGateDecision> {
  const res = await fetch(params.endpointUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      companionSubject: params.companionSubject,
      companionTopic: params.companionTopic,
      text: params.text,
    }),
  });

  if (!res.ok) {
    return { allowed: false, confidence: 0.9 };
  }

  const data = (await res.json()) as SubjectGateDecision;
  if (typeof data?.allowed !== 'boolean' || typeof data?.confidence !== 'number') {
    return { allowed: false, confidence: 0.9 };
  }
  return data;
}

