import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react';
import { formatPrice, imageFor } from '../lib/format';

export default function PropertyCard({ property }) {
  return (
    <Link href={`/properties/${property.id}`} className="group block overflow-hidden rounded-md border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-leaf/40">
      <div className="relative aspect-[16/10] bg-line">
        <Image src={imageFor(property)} alt={property.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-bold uppercase text-leaf">{property.listingType}</span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-lg font-bold text-leaf">{formatPrice(property.price, property.listingType)}</p>
          <h3 className="line-clamp-1 font-semibold">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink/60"><MapPin size={14} /> {property.location}, {property.city}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-ink/70">
          <span className="flex items-center gap-1"><BedDouble size={15} /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath size={15} /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Ruler size={15} /> {property.areaSqft}</span>
        </div>
      </div>
    </Link>
  );
}
