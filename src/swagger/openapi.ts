import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';
import { businessPaths } from './businessPaths';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'VJ Garden POS Backend API',
    version: '0.2.0',
    description:
      'Centralized API for authentication, device registry, and enterprise POS business operations (catalog, inventory, purchase, sales). Sync engine is planned for a later release.',
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
      },
      PageSize: {
        in: 'query',
        name: 'pageSize',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      },
      Search: {
        in: 'query',
        name: 'search',
        schema: { type: 'string' },
      },
      SortBy: {
        in: 'query',
        name: 'sortBy',
        schema: { type: 'string' },
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
      IdPath: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['usernameOrEmail', 'password'],
        properties: {
          usernameOrEmail: { type: 'string', example: 'admin' },
          password: { type: 'string', format: 'password' },
          companyCode: { type: 'string', example: 'VJGARDEN' },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
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
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: {},
              requestId: { type: 'string', format: 'uuid' },
            },
          },
        },
      },
      Money: { type: 'number', example: 199.99 },
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'code', 'sku'],
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          sku: { type: 'string' },
          barcode: { type: 'string', nullable: true },
          qrCode: { type: 'string', nullable: true },
          purchasePrice: { $ref: '#/components/schemas/Money' },
          mrp: { $ref: '#/components/schemas/Money' },
          sellingPrice: { $ref: '#/components/schemas/Money' },
          wholesalePrice: { $ref: '#/components/schemas/Money' },
          trackInventory: { type: 'boolean' },
          isActive: { type: 'boolean' },
        },
      },
      CreatePurchaseRequest: {
        type: 'object',
        required: ['supplierId', 'invoiceDate', 'items'],
        properties: {
          supplierId: { type: 'string', format: 'uuid' },
          invoiceNumber: { type: 'string' },
          invoiceDate: { type: 'string', format: 'date' },
          status: {
            type: 'string',
            enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED'],
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantity', 'unitPrice'],
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' },
                taxRate: { type: 'number' },
                discountAmount: { type: 'number' },
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
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              required: ['productId', 'quantity', 'unitPrice'],
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' },
                taxRate: { type: 'number' },
                discountAmount: { type: 'number' },
              },
            },
          },
          payments: {
            type: 'array',
            items: {
              type: 'object',
              required: ['method', 'amount'],
              properties: {
                method: {
                  type: 'string',
                  enum: ['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER'],
                },
                amount: { type: 'number' },
                referenceNo: { type: 'string' },
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
          quantity: { type: 'number', description: 'Signed quantity delta' },
          unitCost: { type: 'number' },
          notes: { type: 'string' },
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
