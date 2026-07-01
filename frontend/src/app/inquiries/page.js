'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useMyInquiriesQuery } from '../../features/inquiries/inquiryApi';
import { getApiErrorMessage } from '../../lib/apiError';

export default function InquiriesPage() {
  // Only logged-in users can fetch inquiries.
  const token = useSelector((state) => state.auth.accessToken);
  const hydrated = useSelector((state) => state.auth.hydrated);
  // skip prevents API call until we have a token.
  const { data, isLoading, isError, error } = useMyInquiriesQuery(undefined, { skip: !token });
  const inquiries = data?.items || [];

  if (!hydrated) {
    // Wait until auth is restored from localStorage.
    return <section className="mx-auto max-w-5xl px-4 py-10 text-ink/60">Loading...</section>;
  }

  if (!token) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Login to view inquiries</h1>
        <Link href="/login" className="btn-primary mt-4">Login</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Received inquiries</h1>
        <p className="mt-1 text-sm text-ink/60">Messages from users interested in your listings.</p>
      </div>

      {isLoading && <p className="rounded-md border border-line bg-white p-5 text-ink/60">Loading inquiries...</p>}
      {isError && <p className="rounded-md border border-coral/40 bg-coral/10 p-5 text-coral">{getApiErrorMessage(error, 'Could not load inquiries.')}</p>}
      {!isLoading && !isError && !inquiries.length && (
        <p className="rounded-md border border-line bg-white p-6 text-center text-ink/60">No inquiries received yet.</p>
      )}

      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          // Each card shows one lead received for one property.
          <article key={inquiry.id} className="rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <Link href={`/properties/${inquiry.propertyId}`} className="text-lg font-bold hover:text-leaf">{inquiry.propertyTitle}</Link>
                <p className="mt-1 text-sm text-ink/60">{inquiry.location}, {inquiry.city}</p>
              </div>
              <p className="text-sm text-ink/55">{new Date(inquiry.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-4 rounded-md bg-mist p-4 text-sm leading-6 text-ink/75">{inquiry.message}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink/70">
              <span className="font-semibold">{inquiry.requesterName}</span>
              <span className="flex items-center gap-1"><Mail size={15} /> {inquiry.requesterEmail}</span>
              {inquiry.phone && <span className="flex items-center gap-1"><Phone size={15} /> {inquiry.phone}</span>}
              {inquiry.status && <span className="rounded-md bg-mist px-2 py-1 text-xs font-bold uppercase text-ink/60">{inquiry.status}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
