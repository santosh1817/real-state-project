import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';

const ownerSelect = { id: true, name: true, email: true, phone: true };

function propertyDto(property) {
  if (!property) return null;
  // Convert database rows into the clean API shape used by the frontend.
  return {
    id: String(property.id),
    ownerId: String(property.ownerId),
    ownerName: property.owner?.name,
    ownerEmail: property.owner?.email,
    ownerPhone: property.owner?.phone,
    title: property.title,
    description: property.description,
    city: property.city,
    location: property.location,
    address: property.address,
    propertyType: property.propertyType,
    listingType: property.listingType,
    price: Number(property.price),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqft: property.areaSqft,
    imageUrls: property.images?.map((image) => image.imageUrl) || [],
    amenities: property.amenities,
    status: property.status,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt
  };
}

function encodeCursor(row, sort) {
  if (!row) return null;
  // Cursor pagination stores the last item position so the next page is stable for large datasets.
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

function orderBy(sort) {
  const map = {
    newest: [{ createdAt: 'desc' }, { id: 'desc' }],
    price_asc: [{ price: 'asc' }, { id: 'asc' }],
    price_desc: [{ price: 'desc' }, { id: 'desc' }],
    area_desc: [{ areaSqft: 'desc' }, { id: 'desc' }]
  };
  return map[sort] || map.newest;
}

function cursorFilter(sort, cursor) {
  const decoded = decodeCursor(cursor);
  if (!decoded) return {};

  const id = BigInt(decoded.id);
  if (sort === 'price_asc') {
    return { OR: [{ price: { gt: decoded.value } }, { price: decoded.value, id: { gt: id } }] };
  }
  if (sort === 'price_desc') {
    return { OR: [{ price: { lt: decoded.value } }, { price: decoded.value, id: { lt: id } }] };
  }
  if (sort === 'area_desc') {
    return { OR: [{ areaSqft: { lt: decoded.value } }, { areaSqft: decoded.value, id: { lt: id } }] };
  }

  const createdAt = new Date(decoded.value);
  return { OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }] };
}

function searchWhere(filters) {
  const and = [cursorFilter(filters.sort, filters.cursor)].filter((item) => Object.keys(item).length);
  // Public listings only show active properties; deleted records stay hidden.
  const where = { status: 'active' };

  if (filters.q) {
    and.push({
      OR: [
        { city: { contains: filters.q, mode: 'insensitive' } },
        { location: { contains: filters.q, mode: 'insensitive' } },
        { title: { contains: filters.q, mode: 'insensitive' } }
      ]
    });
  }
  if (filters.city) where.city = { equals: filters.city, mode: 'insensitive' };
  if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.bedrooms !== undefined) where.bedrooms = filters.bedrooms;
  if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
    where.price = {};
    if (filters.minBudget !== undefined) where.price.gte = filters.minBudget;
    if (filters.maxBudget !== undefined) where.price.lte = filters.maxBudget;
  }

  if (and.length) where.AND = and;
  return where;
}

export async function listProperties(filters) {
  const result = await prisma.property.findMany({
    where: searchWhere(filters),
    orderBy: orderBy(filters.sort),
    take: filters.limit + 1,
    include: { owner: { select: ownerSelect }, images: true }
  });

  // Fetch one extra row to know if another page exists.
  const rows = result.slice(0, filters.limit).map(propertyDto);
  return {
    data: rows,
    nextCursor: result.length > filters.limit ? encodeCursor(rows.at(-1), filters.sort) : null
  };
}

export async function getProperty(id) {
  const property = await prisma.property.findFirst({
    where: { id: BigInt(id), status: 'active' },
    include: { owner: { select: ownerSelect }, images: true }
  });
  if (!property) throw new HttpError(404, 'Property not found');
  return propertyDto(property);
}

export async function createProperty(ownerId, body) {
  const property = await prisma.property.create({
    data: {
      ownerId: BigInt(ownerId),
      title: body.title,
      description: body.description,
      city: body.city,
      location: body.location,
      address: body.address || null,
      propertyType: body.propertyType,
      listingType: body.listingType,
      price: body.price,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      areaSqft: body.areaSqft,
      amenities: body.amenities,
      images: body.imageUrls.length ? { create: body.imageUrls.map((imageUrl) => ({ imageUrl })) } : undefined
    },
    include: { owner: { select: ownerSelect }, images: true }
  });
  return propertyDto(property);
}

function propertyAccessWhere(id, user) {
  // Admin can manage any active property; normal users can only manage their own property.
  const where = { id: BigInt(id), status: 'active' };
  if (user.role !== 'ADMIN') where.ownerId = BigInt(user.id);
  return where;
}

function propertyData(body) {
  const { imageUrls, ...data } = body;
  return {
    ...data,
    address: body.address === '' ? null : body.address,
    updatedAt: new Date()
  };
}

export async function updateProperty(id, user, body) {
  const existing = await prisma.property.findFirst({ where: propertyAccessWhere(id, user), select: { id: true } });
  if (!existing) throw new HttpError(404, 'Property not found or you are not allowed to edit it');

  await prisma.$transaction(async (tx) => {
    await tx.property.update({
      where: { id: BigInt(id) },
      data: propertyData(body)
    });
    if (body.imageUrls !== undefined) {
      // Replace the full image list so edits keep the database in sync with the form.
      await tx.propertyImage.deleteMany({ where: { propertyId: BigInt(id) } });
      if (body.imageUrls.length) {
        await tx.propertyImage.createMany({
          data: body.imageUrls.map((imageUrl) => ({ propertyId: BigInt(id), imageUrl }))
        });
      }
    }
  });

  return getProperty(id);
}

export async function deleteProperty(id, user) {
  // Soft delete keeps history/inquiries safe while hiding the listing from users.
  const result = await prisma.property.updateMany({
    where: propertyAccessWhere(id, user),
    data: { status: 'deleted', updatedAt: new Date() }
  });
  if (!result.count) throw new HttpError(404, 'Property not found or you are not allowed to delete it');
}

export async function getSimilarProperties(propertyId, limit = 4) {
  const property = await getProperty(propertyId);
  // Start with a small candidate set that shares key attributes, then score it in memory.
  const candidates = await prisma.property.findMany({
    where: {
      id: { not: BigInt(propertyId) },
      status: 'active',
      OR: [
        { city: property.city },
        { propertyType: property.propertyType },
        { bedrooms: property.bedrooms }
      ]
    },
    take: 50,
    include: { owner: { select: ownerSelect }, images: true }
  });

  return candidates
    .map(propertyDto)
    .map((candidate) => ({
      property: candidate,
      score:
        (candidate.city === property.city ? 4 : 0) +
        (candidate.propertyType === property.propertyType ? 3 : 0) +
        (candidate.bedrooms === property.bedrooms ? 2 : 0) +
        (Math.abs(candidate.price - property.price) <= property.price * 0.25 ? 2 : 0)
    }))
    .sort((a, b) => b.score - a.score || Math.abs(a.property.price - property.price) - Math.abs(b.property.price - property.price))
    .slice(0, limit)
    .map((item) => item.property);
}
