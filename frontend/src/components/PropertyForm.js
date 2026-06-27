'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { normalizeProperty, propertySchema } from '../features/properties/propertySchemas';

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

export default function PropertyForm({ onSubmit, loading }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    const parsed = propertySchema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    setErrors({});
    await onSubmit(normalizeProperty(parsed.data));
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title" name="title" value={values.title} onChange={update} error={errors.title} />
        <Field label="City" name="city" value={values.city} onChange={update} error={errors.city} />
        <Field label="Location" name="location" value={values.location} onChange={update} error={errors.location} />
        <Field label="Address" name="address" value={values.address} onChange={update} />
        <Select label="Property type" name="propertyType" value={values.propertyType} onChange={update} options={['apartment', 'villa', 'plot', 'independent-house', 'studio', 'commercial']} />
        <Select label="Listing type" name="listingType" value={values.listingType} onChange={update} options={['sale', 'rent']} />
        <Field label="Price" name="price" type="number" value={values.price} onChange={update} error={errors.price} />
        <Field label="Area sqft" name="areaSqft" type="number" value={values.areaSqft} onChange={update} error={errors.areaSqft} />
        <Field label="Bedrooms" name="bedrooms" type="number" value={values.bedrooms} onChange={update} />
        <Field label="Bathrooms" name="bathrooms" type="number" value={values.bathrooms} onChange={update} />
      </div>
      <label className="grid gap-1">
        <span className="label">Description</span>
        <textarea className="field min-h-32" name="description" value={values.description} onChange={update} />
        {errors.description && <span className="text-xs text-coral">{errors.description}</span>}
      </label>
      <Field label="Image URLs, comma separated" name="imageUrls" value={values.imageUrls} onChange={update} />
      <Field label="Amenities, comma separated" name="amenities" value={values.amenities} onChange={update} />
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
