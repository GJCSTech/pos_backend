import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';
import { businessPaths } from './businessPaths';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'VJ Garden POS Backend API',
    version: '0.2.1',
    description:
      'Production-ready API for the VJ Garden React Native POS. Standardized envelopes, pagination, filtering, and sync-friendly list queries. Sync engine remains a later release.',
    contact: {
      name: 'GJCSTech',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      description: 'Local development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      Page: {
        in: 'query',
        name: 'page',
        schema: { type: 'integer', minimum: 1, default: 1 },
        description: '1-based page index',
      },
      PageSize: {
        in: 'query',
        name: 'pageSize',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        description: 'Items per page (max 100)',
      },
      Search: {
        in: 'query',
        name: 'search',
        schema: { type: 'string', maxLength: 200 },
        description: 'Free-text search (fields vary by resource)',
      },
      SortBy: {
        in: 'query',
        name: 'sortBy',
        schema: { type: 'string' },
        description: 'Sort field (unsupported values fall back to createdAt)',
      },
      SortOrder: {
        in: 'query',
        name: 'sortOrder',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      },
      BranchId: {
        in: 'query',
        name: 'branchId',
        schema: { type: 'string', format: 'uuid' },
      },
      UpdatedSince: {
        in: 'query',
        name: 'updatedSince',
        schema: { type: 'string', format: 'date-time' },
        description: 'Incremental sync watermark — return rows with updatedAt >= value',
      },
      CreatedFrom: {
        in: 'query',
        name: 'createdFrom',
        schema: { type: 'string', format: 'date-time' },
      },
      CreatedTo: {
        in: 'query',
        name: 'createdTo',
        schema: { type: 'string', format: 'date-time' },
      },
      IdPath: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    },
    schemas: {
      PaginationMeta: {
        type: 'object',
        required: ['page', 'pageSize', 'total', 'totalPages', 'hasNext', 'hasPrev'],
        properties: {
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 3 },
          hasNext: { type: 'boolean', example: true },
          hasPrev: { type: 'boolean', example: false },
        },
      },
      ApiSuccess: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
        example: {
          success: true,
          message: 'Success',
          data: { id: '11111111-1111-4111-8111-111111111111' },
          meta: {
            page: 1,
            pageSize: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      },
      ApiError: {
        type: 'object',
        required: ['success', 'message', 'errors'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Request validation failed' },
          errors: {
            type: 'object',
            required: ['code'],
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
                enum: [
                  'VALIDATION_ERROR',
                  'AUTH_INVALID',
                  'AUTH_UNAUTHORIZED',
                  'AUTH_FORBIDDEN',
                  'AUTH_TOKEN_EXPIRED',
                  'AUTH_TOKEN_INVALID',
                  'AUTH_ACCOUNT_LOCKED',
                  'NOT_FOUND',
                  'CONFLICT',
                  'RATE_LIMITED',
                  'INTERNAL_ERROR',
                  'SERVICE_UNAVAILABLE',
                ],
              },
              details: {},
              requestId: { type: 'string', format: 'uuid' },
            },
          },
        },
        example: {
          success: false,
          message: 'Request validation failed',
          errors: {
            code: 'VALIDATION_ERROR',
            details: { fieldErrors: { name: ['Required'] } },
            requestId: '22222222-2222-4222-8222-222222222222',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['usernameOrEmail', 'password'],
        properties: {
          usernameOrEmail: { type: 'string', example: 'admin' },
          password: { type: 'string', format: 'password', example: 'ChangeMeAdmin!2026' },
          companyCode: { type: 'string', example: 'VJGARDEN' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      RegisterDeviceRequest: {
        type: 'object',
        required: ['deviceUuid', 'deviceName', 'appVersion'],
        properties: {
          deviceUuid: { type: 'string', format: 'uuid' },
          platform: {
            type: 'string',
            enum: ['ANDROID', 'IOS', 'WEB', 'UNKNOWN'],
            default: 'ANDROID',
          },
          deviceName: { type: 'string', example: 'Counter Tablet 1' },
          appVersion: { type: 'string', example: '0.22.0' },
          branchId: { type: 'string', format: 'uuid' },
          metadata: { type: 'object', additionalProperties: true },
        },
      },
      Money: { type: 'number', example: 199.99, minimum: 0 },
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'code', 'sku'],
        properties: {
          name: { type: 'string', maxLength: 255, example: 'Garden Rose Bouquet' },
          code: { type: 'string', maxLength: 50, example: 'PRD-ROSE-01' },
          sku: { type: 'string', maxLength: 100, example: 'SKU-ROSE-01' },
          barcode: { type: 'string', nullable: true },
          purchasePrice: { $ref: '#/components/schemas/Money' },
          mrp: { $ref: '#/components/schemas/Money' },
          sellingPrice: { $ref: '#/components/schemas/Money' },
          wholesalePrice: { $ref: '#/components/schemas/Money' },
          trackInventory: { type: 'boolean', default: true },
          isActive: { type: 'boolean', default: true },
        },
      },
      CreatePurchaseRequest: {
        type: 'object',
        required: ['supplierId', 'invoiceDate', 'items'],
        properties: {
          supplierId: { type: 'string', format: 'uuid' },
          invoiceNumber: { type: 'string', example: 'INV-2026-001' },
          invoiceDate: { type: 'string', format: 'date', example: '2026-07-19' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED'],
          },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity', 'unitPrice'],
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'number', exclusiveMinimum: 0, example: 10 },
                unitPrice: { type: 'number', minimum: 0, example: 50 },
                taxRate: { type: 'number', minimum: 0, maximum: 100, example: 18 },
                discountAmount: { type: 'number', minimum: 0 },
              },
            },
          },
        },
      },
      CreateSaleRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          customerId: { type: 'string', format: 'uuid', nullable: true },
          status: {
            type: 'string',
            enum: ['DRAFT', 'HELD', 'COMPLETED', 'CANCELLED', 'RETURNED'],
            example: 'COMPLETED',
          },
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity', 'unitPrice'],
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'number', exclusiveMinimum: 0, example: 1 },
                unitPrice: { type: 'number', minimum: 0, example: 199.99 },
                taxRate: { type: 'number', minimum: 0, maximum: 100 },
                discountAmount: { type: 'number', minimum: 0 },
              },
            },
          },
          payments: {
            type: 'array',
            description: 'Required when status is COMPLETED',
            items: {
              type: 'object',
              required: ['method', 'amount'],
              properties: {
                method: {
                  type: 'string',
                  enum: ['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER'],
                  example: 'UPI',
                },
                amount: { type: 'number', exclusiveMinimum: 0, example: 199.99 },
                referenceNo: { type: 'string', example: 'UPI-REF-001' },
              },
            },
          },
        },
      },
      AdjustStockRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', format: 'uuid' },
          variantId: { type: 'string', format: 'uuid', nullable: true },
          quantity: {
            type: 'number',
            description: 'Signed quantity delta (non-zero)',
            example: -2,
          },
          unitCost: { type: 'number', minimum: 0 },
          notes: { type: 'string', maxLength: 1000 },
        },
      },
      CreateHoldBillRequest: {
        type: 'object',
        properties: {
          saleId: { type: 'string', format: 'uuid' },
          holdNumber: { type: 'string', example: 'HLD-001' },
          referenceNote: { type: 'string' },
          sale: { $ref: '#/components/schemas/CreateSaleRequest' },
        },
        description: 'Provide either saleId or sale payload',
      },
      ResumeHoldBillRequest: {
        type: 'object',
        required: ['payments'],
        properties: {
          payments: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['method', 'amount'],
              properties: {
                method: {
                  type: 'string',
                  enum: ['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER'],
                },
                amount: { type: 'number', exclusiveMinimum: 0 },
              },
            },
          },
        },
      },
      CreatePaymentRequest: {
        type: 'object',
        required: ['targetType', 'method', 'amount'],
        properties: {
          targetType: { type: 'string', enum: ['SALE', 'PURCHASE'] },
          saleId: { type: 'string', format: 'uuid' },
          purchaseId: { type: 'string', format: 'uuid' },
          method: {
            type: 'string',
            enum: ['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER'],
          },
          amount: { type: 'number', exclusiveMinimum: 0 },
          referenceNo: { type: 'string' },
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      Unauthorized: {
        description: 'Missing or invalid JWT',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
            example: {
              success: false,
              message: 'Unauthorized',
              errors: { code: 'AUTH_UNAUTHORIZED' },
            },
          },
        },
      },
      Forbidden: {
        description: 'Missing permission',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      Conflict: {
        description: 'Business rule or unique constraint conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Liveness and readiness' },
    { name: 'Auth', description: 'JWT authentication' },
    { name: 'Devices', description: 'POS device registry' },
    { name: 'Catalog', description: 'Categories, attributes, products, variants, units, taxes' },
    { name: 'Suppliers', description: 'Supplier master' },
    { name: 'Customers', description: 'Customers and customer groups' },
    { name: 'Inventory', description: 'Stock, movements, opening stock, valuation' },
    { name: 'Purchases', description: 'Purchases and purchase returns' },
    { name: 'Sales', description: 'Sales, hold bills, and payments' },
    { name: 'Settings', description: 'Business and receipt settings' },
  ],
  paths: businessPaths,
};

export const openApiSpec = swaggerJsdoc({
  definition,
  apis: ['./src/routes/**/*.ts', './dist/routes/**/*.js'],
});
