// Browser-side API URL. In production set NEXT_PUBLIC_API_URL.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
// Server components can use an internal backend URL if deployed separately.
export const SERVER_API_URL = process.env.API_INTERNAL_URL || API_URL;
