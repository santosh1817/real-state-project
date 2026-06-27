import { query } from '../../db/pool.js';
import { HttpError } from '../../utils/httpError.js';

export async function createInquiry(propertyId, requesterId, body) {
  const property = await query(
    "SELECT id, owner_id FROM properties WHERE id = $1 AND status = 'active'",
    [propertyId]
  );
  if (!property.rowCount) throw new HttpError(404, 'Property not found');
  const ownerId = property.rows[0].owner_id;
  if (Number(ownerId) === Number(requesterId)) throw new HttpError(400, 'You cannot inquire on your own listing');

  try {
    const result = await query(
      `INSERT INTO inquiries (property_id, requester_id, owner_id, message, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, property_id AS "propertyId", requester_id AS "requesterId", owner_id AS "ownerId", message, phone, created_at AS "createdAt"`,
      [propertyId, requesterId, ownerId, body.message, body.phone || null]
    );
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'You have already contacted this owner for this property');
    throw error;
  }
}

export async function listMyInquiries(userId) {
  const result = await query(
    `SELECT i.id, i.message, i.phone, i.created_at AS "createdAt",
      p.id AS "propertyId", p.title AS "propertyTitle", p.city, p.location,
      u.name AS "requesterName", u.email AS "requesterEmail"
     FROM inquiries i
     JOIN properties p ON p.id = i.property_id
     JOIN users u ON u.id = i.requester_id
     WHERE i.owner_id = $1
     ORDER BY i.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows;
}
