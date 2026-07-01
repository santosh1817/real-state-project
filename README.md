# Real Estate Listing Platform

A fullstack real-estate assignment implementation inspired by 99acres and NoBroker.

## Stack

- Frontend: Next.js App Router, JavaScript, Tailwind CSS, Redux Toolkit, RTK Query, React Hook Form, Zod
- Backend: Node.js, Express.js, PostgreSQL, Prisma ORM, Multer, Zod, Swagger/OpenAPI
- Auth: JWT access tokens plus rotating refresh tokens stored as SHA-256 hashes
- Docs: Swagger UI at `http://localhost:4000/api-docs`

## Quick Start

```bash
cd real-estate-platform
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
brew services start postgresql@16
npm run install:all
npm run migrate
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

## Requirement Coverage

- Authentication: registration, login, JWT access token, rotating refresh token, protected routes, auth middleware.
- Listings: create, edit, soft-delete own listings, list all active listings, detail view.
- Search: city/location/title search, budget, property type, bedrooms, sorting, cursor pagination.
- Scale: composite B-tree indexes for filters/sort, trigram GIN index for city/location search, capped response sizes, cursor pagination for large result sets.
- Similar properties: city/type/bedroom/price weighted ranking, backed by filter-friendly indexes.
- Inquiries: unique `(property_id, buyer_id)` duplicate prevention, own-listing block, route-level rate limit.
- SEO: property detail pages use server rendering with ISR (`revalidate: 120`) and dynamic metadata/OpenGraph.
- Validation: Zod schemas on backend request boundaries and React Hook Form + Zod resolver on frontend forms.

## Image Handling Approach

Authenticated users can upload images through `POST /api/uploads/images`. Multer stores files locally in `backend/uploads`, and property image URLs are stored in the `property_images` table. In production, this should move to signed uploads through S3/R2/Cloudinary, with stored object keys, malware scanning, and CDN delivery.

## API Notes

Protected endpoints expect:

```http
Authorization: Bearer <accessToken>
```

Cursor pagination returns:

```json
{
  "success": true,
  "data": {
    "items": [],
    "nextCursor": "opaque-cursor-or-null"
  }
}
```

## Production Considerations

- Keep access tokens short-lived and rotate refresh tokens on every refresh.
- Store refresh tokens hashed, revoke on logout, and prune expired rows.
- Use `EXPLAIN ANALYZE` against realistic 50,000+ row data to tune indexes per traffic pattern.
- Add Redis-backed rate limiting for multi-instance deployments.
- Add structured logging, request IDs, metrics, CI, and integration tests before shipping.
