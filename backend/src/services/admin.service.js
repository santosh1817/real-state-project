import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';

function userDto(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  };
}

function propertyDto(property) {
  return {
    id: String(property.id),
    ownerId: String(property.ownerId),
    ownerName: property.owner.name,
    title: property.title,
    city: property.city,
    location: property.location,
    price: Number(property.price),
    status: property.status,
    createdAt: property.createdAt
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return users.map(userDto);
}

export async function updateUserRole(id, role) {
  if (!['USER', 'ADMIN'].includes(role)) throw new HttpError(400, 'Invalid role');
  const user = await prisma.user.update({ where: { id: BigInt(id) }, data: { role } });
  return userDto(user);
}

export async function deleteUser(id, currentUserId) {
  if (String(id) === String(currentUserId)) throw new HttpError(400, 'Admin cannot delete their own account');
  await prisma.user.delete({ where: { id: BigInt(id) } });
}

export async function listAdminProperties() {
  const properties = await prisma.property.findMany({
    // Admin list shows only active properties; deleted items can be handled by a separate archive later.
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { owner: { select: { name: true } } }
  });
  return properties.map(propertyDto);
}

export async function adminDeleteProperty(id) {
  // Admin delete also uses soft delete, so the row is hidden but not permanently removed.
  const result = await prisma.property.updateMany({
    where: { id: BigInt(id), status: 'active' },
    data: { status: 'deleted', updatedAt: new Date() }
  });
  if (!result.count) throw new HttpError(404, 'Property not found');
}
