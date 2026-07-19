type PathItem = Record<string, unknown>;

function crudPaths(
  basePath: string,
  tag: string,
  singular: string,
  createRef?: string,
): Record<string, PathItem> {
  const listPath = basePath;
  const idPath = `${basePath}/{id}`;
  return {
    [listPath]: {
      get: {
        tags: [tag],
        summary: `List ${singular}s`,
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/PageSize' },
          { $ref: '#/components/parameters/Search' },
          { $ref: '#/components/parameters/SortBy' },
          { $ref: '#/components/parameters/SortOrder' },
          { $ref: '#/components/parameters/BranchId' },
        ],
        responses: {
          200: { description: `${singular} list` },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
      post: {
        tags: [tag],
        summary: `Create ${singular}`,
        security: [{ bearerAuth: [] }],
        requestBody: createRef
          ? {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: createRef },
                },
              },
            }
          : {
              required: true,
              content: { 'application/json': { schema: { type: 'object' } } },
            },
        responses: {
          201: { description: `${singular} created` },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
        },
      },
    },
    [idPath]: {
      get: {
        tags: [tag],
        summary: `Get ${singular} by id`,
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: `${singular} found` },
          404: { description: 'Not found' },
        },
      },
      patch: {
        tags: [tag],
        summary: `Update ${singular}`,
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } },
        },
        responses: {
          200: { description: `${singular} updated` },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: [tag],
        summary: `Soft-delete ${singular}`,
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: { description: `${singular} deleted` },
          204: { description: `${singular} deleted` },
          404: { description: 'Not found' },
        },
      },
    },
  };
}

export const businessPaths: Record<string, PathItem> = {
  ...crudPaths('/product-categories', 'Catalog', 'product category'),
  ...crudPaths('/product-attributes', 'Catalog', 'product attribute'),
  ...crudPaths('/units', 'Catalog', 'unit'),
  ...crudPaths('/tax-masters', 'Catalog', 'tax master'),
  ...crudPaths('/suppliers', 'Suppliers', 'supplier'),
  ...crudPaths('/customer-groups', 'Customers', 'customer group'),
  ...crudPaths('/customers', 'Customers', 'customer'),
  ...crudPaths(
    '/products',
    'Catalog',
    'product',
    '#/components/schemas/CreateProductRequest',
  ),
  ...crudPaths('/product-variants', 'Catalog', 'product variant'),
  ...crudPaths('/business-settings', 'Settings', 'business setting'),

  '/inventories': {
    get: {
      tags: ['Inventory'],
      summary: 'List inventory rows',
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: '#/components/parameters/Page' },
        { $ref: '#/components/parameters/PageSize' },
        { $ref: '#/components/parameters/Search' },
        { $ref: '#/components/parameters/BranchId' },
      ],
      responses: { 200: { description: 'Inventory list' } },
    },
  },
  '/inventories/value': {
    get: {
      tags: ['Inventory'],
      summary: 'Calculate inventory value',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: { 200: { description: 'Inventory valuation' } },
    },
  },
  '/inventories/low-stock': {
    get: {
      tags: ['Inventory'],
      summary: 'List low-stock inventory',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: { 200: { description: 'Low stock list' } },
    },
  },
  '/inventories/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get inventory by id',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Inventory found' }, 404: { description: 'Not found' } },
    },
  },
  '/inventories/adjust': {
    post: {
      tags: ['Inventory'],
      summary: 'Adjust stock quantity',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdjustStockRequest' },
          },
        },
      },
      responses: { 200: { description: 'Stock adjusted' } },
    },
  },
  '/stock-movements': {
    get: {
      tags: ['Inventory'],
      summary: 'List stock movements',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Movement list' } },
    },
    post: {
      tags: ['Inventory'],
      summary: 'Create stock movement (adjustment)',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Movement applied' } },
    },
  },
  '/stock-movements/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get stock movement',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Movement found' } },
    },
  },
  '/opening-stocks': {
    get: {
      tags: ['Inventory'],
      summary: 'List opening stocks',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Opening stock list' } },
    },
    post: {
      tags: ['Inventory'],
      summary: 'Create opening stock',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Opening stock created' } },
    },
  },
  '/opening-stocks/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get opening stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Opening stock found' } },
    },
    delete: {
      tags: ['Inventory'],
      summary: 'Delete unposted opening stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/opening-stocks/{id}/post': {
    post: {
      tags: ['Inventory'],
      summary: 'Post opening stock to inventory',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Posted' } },
    },
  },
  '/purchases': {
    get: {
      tags: ['Purchases'],
      summary: 'List purchases',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Purchase list' } },
    },
    post: {
      tags: ['Purchases'],
      summary: 'Create purchase with items',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePurchaseRequest' },
          },
        },
      },
      responses: { 201: { description: 'Purchase created' } },
    },
  },
  '/purchases/{id}': {
    get: {
      tags: ['Purchases'],
      summary: 'Get purchase',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Purchase found' } },
    },
    patch: {
      tags: ['Purchases'],
      summary: 'Update purchase',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Purchases'],
      summary: 'Cancel/soft-delete purchase',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/purchases/{id}/receive': {
    post: {
      tags: ['Purchases'],
      summary: 'Mark purchase received and update stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Received' } },
    },
  },
  '/purchase-returns': {
    get: {
      tags: ['Purchases'],
      summary: 'List purchase returns',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Return list' } },
    },
    post: {
      tags: ['Purchases'],
      summary: 'Create purchase return',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Return created' } },
    },
  },
  '/purchase-returns/{id}': {
    get: {
      tags: ['Purchases'],
      summary: 'Get purchase return',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Return found' } },
    },
    patch: {
      tags: ['Purchases'],
      summary: 'Update purchase return',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Purchases'],
      summary: 'Cancel purchase return',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/purchase-returns/{id}/complete': {
    post: {
      tags: ['Purchases'],
      summary: 'Complete purchase return and reduce stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Completed' } },
    },
  },
  '/sales': {
    get: {
      tags: ['Sales'],
      summary: 'List sales',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Sale list' } },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create sale with items and optional split payments',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSaleRequest' },
          },
        },
      },
      responses: { 201: { description: 'Sale created' } },
    },
  },
  '/sales/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Sale found' } },
    },
    patch: {
      tags: ['Sales'],
      summary: 'Update sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Updated' } },
    },
    delete: {
      tags: ['Sales'],
      summary: 'Cancel sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/sales/{id}/complete': {
    post: {
      tags: ['Sales'],
      summary: 'Complete sale with payments and deduct stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Completed' } },
    },
  },
  '/hold-bills': {
    get: {
      tags: ['Sales'],
      summary: 'List hold bills',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Hold bill list' } },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create hold bill',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Hold bill created' } },
    },
  },
  '/hold-bills/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get hold bill',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Hold bill found' } },
    },
  },
  '/hold-bills/{id}/resume': {
    post: {
      tags: ['Sales'],
      summary: 'Resume hold bill into completed sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Resumed' } },
    },
  },
  '/hold-bills/{id}/cancel': {
    post: {
      tags: ['Sales'],
      summary: 'Cancel hold bill',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Cancelled' } },
    },
  },
  '/payments': {
    get: {
      tags: ['Sales'],
      summary: 'List payments',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Payment list' } },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create payment for sale or purchase',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Payment created' } },
    },
  },
  '/payments/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get payment',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Payment found' } },
    },
    delete: {
      tags: ['Sales'],
      summary: 'Refund/soft-delete payment',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
  '/receipt-settings': {
    get: {
      tags: ['Settings'],
      summary: 'Get receipt settings for branch',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: { 200: { description: 'Receipt settings' } },
    },
    put: {
      tags: ['Settings'],
      summary: 'Upsert receipt settings',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Upserted' } },
    },
    delete: {
      tags: ['Settings'],
      summary: 'Soft-delete receipt settings',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: { 200: { description: 'Deleted' } },
    },
  },
};
