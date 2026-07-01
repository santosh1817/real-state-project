import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { HttpError } from '../utils/httpError.js';

function inquiryDto(inquiry) {
  // Convert BigInt ids to strings so JSON can safely send them to frontend.
  return {
    id: String(inquiry.id),
    propertyId: String(inquiry.propertyId),
    buyerId: String(inquiry.buyerId),
    message: inquiry.message,
    phone: inquiry.phone,
    status: inquiry.status,
    createdAt: inquiry.createdAt
  };
}

export async function createInquiry(propertyId, buyerId, body) {
  // Users can inquire only on active properties.
  const property = await prisma.property.findFirst({
    where: { id: BigInt(propertyId), status: 'active' },
    select: { id: true, ownerId: true }
  });
  if (!property) throw new HttpError(404, 'Property not found');
  // Owner should not create a lead for their own listing.
  if (property.ownerId === BigInt(buyerId)) throw new HttpError(400, 'You cannot inquire on your own listing');

  try {
    // Database unique constraint prevents duplicate inquiry from the same buyer.
    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: BigInt(propertyId),
        buyerId: BigInt(buyerId),
        message: body.message,
        phone: body.phone || null
      }
    });
    return inquiryDto(inquiry);
  } catch (error) {
    // Prisma P2002 means the unique rule was violated.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'You have already contacted this owner for this property');
    }
    throw error;
  }
}

export async function listMyInquiries(userId) {
  // Show inquiries received on properties owned by the logged-in user.
  const inquiries = await prisma.inquiry.findMany({
    where: { property: { ownerId: BigInt(userId) } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      property: { select: { id: true, title: true, city: true, location: true } },
      buyer: { select: { name: true, email: true } }
    }
  });

  return inquiries.map((inquiry) => ({
    id: String(inquiry.id),
    message: inquiry.message,
    phone: inquiry.phone,
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    propertyId: String(inquiry.property.id),
    propertyTitle: inquiry.property.title,
    city: inquiry.property.city,
    location: inquiry.property.location,
    requesterName: inquiry.buyer.name,
    requesterEmail: inquiry.buyer.email
  }));
}
