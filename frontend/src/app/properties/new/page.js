'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import PropertyForm from '../../../components/PropertyForm';
import { useCreatePropertyMutation } from '../../../store/api';

export default function NewPropertyPage() {
  const token = useSelector((state) => state.auth.accessToken);
  const [createProperty, createState] = useCreatePropertyMutation();
  const router = useRouter();

  async function submit(values) {
    const property = await createProperty(values).unwrap();
    router.push(`/properties/${property.id}`);
  }

  if (!token) {
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
      {createState.error && <p className="mt-3 text-sm text-coral">{createState.error.data?.message || 'Could not save listing'}</p>}
    </section>
  );
}
