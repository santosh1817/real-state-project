'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useAdminDeletePropertyMutation, useAdminPropertiesQuery } from '../../../features/admin/adminApi';
import { getApiErrorMessage } from '../../../lib/apiError';

export default function AdminPropertiesPage() {
  // Read logged-in user and token from Redux auth state.
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.accessToken);
  const hydrated = useSelector((state) => state.auth.hydrated);
  const isAdmin = user?.role === 'ADMIN';
  const { data, isLoading, isError, error } = useAdminPropertiesQuery(undefined, { skip: !token || !isAdmin });
  const [deleteProperty, deleteState] = useAdminDeletePropertyMutation();
  // This stores the property selected for the confirmation popup.
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  // Extra frontend safety: do not render deleted properties even if cache has old data.
  const properties = (data?.items || []).filter((property) => property.status === 'active');

  async function removeProperty() {
    if (!propertyToDelete) return;
    try {
      // RTK Query will call DELETE /api/admin/properties/:id and refresh cached lists.
      await deleteProperty(propertyToDelete.id).unwrap();
      setPropertyToDelete(null);
    } catch {
    }
  }

  if (!hydrated) {
    // Wait until localStorage auth is loaded on the client.
    return <section className="mx-auto max-w-6xl px-4 py-10 text-ink/60">Loading...</section>;
  }

  if (!token || !isAdmin) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-md bg-coral/10 text-coral"><Shield size={24} /></div>
        <h1 className="mt-5 text-2xl font-bold">Admin access required</h1>
        <Link href="/" className="btn-ghost mt-4">Back to listings</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5">
        <h1 className="text-3xl font-bold">Admin properties</h1>
        <p className="mt-1 text-sm text-ink/60">ADMIN can delete any property. USER can only delete their own property.</p>
      </div>

      {isLoading && <p className="rounded-md border border-line bg-white p-5 text-ink/60">Loading properties...</p>}
      {isError && <p className="rounded-md border border-coral/40 bg-coral/10 p-5 text-coral">{getApiErrorMessage(error, 'Could not load admin properties.')}</p>}
      {deleteState.isError && <p className="rounded-md border border-coral/40 bg-coral/10 p-5 text-coral">{getApiErrorMessage(deleteState.error, 'Could not delete property.')}</p>}

      <div className="overflow-hidden rounded-md border border-line bg-white shadow-soft">
        <div className="grid grid-cols-[1fr_160px_130px] gap-3 border-b border-line bg-mist px-4 py-3 text-sm font-bold text-ink/70">
          <span>Property</span>
          <span>Owner</span>
          <span>Action</span>
        </div>
        {properties.map((property) => (
          <div key={property.id} className="grid grid-cols-[1fr_160px_130px] gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0">
            <div>
              <Link href={`/properties/${property.id}`} className="font-bold hover:text-leaf">{property.title}</Link>
              <p className="mt-1 text-ink/60">{property.location}, {property.city} · {property.status}</p>
            </div>
            <span className="text-ink/70">{property.ownerName}</span>
            {/* Open custom confirmation dialog instead of browser confirm(). */}
            <button className="btn-ghost border-coral/40 text-coral hover:border-coral" onClick={() => setPropertyToDelete(property)} disabled={deleteState.isLoading || property.status !== 'active'}>
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(propertyToDelete)}
        title="Delete property?"
        message={propertyToDelete ? `Are you sure you want to delete "${propertyToDelete.title}" as admin? This will remove it from active listings.` : ''}
        confirmLabel="OK"
        cancelLabel="Cancel"
        loading={deleteState.isLoading}
        onCancel={() => setPropertyToDelete(null)}
        onConfirm={removeProperty}
      />
    </section>
  );
}
