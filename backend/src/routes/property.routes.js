import express from 'express';
import { createPropertyController, deletePropertyController, getPropertyController, listPropertiesController, updatePropertyController } from '../controllers/property.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createPropertySchema, propertyIdSchema, searchPropertiesSchema, updatePropertySchema } from '../schemas/property.schemas.js';

export const propertyRouter = express.Router();

// Anyone can search public active listings.
propertyRouter.get('/', validate(searchPropertiesSchema), listPropertiesController);
// Only logged-in users can create listings.
propertyRouter.post('/', authenticate, validate(createPropertySchema), createPropertyController);
// Anyone can view an active listing detail page.
propertyRouter.get('/:id', validate(propertyIdSchema), getPropertyController);
// Owner or admin can edit an active listing.
propertyRouter.patch('/:id', authenticate, validate(updatePropertySchema), updatePropertyController);
// Owner or admin can soft-delete an active listing.
propertyRouter.delete('/:id', authenticate, validate(propertyIdSchema), deletePropertyController);
