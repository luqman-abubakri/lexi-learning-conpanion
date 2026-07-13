import React from 'react';
import type { Metadata } from 'next';
import CompanionForm from '@/app/components/CompanionForm';

export const metadata: Metadata = {
  title: {
    default: 'Create a Companion | Lexi',
    template: '%s | Lexi',
  },
  description: 'Build your own learning companion for voice practice and AI tutoring.',
  openGraph: {
    type: 'website',
    title: 'Create a Companion | Lexi',
    description: 'Build your own learning companion for voice practice and AI tutoring.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lexi AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create a Companion | Lexi',
    description: 'Build your own learning companion for voice practice and AI tutoring.',
    images: ['/og-image.png'],
  },
};

const page = () => {
  return (
    <div className="px-4 md:px-12 pt-6 pb-12 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 text-neutral-900">
        Companion Builder
      </h1>
      <CompanionForm />
    </div>
  );
};

export default page;

