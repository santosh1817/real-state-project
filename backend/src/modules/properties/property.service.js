import { query } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';

const selectProperty = `
  p.id, p.owner_id AS "ownerId", u.name AS "ownerName", u.email AS "ownerEmail", u.phone AS "ownerPhone",
  p.title, p.description, p.city, p.location, p.address, p.property_type AS "propertyType",
  p.listing_type AS "listingType", p.price::float AS price, p.bedrooms, p.bathrooms,
  p.area_sqft AS "areaSqft", p.image_urls AS "imageUrls", p.amenities, p.status,
  p.created_at AS "createdAt", p.updated_at AS "updatedAt"
`;

function encodeCursor(row, sort) {
  if (!row) return null;
  const value = sort.startsWith('price') ? row.price : sort === 'area_desc' ? row.areaSqft : row.createdAt;
  return Buffer.from(JSON.stringify({ value, id: row.id })).toString('base64url');
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    throw new HttpError(400, 'Invalid cursor');
  }
}

function sortClause(sort) {
  const map = {
    newest: 'p.created_at DESC, p.id DESC',
    price_asc: 'p.price ASC, p.id ASC',
    price_desc: 'p.price DESC, p.id DESC',
    area_desc: 'p.area_sqft DESC, p.id DESC'
  };
  return map[sort] || map.newest;
}

function cursorWhere(sort, cursor, params) {
  const decoded = decodeCursor(cursor);
  if (!decoded) return '';
  params.push(decoded.value, decoded.id);
  const valueRef = `$${params.length - 1}`;
  const idRef = `$${params.length}`;
  if (sort === 'price_asc') return ` AND (p.price, p.id) > (${valueRef}, ${idRef})`;
  if (sort === 'price_desc') return ` AND (p.price, p.id) < (${valueRef}, ${idRef})`;
  if (sort === 'area_desc') return ` AND (p.area_sqft, p.id) < (${valueRef}, ${idRef})`;
  return ` AND (p.created_at, p.id) < (${valueRef}, ${idRef})`;
}

export async function listProperties(filters) {
  const params = [];
  const where = ["p.status = 'active'"];

  if (filters.q) {
    params.push(`%${filters.q}%`);
    where.push(`(p.city ILIKE $${params.length} OR p.location ILIKE $${params.length} OR p.title ILIKE $${params.length})`);
  }
  if (filters.city) {
    params.push(filters.city);
    where.push(`p.city ILIKE $${params.length}`);
  }
  if (filters.location) {
    params.push(`%${filters.location}%`);
    where.push(`p.location ILIKE $${params.length}`);
  }
  if (filters.propertyType) {
    params.push(filters.propertyType);
    where.push(`p.property_type = $${params.length}`);
  }
  if (filters.bedrooms !== undefined) {
    params.push(filters.bedrooms);
    where.push(`p.bedrooms = $${params.length}`);
  }
  if (filters.minBudget !== undefined) {
    params.push(filters.minBudget);
    where.push(`p.price >= $${params.length}`);
  }
  if (filters.maxBudget !== undefined) {
    params.push(filters.maxBudget);
    where.push(`p.price <= $${params.length}`);
  }

  const cursorFilter = cursorWhere(filters.sort, filters.cursor, params);
  params.push(filters.limit + 1);

  const result = await query(
    `SELECT ${selectProperty}
     FROM properties p
     JOIN users u ON u.id = p.owner_id
     WHERE ${where.join(' AND ')} ${cursorFilter}
     ORDER BY ${sortClause(filters.sort)}
     LIMIT $${params.length}`,
    params
  );

  const rows = result.rows.slice(0, filters.limit);
  return {
    data: rows,
    nextCursor: result.rows.length > filters.limit ? encodeCursor(rows.at(-1), filters.sort) : null
  };
}

export async function getProperty(id) {
  const result = await query(
    `SELECT ${selectProperty}
     FROM properties p JOIN users u ON u.id = p.owner_id
     WHERE p.id = $1 AND p.status = 'active'`,
    [id]
  );
  if (!result.rowCount) throw new HttpError(404, 'Property not found');
  return result.rows[0];
}

export async function createProperty(ownerId, body) {
  const result = await query(
    `INSERT INTO properties
      (owner_id, title, description, city, location, address, property_type, listing_type, price, bedrooms, bathrooms, area_sqft, image_urls, amenities)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id`,
    [ownerId, body.title, body.description, body.city, body.location, body.address || null, body.propertyType, body.listingType, body.price, body.bedrooms, body.bathrooms, body.areaSqft, body.imageUrls, body.amenities]
  );
  return getProperty(result.rows[0].id);
}

export async function updateProperty(id, userId, body) {
  const allowed = {
    title: 'title',
    description: 'description',
    city: 'city',
    location: 'location',
    address: 'address',
    propertyType: 'property_type',
    listingType: 'listing_type',
    price: 'price',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    areaSqft: 'area_sqft',
    imageUrls: 'image_urls',
    amenities: 'amenities'
  };
  const entries = Object.entries(body);
  const assignments = entries.map(([key], index) => `${allowed[key]} = $${index + 3}`);
  const values = entries.map(([, value]) => value);
  const result = await query(
    `UPDATE properties
     SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE id = $1 AND owner_id = $2 AND status = 'active'
     RETURNING id`,
    [id, userId, ...values]
  );
  if (!result.rowCount) throw new HttpError(404, 'Property not found or you are not the owner');
  return getProperty(id);
}

export async function deleteProperty(id, userId) {
  const result = await query(
    `UPDATE properties SET status = 'deleted', updated_at = NOW()
     WHERE id = $1 AND owner_id = $2 AND status = 'active'`,
    [id, userId]
  );
  if (!result.rowCount) throw new HttpError(404, 'Property not found or you are not the owner');
}

export async function getSimilarProperties(propertyId, limit = 4) {
  const property = await getProperty(propertyId);
  const result = await query(
    `SELECT ${selectProperty},
      (
        CASE WHEN p.city = $2 THEN 4 ELSE 0 END +
        CASE WHEN p.property_type = $3 THEN 3 ELSE 0 END +
        CASE WHEN p.bedrooms = $4 THEN 2 ELSE 0 END +
        CASE WHEN ABS(p.price - $5) <= ($5 * 0.25) THEN 2 ELSE 0 END
      ) AS score
     FROM properties p JOIN users u ON u.id = p.owner_id
     WHERE p.id <> $1 AND p.status = 'active'
       AND (p.city = $2 OR p.property_type = $3 OR p.bedrooms = $4)
     ORDER BY score DESC, ABS(p.price - $5) ASC, p.created_at DESC
     LIMIT $6`,
    [propertyId, property.city, property.propertyType, property.bedrooms, property.price, limit]
  );
  return result.rows;
}
