'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { ImagePlus, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { normalizeProperty, propertySchema } from '../features/properties/propertySchemas';
import { useUploadImageMutation } from '../features/uploads/uploadApi';
import { getApiErrorMessage } from '../lib/apiError';

const initialValues = {
  title: '',
  description: '',
  city: '',
  location: '',
  address: '',
  propertyType: 'apartment',
  listingType: 'sale',
  price: '',
  bedrooms: 2,
  bathrooms: 2,
  areaSqft: '',
  imageUrls: '',
  amenities: ''
};

function formValues(property) {
  // For create page use empty values; for edit page prefill existing property values.
  if (!property) return initialValues;
  return {
    title: property.title || '',
    description: property.description || '',
    city: property.city || '',
    location: property.location || '',
    address: property.address || '',
    propertyType: property.propertyType || 'apartment',
    listingType: property.listingType || 'sale',
    price: property.price || '',
    bedrooms: property.bedrooms ?? 2,
    bathrooms: property.bathrooms ?? 2,
    areaSqft: property.areaSqft || '',
    imageUrls: property.imageUrls?.join(', ') || '',
    amenities: property.amenities?.join(', ') || ''
  };
}

export default function PropertyForm({ initialProperty, onSubmit, loading }) {
  // React Hook Form manages field values and Zod validates them.
  const { register, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: formValues(initialProperty)
  });
  const [
    uploadImage,
    {
      isLoading: isUploading,
      isError: isUploadError,
      isSuccess: isUploadSuccess,
      error: uploadApiError
    }
  ] = useUploadImageMutation();

  async function submit(values) {
    // Convert comma-separated strings into arrays before sending to API.
    await onSubmit(normalizeProperty(values));
  }

  async function uploadFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        // Each selected file is uploaded first, then its URL is added to imageUrls.
        const formData = new FormData();
        formData.append('image', file);
        const result = await uploadImage(formData).unwrap();
        uploadedUrls.push(result.url);
      }
      // Keep old image URLs and append newly uploaded URLs.
      const existing = getValues('imageUrls') ? getValues('imageUrls').split(',').map((item) => item.trim()).filter(Boolean) : [];
      setValue('imageUrls', [...existing, ...uploadedUrls].join(', '), { shouldDirty: true, shouldValidate: true });
    } catch {
    } finally {
      event.target.value = '';
    }
  }

  function removeImage(url) {
    // Remove one image URL from the comma-separated image list.
    setValue(
      'imageUrls',
      getValues('imageUrls')
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item && item !== url)
        .join(', '),
      { shouldDirty: true, shouldValidate: true }
    );
  }

  // Watch imageUrls so the preview grid updates immediately.
  const currentImageUrls = watch('imageUrls');
  const imageUrls = currentImageUrls ? currentImageUrls.split(',').map((item) => item.trim()).filter(Boolean) : [];

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" error={errors.title?.message} {...register('title')} />
        <Field label="City" error={errors.city?.message} {...register('city')} />
        <Field label="Location" error={errors.location?.message} {...register('location')} />
        <Field label="Address" {...register('address')} />
        <Select label="Property type" options={['apartment', 'villa', 'plot', 'independent-house', 'studio', 'commercial']} {...register('propertyType')} />
        <Select label="Listing type" options={['sale', 'rent']} {...register('listingType')} />
        <Field label="Price" type="number" error={errors.price?.message} {...register('price')} />
        <Field label="Area sqft" type="number" error={errors.areaSqft?.message} {...register('areaSqft')} />
        <Field label="Bedrooms" type="number" error={errors.bedrooms?.message} {...register('bedrooms')} />
        <Field label="Bathrooms" type="number" error={errors.bathrooms?.message} {...register('bathrooms')} />
      </div>
      <label className="grid gap-1">
        <span className="label">Description</span>
        <textarea className="field min-h-32" {...register('description')} />
        {errors.description && <span className="text-xs text-coral">{errors.description.message}</span>}
      </label>
      <div className="grid gap-2">
        <span className="label">Property images</span>
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-mist px-4 py-5 text-center text-sm font-semibold text-ink/65 transition hover:border-leaf/50 hover:text-leaf">
          <ImagePlus size={22} />
          <span>{isUploading ? 'Uploading...' : 'Upload images'}</span>
          <input className="sr-only" type="file" accept="image/*" multiple onChange={uploadFiles} disabled={isUploading} />
        </label>
        {isUploadError && <span className="text-xs text-coral">{getApiErrorMessage(uploadApiError, 'Could not upload image.')}</span>}
        {isUploadSuccess && !isUploading && <span className="text-xs text-leaf">Image uploaded successfully.</span>}
        {imageUrls.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {imageUrls.map((url) => (
              <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-line">
                <Image src={url} alt="Uploaded property" fill sizes="(max-width: 768px) 50vw, 220px" className="object-cover" />
                <button type="button" className="absolute right-2 top-2 rounded-full bg-white p-1 text-ink shadow-soft" onClick={() => removeImage(url)} aria-label="Remove image">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Field label="Image URLs, comma separated" {...register('imageUrls')} />
      <Field label="Amenities, comma separated" {...register('amenities')} />
      <button className="btn-primary w-fit" disabled={loading}><Save size={16} /> Save listing</button>
    </form>
  );
}

function Field({ label, error, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input className="field" {...props} />
      {error && <span className="text-xs text-coral">{error}</span>}
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <select className="field" {...props}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
    </label>
  );
}
