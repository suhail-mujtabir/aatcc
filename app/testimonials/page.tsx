// app/testimonials/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import TestimonialsContent from '@/components/testimonials/TestimonialsContent';
import TestimonialSkeleton from '@/components/testimonials/TestimonialSkeleton';

export const metadata: Metadata = {
  title: 'Voices of the Pioneers | AATCC AUST Student Chapter',
  description:
    'Insights and reflections from the visionaries who established the AATCC AUST Student Chapter. Hear from our accomplished alumni about their experiences.',
  openGraph: {
    title: 'Voices of the Pioneers | AATCC AUST',
    description:
      'Insights and reflections from the visionaries who established the AATCC AUST Student Chapter.',
    type: 'website',
  },
};

export default function TestimonialsPage() {
  return (
    <Suspense fallback={<TestimonialSkeleton />}>
      <TestimonialsContent />
    </Suspense>
  );
}
