import HomeClient from './HomeClient';
import { SERVER_API_URL } from '../lib/config';

async function getInitialProperties() {
  try {
    // Render the first listing page on the server to improve FCP/LCP.
    const response = await fetch(`${SERVER_API_URL}/api/properties?sort=newest&limit=8`, { cache: 'no-store' });
    if (!response.ok) return { items: [], nextCursor: null };
    const result = await response.json();
    return result.data || { items: [], nextCursor: null };
  } catch {
    return { items: [], nextCursor: null };
  }
}

export default async function HomePage() {
  const initialData = await getInitialProperties();
  return <HomeClient initialData={initialData} />;
}
