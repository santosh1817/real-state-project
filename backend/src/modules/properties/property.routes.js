import express from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { createPropertySchema, propertyIdSchema, searchPropertiesSchema, updatePropertySchema } from './property.schemas.js';
import { createProperty, deleteProperty, getProperty, getSimilarProperties, listProperties, updateProperty } from './property.service.js';

export const propertyRouter = express.Router();

propertyRouter.get('/', validate(searchPropertiesSchema), async (req, res, next) => {
  try {
    res.json(await listProperties(req.validated.query));
  } catch (error) {
    next(error);
  }
});

propertyRouter.post('/', authenticate, validate(createPropertySchema), async (req, res, next) => {
  try {
    res.status(201).json(await createProperty(req.user.id, req.validated.body));
  } catch (error) {
    next(error);
  }
});

propertyRouter.get('/:id', validate(propertyIdSchema), async (req, res, next) => {
  try {
    const property = await getProperty(req.validated.params.id);
    const similar = await getSimilarProperties(req.validated.params.id);
    res.json({ property, similar });
  } catch (error) {
    next(error);
  }
});

propertyRouter.patch('/:id', authenticate, validate(updatePropertySchema), async (req, res, next) => {
  try {
    res.json(await updateProperty(req.validated.params.id, req.user.id, req.validated.body));
  } catch (error) {
    next(error);
  }
});

propertyRouter.delete('/:id', authenticate, validate(propertyIdSchema), async (req, res, next) => {
  try {
    await deleteProperty(req.validated.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
