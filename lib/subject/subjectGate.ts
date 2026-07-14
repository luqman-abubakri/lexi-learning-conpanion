export type SubjectGateDecision = {
  allowed: boolean;
  confidence: number;
};

export const buildOffTopicRefusal = (subject: string) => {
  const s = subject.trim();
  return `I'm your ${s} learning companion, so I can only help with ${s}. Please continue with a ${s}-related question.`;
};

