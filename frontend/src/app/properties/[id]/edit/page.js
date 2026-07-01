'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import PropertyForm from '../../../../components/PropertyForm';
import { usePropertyDetailQuery, useUpdatePropertyMutation } from '../../../../features/properties/propertyApi';
import { getApiErrorMessage } from '../../../../lib/apiError';

export default function EditPropertyPage() {
  // Read property id from route: /properties/:id/edit.
  const { id } = useParams();
  const router = useRouter();
  const token = useSelector((state) => state.auth.accessToken);
  const user = useSelector((state) => state.auth.user);
  const hydrated = useSelector((state) => state.auth.hydrated);
  const { data, isLoading, isError, error } = usePropertyDetailQuery(id, { skip: !id });
  const [updateProperty, updateState] = useUpdatePropertyMutation();
  const property = data?.property;
  // Only the property owner can edit from this page.
  const isOwner = property && user?.id && String(user.id) === String(property.ownerId);

  async function submit(values) {
    try {
      // Save changes and navigate back to the detail page.
      const updated = await updateProperty({ id, ...values }).unwrap();
      router.push(`/properties/${updated.id}`);
    } catch {
    }
  }

  if (!hydrated || isLoading) {
    // Wait for auth hydration and property fetch.
    return <section className="mx-auto max-w-4xl px-4 py-12 text-ink/60">Loading...</section>;
  }

  if (!token) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Login to edit this listing</h1>
        <Link href="/login" className="btn-primary mt-4">Login</Link>
      </section>
    );
  }

  if (isError || !property) {
    return <section className="mx-auto max-w-4xl px-4 py-12 text-coral">{getApiErrorMessage(error, 'Could not load this listing.')}</section>;
  }

  if (!isOwner) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">You cannot edit this listing</h1>
        <Link href={`/properties/${id}`} className="btn-ghost mt-4">Back to listing</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Edit property listing</h1>
      <PropertyForm initialProperty={property} onSubmit={submit} loading={updateState.isLoading} />
      {updateState.error && <p className="mt-3 text-sm text-coral">{getApiErrorMessage(updateState.error, 'Could not update listing')}</p>}
    </section>
  );
}
