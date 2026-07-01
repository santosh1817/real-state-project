'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit3, Mail, Phone, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { z } from 'zod';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useCreateInquiryMutation } from '../../../features/inquiries/inquiryApi';
import { useDeletePropertyMutation } from '../../../features/properties/propertyApi';
import { getApiErrorMessage } from '../../../lib/apiError';

const inquirySchema = z.object({
  message: z.string().min(10).max(1000),
  phone: z.string().min(7).optional().or(z.literal(''))
});

export default function PropertyDetailClient({ property }) {
  // Auth state decides whether user can contact owner or manage listing.
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  const [status, setStatus] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: { message: `I am interested in ${property.title}. Please share more details.`, phone: '' }
  });
  const [createInquiry, inquiryState] = useCreateInquiryMutation();
  const [deleteProperty, deleteState] = useDeletePropertyMutation();
  // Owner or admin can edit/delete; other users see inquiry form.
  const isOwner = user?.id && String(user.id) === String(property.ownerId);
  const isAdmin = user?.role === 'ADMIN';
  const canManage = isOwner || isAdmin;

  async function submit(values) {
    setStatus('');
    try {
      // Send inquiry to backend; duplicate inquiries are blocked by API.
      await createInquiry({ propertyId: property.id, ...values }).unwrap();
      setStatus('Inquiry sent to the owner.');
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Could not send inquiry.'));
    }
  }

  async function removeListing() {
    setStatus('');
    try {
      // Soft-delete listing, close modal, then return to home.
      await deleteProperty(property.id).unwrap();
      setShowDeleteDialog(false);
      router.push('/');
    } catch (error) {
      setStatus(getApiErrorMessage(error, 'Could not delete listing.'));
    }
  }

  return (
    <aside className="h-fit rounded-md border border-line bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold">{canManage ? 'Manage listing' : 'Contact owner'}</h2>
      <p className="mt-1 text-sm text-ink/60">{property.ownerName}</p>
      <div className="mt-4 grid gap-2 text-sm">
        <span className="flex items-center gap-2"><Mail size={16} /> {property.ownerEmail}</span>
        {property.ownerPhone && <span className="flex items-center gap-2"><Phone size={16} /> {property.ownerPhone}</span>}
      </div>
      {canManage && (
        <div className="mt-5 grid gap-3">
          <p className="rounded-md bg-mist p-3 text-sm text-ink/65">{isOwner ? 'You own this listing. Buyers will see the contact form here.' : 'Admin access: you can delete this listing.'}</p>
          {isOwner && <Link className="btn-primary" href={`/properties/${property.id}/edit`}><Edit3 size={16} /> Edit listing</Link>}
          <button type="button" className="btn-ghost border-coral/40 text-coral hover:border-coral" onClick={() => setShowDeleteDialog(true)} disabled={deleteState.isLoading}>
            <Trash2 size={16} />
            {deleteState.isLoading ? 'Deleting...' : 'Delete listing'}
          </button>
          {status && <p className="text-sm text-coral">{status}</p>}
        </div>
      )}
      {!canManage && (
      <form onSubmit={handleSubmit(submit)} className="mt-5 grid gap-3">
        <textarea className="field min-h-28" {...register('message')} disabled={!token} />
        {errors.message && <span className="text-xs text-coral">{errors.message.message}</span>}
        <input className="field" placeholder="Your phone" {...register('phone')} disabled={!token} />
        {errors.phone && <span className="text-xs text-coral">{errors.phone.message}</span>}
        {token ? (
          <button className="btn-primary" disabled={inquiryState.isLoading}>{inquiryState.isLoading ? 'Sending...' : 'Send Message'}</button>
        ) : (
          <Link href="/login" className="btn-primary">Login to Send Message</Link>
        )}
        {status && <p className="text-sm text-ink/70">{status}</p>}
      </form>
      )}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete listing?"
        message={`Are you sure you want to delete "${property.title}"? This will remove it from active listings.`}
        confirmLabel="OK"
        cancelLabel="Cancel"
        loading={deleteState.isLoading}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={removeListing}
      />
    </aside>
  );
}
