import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Real Estate Platform API',
      version: '1.0.0',
      description: 'APIs for auth, property listings, search, similar properties, and inquiries.'
    },
    servers: [{ url: 'http://localhost:4000', description: 'Local API' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a user',
          requestBody: { required: true },
          responses: { 201: { description: 'Created' }, 409: { description: 'Email already registered' } }
        }
      },
      '/api/auth/login': {
        post: { tags: ['Auth'], summary: 'Login', responses: { 200: { description: 'Token pair' } } }
      },
      '/api/auth/refresh': {
        post: { tags: ['Auth'], summary: 'Rotate refresh token', responses: { 200: { description: 'New token pair' } } }
      },
      '/api/properties': {
        get: {
          tags: ['Properties'],
          summary: 'Search listings with filters, sorting, and cursor pagination',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'city', in: 'query', schema: { type: 'string' } },
            { name: 'propertyType', in: 'query', schema: { type: 'string' } },
            { name: 'bedrooms', in: 'query', schema: { type: 'integer' } },
            { name: 'minBudget', in: 'query', schema: { type: 'number' } },
            { name: 'maxBudget', in: 'query', schema: { type: 'number' } },
            { name: 'sort', in: 'query', schema: { enum: ['newest', 'price_asc', 'price_desc', 'area_desc'] } },
            { name: 'cursor', in: 'query', schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'Listings' } }
        },
        post: { tags: ['Properties'], security: [{ bearerAuth: [] }], summary: 'Create listing', responses: { 201: { description: 'Created' } } }
      },
      '/api/properties/{id}': {
        get: { tags: ['Properties'], summary: 'Property details with similar properties', responses: { 200: { description: 'Property detail' } } },
        patch: { tags: ['Properties'], security: [{ bearerAuth: [] }], summary: 'Edit own listing', responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Properties'], security: [{ bearerAuth: [] }], summary: 'Soft-delete own listing', responses: { 204: { description: 'Deleted' } } }
      },
      '/api/properties/{propertyId}/inquiries': {
        post: { tags: ['Inquiries'], security: [{ bearerAuth: [] }], summary: 'Contact property owner', responses: { 201: { description: 'Created' }, 409: { description: 'Duplicate inquiry' } } }
      },
      '/api/inquiries/mine': {
        get: { tags: ['Inquiries'], security: [{ bearerAuth: [] }], summary: 'View inquiries for my listings', responses: { 200: { description: 'Inquiries' } } }
      }
    }
  },
  apis: []
});
