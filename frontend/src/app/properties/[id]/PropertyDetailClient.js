'use client';

import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import { useCreateInquiryMutation } from '../../../store/api';

const inquirySchema = z.object({
  message: z.string().min(10).max(1000),
  phone: z.string().min(7).optional().or(z.literal(''))
});

export default function PropertyDetailClient({ property }) {
  const token = useSelector((state) => state.auth.accessToken);
  const [form, setForm] = useState({ message: `I am interested in ${property.title}. Please share more details.`, phone: '' });
  const [status, setStatus] = useState('');
  const [createInquiry, inquiryState] = useCreateInquiryMutation();

  async function submit(event) {
    event.preventDefault();
    setStatus('');
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) return setStatus('Please enter a valid message and phone.');
    try {
      await createInquiry({ propertyId: property.id, ...parsed.data }).unwrap();
      setStatus('Inquiry sent to the owner.');
    } catch (error) {
      setStatus(error?.data?.message || 'Could not send inquiry.');
    }
  }

  return (
    <aside className="h-fit rounded-md border border-line bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold">Contact owner</h2>
      <p className="mt-1 text-sm text-ink/60">{property.ownerName}</p>
      <div className="mt-4 grid gap-2 text-sm">
        <span className="flex items-center gap-2"><Mail size={16} /> {property.ownerEmail}</span>
        {property.ownerPhone && <span className="flex items-center gap-2"><Phone size={16} /> {property.ownerPhone}</span>}
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-3">
        <textarea className="field min-h-28" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} disabled={!token} />
        <input className="field" placeholder="Your phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={!token} />
        <button className="btn-primary" disabled={!token || inquiryState.isLoading}>{token ? 'Send inquiry' : 'Login to inquire'}</button>
        {status && <p className="text-sm text-ink/70">{status}</p>}
      </form>
    </aside>
  );
}
