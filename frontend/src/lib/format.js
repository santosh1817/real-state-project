export function formatPrice(value, listingType) {
  // Format prices in Indian Rupees; rent listings show monthly suffix.
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
  return listingType === 'rent' ? `${formatted}/mo` : formatted;
}

export function imageFor(property) {
  // Use first uploaded image, otherwise show a safe default property image.
  return property?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6';
}
