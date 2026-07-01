import Image from 'next/image';
import PropertyDetailClient from './PropertyDetailClient';
import PropertyCard from '../../../components/PropertyCard';
import { SERVER_API_URL } from '../../../lib/config';
import { formatPrice, imageFor } from '../../../lib/format';

async function getDetail(id) {
  // no-store keeps property detail fresh after edits/deletes.
  const response = await fetch(`${SERVER_API_URL}/api/properties/${id}`, { cache: 'no-store' });
  if (!response.ok) return null;
  const result = await response.json();
  return result.data;
}

export async function generateMetadata({ params }) {
  // Generate SEO title/description from real property data.
  const { id } = await params;
  const detail = await getDetail(id);
  const property = detail?.property;
  if (!property) return { title: 'Property not found' };
  return {
    title: `${property.title} in ${property.location}, ${property.city}`,
    description: `${property.bedrooms} BHK ${property.propertyType} for ${property.listingType} at ${formatPrice(property.price, property.listingType)}. ${property.description.slice(0, 120)}`,
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 150),
      images: [imageFor(property)]
    }
  };
}

export default async function PropertyPage({ params }) {
  // Server component fetches property detail before rendering page HTML.
  const { id } = await params;
  const detail = await getDetail(id);
  if (!detail) return <section className="mx-auto max-w-4xl px-4 py-16">Property not found.</section>;
  const { property, similar } = detail;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-md border border-line bg-line">
            <Image src={imageFor(property)} alt={property.title} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
          </div>
          <div className="mt-5">
            <p className="text-2xl font-bold text-leaf">{formatPrice(property.price, property.listingType)}</p>
            <h1 className="mt-1 text-3xl font-bold">{property.title}</h1>
            <p className="mt-2 text-ink/65">{property.location}, {property.city}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Bedrooms" value={property.bedrooms} />
              <Stat label="Bathrooms" value={property.bathrooms} />
              <Stat label="Area" value={`${property.areaSqft} sqft`} />
              <Stat label="Type" value={property.propertyType} />
            </div>
            <p className="mt-5 leading-7 text-ink/75">{property.description}</p>
          </div>
        </div>
        <PropertyDetailClient property={property} />
      </div>
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Similar properties</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => <PropertyCard key={item.id} property={item} />)}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  // Small reusable stat tile for bedrooms, bathrooms, area, and type.
  return <div className="rounded-md border border-line bg-white p-3"><p className="label">{label}</p><p className="mt-1 font-bold">{value}</p></div>;
}
