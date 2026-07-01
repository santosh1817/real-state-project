'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { useListPropertiesQuery } from '../features/properties/propertyApi';
import { getApiErrorMessage } from '../lib/apiError';

export default function HomeClient({ initialData }) {
  // Server gives initial listings so the first page has content before JavaScript loads.
  const [filters, setFilters] = useState({ sort: 'newest', limit: 8 });
  const [searchText, setSearchText] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  // Remove empty values before sending query params to the backend.
  const query = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')), [filters]);
  const { data: queriedData, isFetching, isError, error } = useListPropertiesQuery(query, { skip: !hasInteracted });
  const data = queriedData || initialData;

  useEffect(() => {
    // Debounce search so typing "delhi" does not call API for every character.
    const timeout = setTimeout(() => {
      setFilters((current) => {
        if ((current.q || '') === searchText) return current;
        return { ...current, q: searchText, cursor: undefined };
      });
      if (searchText) setHasInteracted(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchText]);

  function update(event) {
    // Reset cursor when filters change so search starts from page one.
    setHasInteracted(true);
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, cursor: undefined }));
  }

  function updateSearch(event) {
    // Search is debounced; other filters use update() and apply immediately.
    setSearchText(event.target.value);
  }

  function loadMore() {
    // Setting cursor loads the next page from the backend.
    setHasInteracted(true);
    setFilters((current) => ({ ...current, cursor: data.nextCursor }));
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 grid gap-4 border-b border-line pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Find verified homes faster</h1>
          <p className="mt-2 max-w-2xl text-ink/65">Search 50,000+ ready listings with indexed filters, stable cursor pagination, and owner inquiry protection.</p>
        </div>
        <div className="grid gap-3 rounded-md border border-line bg-white p-3 shadow-soft md:grid-cols-4 lg:min-w-[760px]">
          <label className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45" size={17} />
            <input className="field-leading-icon" name="q" placeholder="City, location, title" aria-label="Search by city, location, or title" value={searchText} onChange={updateSearch} />
          </label>
          <select className="field" name="propertyType" aria-label="Property type" onChange={update}>
            <option value="">Any type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="independent-house">House</option>
            <option value="commercial">Commercial</option>
          </select>
          <select className="field" name="sort" value={filters.sort} aria-label="Sort properties" onChange={update}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price low</option>
            <option value="price_desc">Price high</option>
            <option value="area_desc">Largest</option>
          </select>
          <input className="field" name="minBudget" type="number" placeholder="Min budget" aria-label="Minimum budget" onChange={update} />
          <input className="field" name="maxBudget" type="number" placeholder="Max budget" aria-label="Maximum budget" onChange={update} />
          <input className="field" name="bedrooms" type="number" placeholder="Bedrooms" aria-label="Bedrooms" onChange={update} />
          <div className="flex items-center gap-2 text-sm font-semibold text-ink/60"><SlidersHorizontal size={16} /> Filters</div>
        </div>
      </div>

      {isError && <p className="rounded-md border border-coral/40 bg-coral/10 p-4 text-coral">{getApiErrorMessage(error, 'Could not load properties.')}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(data?.items || []).map((property, index) => <PropertyCard key={property.id} property={property} priority={index === 0} />)}
      </div>
      {!isFetching && !data?.items?.length && <p className="rounded-md border border-line bg-white p-6 text-center text-ink/60">No listings match these filters.</p>}
      {data?.nextCursor && (
        <div className="mt-6 flex justify-center">
          <button className="btn-ghost" onClick={loadMore} disabled={isFetching}>
            {isFetching ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </section>
  );
}
