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
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            statusCode: { type: 'integer', example: 400 },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Validation failed' },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string', example: 'body.email' },
                  message: { type: 'string', example: 'Invalid email' }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Demo User' },
            email: { type: 'string', example: 'user@example.com' },
            phone: { type: 'string', example: '+919999999999' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        AuthPayload: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            ownerId: { type: 'string' },
            ownerName: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            city: { type: 'string' },
            location: { type: 'string' },
            propertyType: { type: 'string', enum: ['apartment', 'villa', 'plot', 'independent-house', 'studio', 'commercial'] },
            listingType: { type: 'string', enum: ['sale', 'rent'] },
            price: { type: 'number' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            areaSqft: { type: 'integer' },
            imageUrls: { type: 'array', items: { type: 'string' } },
            amenities: { type: 'array', items: { type: 'string' } },
            status: { type: 'string' }
          }
        },
        PropertyInput: {
          type: 'object',
          required: ['title', 'description', 'city', 'location', 'propertyType', 'price', 'bedrooms', 'bathrooms', 'areaSqft'],
          properties: {
            title: { type: 'string', minLength: 8 },
            description: { type: 'string', minLength: 20 },
            city: { type: 'string' },
            location: { type: 'string' },
            address: { type: 'string' },
            propertyType: { type: 'string', enum: ['apartment', 'villa', 'plot', 'independent-house', 'studio', 'commercial'] },
            listingType: { type: 'string', enum: ['sale', 'rent'] },
            price: { type: 'number' },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            areaSqft: { type: 'integer' },
            imageUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
            amenities: { type: 'array', items: { type: 'string' } }
          }
        },
        Inquiry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            propertyId: { type: 'string' },
            buyerId: { type: 'string' },
            message: { type: 'string' },
            phone: { type: 'string' },
            status: { type: 'string', example: 'NEW' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Demo User' },
                    email: { type: 'string', format: 'email', example: 'user@example.com' },
                    password: { type: 'string', minLength: 8, example: 'Password123' },
                    phone: { type: 'string', example: '+919999999999' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }] } } } },
            409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Token pair' }, 401: { description: 'Invalid email or password' } }
        }
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
        post: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          summary: 'Create listing',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } } }
          },
          responses: { 201: { description: 'Created' }, 401: { description: 'Authentication required' } }
        }
      },
      '/api/properties/{id}': {
        get: { tags: ['Properties'], summary: 'Property details with similar properties', responses: { 200: { description: 'Property detail' } } },
        patch: {
          tags: ['Properties'],
          security: [{ bearerAuth: [] }],
          summary: 'Edit own listing',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } } } },
          responses: { 200: { description: 'Updated' } }
        },
        delete: { tags: ['Properties'], security: [{ bearerAuth: [] }], summary: 'Soft-delete own listing', responses: { 200: { description: 'Deleted' } } }
      },
      '/api/properties/{propertyId}/inquiries': {
        post: { tags: ['Inquiries'], security: [{ bearerAuth: [] }], summary: 'Contact property owner', responses: { 201: { description: 'Created' }, 409: { description: 'Duplicate inquiry' } } }
      },
      '/api/inquiries/mine': {
        get: { tags: ['Inquiries'], security: [{ bearerAuth: [] }], summary: 'View inquiries for my listings', responses: { 200: { description: 'Inquiries' } } }
      },
      '/api/uploads/images': {
        post: {
          tags: ['Uploads'],
          security: [{ bearerAuth: [] }],
          summary: 'Upload a property image',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: { image: { type: 'string', format: 'binary' } }
                }
              }
            }
          },
          responses: {
            201: { description: 'Uploaded image URL' },
            400: { description: 'Invalid file' },
            401: { description: 'Authentication required' }
          }
        }
      },
      '/api/admin/users': {
        get: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          summary: 'List users',
          responses: { 200: { description: 'Users' }, 403: { description: 'Admin access required' } }
        }
      },
      '/api/admin/users/{id}/role': {
        patch: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          summary: 'Update user role',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { role: { type: 'string', enum: ['USER', 'ADMIN'] } } } } }
          },
          responses: { 200: { description: 'Updated user' }, 403: { description: 'Admin access required' } }
        }
      },
      '/api/admin/users/{id}': {
        delete: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          summary: 'Delete a user',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Deleted' }, 403: { description: 'Admin access required' } }
        }
      },
      '/api/admin/properties': {
        get: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          summary: 'List all properties for admin',
          responses: { 200: { description: 'Properties' }, 403: { description: 'Admin access required' } }
        }
      },
      '/api/admin/properties/{id}': {
        delete: {
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          summary: 'Delete any active property as admin',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Deleted' }, 403: { description: 'Admin access required' } }
        }
      }
    }
  },
  apis: []
});
