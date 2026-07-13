'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createCompanion } from '@/app/libs/actions/companions';

const companionFormSchema = z.object({
  name: z.string().min(2, 'Companion name must be at least 2 characters'),
  subject: z.string().min(2, 'Subject is required'),
  topic: z.string().optional(),
  description: z.string().min(20, 'Please describe how the companion helps with at least 20 characters'),
  voice: z.enum(['male', 'female'], {
    message: 'Please select a voice',
  }),
  style: z.enum(['formal', 'casual'], {
    message: 'Please select a style',
  }),
  duration: z.coerce.number().int().min(1, 'Duration must be at least 1 minute'),
  visibility: z.enum(['public', 'private']),
});

type CompanionFormData = z.infer<typeof companionFormSchema>;
type CompanionFormErrors = Partial<Record<keyof CompanionFormData, string>>;

const initialForm: CompanionFormData = {
  name: '',
  subject: '',
  topic: '',
  description: '',
  voice: 'female',
  style: 'casual',
  duration: 30,
  visibility: 'private',
};

const inputClassName =
  'flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2';

const CompanionForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CompanionFormData>(initialForm);
  const [errors, setErrors] = useState<CompanionFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof CompanionFormData]: value as never }));
    setErrors((prev) => ({ ...prev, [name as keyof CompanionFormData]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = companionFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const nextErrors: CompanionFormErrors = {};

      (Object.keys(fieldErrors) as Array<keyof CompanionFormData>).forEach((key) => {
        const message = fieldErrors[key]?.[0];
        if (message) nextErrors[key] = message;
      });

      setErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      try {
        const companion = await createCompanion({
          ...result.data,
          topic: result.data.topic || result.data.subject,
        });
        router.push(`/companions/${companion.id}`);
        router.refresh();
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to create companion');
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-neutral-700">
            Companion name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Maya"
            className={inputClassName}
          />
          {errors.name ? <p className="text-sm text-red-500">{errors.name}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-neutral-700">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Mathematics"
            className={inputClassName}
          />
          {errors.subject ? <p className="text-sm text-red-500">{errors.subject}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="topic" className="text-sm font-medium text-neutral-700">
          Topic
        </label>
        <input
          id="topic"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="e.g. Algebra Basics"
          className={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-neutral-700">
          What should the companion help with?
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the companion's role and support style"
          rows={4}
          className={`${inputClassName} min-h-[120px] resize-y`}
        />
        {errors.description ? <p className="text-sm text-red-500">{errors.description}</p> : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="voice" className="text-sm font-medium text-neutral-700">
            Voice
          </label>
          <select
            id="voice"
            name="voice"
            value={formData.voice}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.voice ? <p className="text-sm text-red-500">{errors.voice}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="style" className="text-sm font-medium text-neutral-700">
            Style
          </label>
          <select
            id="style"
            name="style"
            value={formData.style}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
          {errors.style ? <p className="text-sm text-red-500">{errors.style}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium text-neutral-700">
            Duration (minutes)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            min="1"
            step="1"
            value={formData.duration}
            onChange={handleChange}
            className={inputClassName}
          />
          {errors.duration ? <p className="text-sm text-red-500">{errors.duration}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="visibility" className="text-sm font-medium text-neutral-700">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          {isPending ? 'Creating your companion…' : 'Fill in the details to create your companion.'}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? 'Creating…' : 'Create companion'}
        </button>
      </div>

      {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
    </form>
  );
};

export default CompanionForm;
