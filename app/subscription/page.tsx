import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Subscription | Lexi',
    template: '%s | Lexi',
  },
  description: 'Manage your Lexi subscription and unlock premium voice learning features.',
  openGraph: {
    type: 'website',
    title: 'Subscription | Lexi',
    description: 'Manage your Lexi subscription and unlock premium voice learning features.',
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
    title: 'Subscription | Lexi',
    description: 'Manage your Lexi subscription and unlock premium voice learning features.',
    images: ['/og-image.png'],
  },
};

const page = () => {
  return (
    <div>
      subscription
    </div>
  );
};

export default page;

