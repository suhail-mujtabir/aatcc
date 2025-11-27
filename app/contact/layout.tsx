import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | AATCC AUST Student Chapter',
  description: 'Get in touch with AATCC AUST Student Chapter. Meet our team, find our office location, and reach out for collaborations, sponsorships, or inquiries.',
  openGraph: {
    title: 'Contact Us | AATCC AUST Student Chapter',
    description: 'Connect with AATCC AUST Student Chapter team',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
