'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import PropertyForm from '../../../components/PropertyForm';
import { useCreatePropertyMutation } from '../../../features/properties/propertyApi';
import { getApiErrorMessage } from '../../../lib/apiError';

export default function NewPropertyPage() {
  // User must be logged in before creating a listing.
  const token = useSelector((state) => state.auth.accessToken);
  const [createProperty, createState] = useCreatePropertyMutation();
  const router = useRouter();

  async function submit(values) {
    try {
      // Create listing, then open the new property detail page.
      const property = await createProperty(values).unwrap();
      router.push(`/properties/${property.id}`);
    } catch {
    }
  }

  if (!token) {
    // Simple route guard for users who are not logged in.
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Login to list a property</h1>
        <Link href="/login" className="btn-primary mt-4">Login</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-5 text-3xl font-bold">Create property listing</h1>
      <PropertyForm onSubmit={submit} loading={createState.isLoading} />
      {createState.error && <p className="mt-3 text-sm text-coral">{getApiErrorMessage(createState.error, 'Could not save listing')}</p>}
    </section>
  );
}
