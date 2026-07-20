type PathItem = Record<string, unknown>;

const listParams = [
  { $ref: '#/components/parameters/Page' },
  { $ref: '#/components/parameters/PageSize' },
  { $ref: '#/components/parameters/Search' },
  { $ref: '#/components/parameters/SortBy' },
  { $ref: '#/components/parameters/SortOrder' },
  { $ref: '#/components/parameters/BranchId' },
  { $ref: '#/components/parameters/UpdatedSince' },
  { $ref: '#/components/parameters/CreatedFrom' },
  { $ref: '#/components/parameters/CreatedTo' },
];

const standardErrors = {
  400: { $ref: '#/components/responses/ValidationError' },
  401: { $ref: '#/components/responses/Unauthorized' },
  403: { $ref: '#/components/responses/Forbidden' },
  404: { $ref: '#/components/responses/NotFound' },
  409: { $ref: '#/components/responses/Conflict' },
};

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
        description: `Paginated list of ${singular}s with search, sort, branch, and sync date filters.`,
        security: [{ bearerAuth: [] }],
        parameters: listParams,
        responses: {
          200: {
            description: `${singular} list`,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          ...standardErrors,
        },
      },
      post: {
        tags: [tag],
        summary: `Create ${singular}`,
        description: `Create a new ${singular}.`,
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
          201: {
            description: `${singular} created`,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          ...standardErrors,
        },
      },
    },
    [idPath]: {
      get: {
        tags: [tag],
        summary: `Get ${singular} by id`,
        description: `Fetch a single ${singular} by UUID.`,
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: {
            description: `${singular} found`,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          ...standardErrors,
        },
      },
      patch: {
        tags: [tag],
        summary: `Update ${singular}`,
        description: `Partial update of a ${singular}.`,
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: createRef ? { $ref: createRef } : { type: 'object' },
            },
          },
        },
        responses: {
          200: {
            description: `${singular} updated`,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          ...standardErrors,
        },
      },
      delete: {
        tags: [tag],
        summary: `Soft-delete ${singular}`,
        description: `Soft-deletes the ${singular} (sets deletedAt). Returns the deleted resource in the success envelope.`,
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/IdPath' }],
        responses: {
          200: {
            description: `${singular} deleted`,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiSuccess' },
              },
            },
          },
          ...standardErrors,
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
      description: 'Paginated on-hand stock with product/variant includes.',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Inventory list' }, ...standardErrors },
    },
  },
  '/inventories/value': {
    get: {
      tags: ['Inventory'],
      summary: 'Calculate inventory value',
      description: 'Returns branch inventory valuation (qty × averageCost).',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: {
        200: {
          description: 'Inventory valuation',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Inventory valuation calculated',
                data: {
                  valuation: {
                    branchId: '33333333-3333-4333-8333-333333333333',
                    inventoryValue: 15000.5,
                  },
                },
              },
            },
          },
        },
        ...standardErrors,
      },
    },
  },
  '/inventories/low-stock': {
    get: {
      tags: ['Inventory'],
      summary: 'List low-stock inventory',
      description:
        'Paginated rows where quantity <= reorderLevel (or minimumStock when reorderLevel is 0).',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Low stock list' }, ...standardErrors },
    },
  },
  '/inventories/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get inventory by id',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Inventory found' }, ...standardErrors },
    },
  },
  '/inventories/adjust': {
    post: {
      tags: ['Inventory'],
      summary: 'Adjust stock quantity',
      description: 'Applies a signed stock adjustment inside a transaction.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdjustStockRequest' },
            example: {
              productId: '11111111-1111-4111-8111-111111111111',
              quantity: -2,
              notes: 'Damaged stock',
            },
          },
        },
      },
      responses: { 200: { description: 'Stock adjusted' }, ...standardErrors },
    },
  },
  '/stock-movements': {
    get: {
      tags: ['Inventory'],
      summary: 'List stock movements',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Movement list' }, ...standardErrors },
    },
    post: {
      tags: ['Inventory'],
      summary: 'Create stock movement (adjustment)',
      description: 'Creates an adjustment movement and returns updated inventory.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AdjustStockRequest' },
          },
        },
      },
      responses: { 201: { description: 'Movement applied' }, ...standardErrors },
    },
  },
  '/stock-movements/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get stock movement',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Movement found' }, ...standardErrors },
    },
  },
  '/opening-stocks': {
    get: {
      tags: ['Inventory'],
      summary: 'List opening stocks',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Opening stock list' }, ...standardErrors },
    },
    post: {
      tags: ['Inventory'],
      summary: 'Create opening stock',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Opening stock created' }, ...standardErrors },
    },
  },
  '/opening-stocks/{id}': {
    get: {
      tags: ['Inventory'],
      summary: 'Get opening stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Opening stock found' }, ...standardErrors },
    },
    delete: {
      tags: ['Inventory'],
      summary: 'Delete unposted opening stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' }, ...standardErrors },
    },
  },
  '/opening-stocks/{id}/post': {
    post: {
      tags: ['Inventory'],
      summary: 'Post opening stock to inventory',
      description: 'Posts opening stock as OPENING movement and updates on-hand qty.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Posted' }, ...standardErrors },
    },
  },
  '/purchases': {
    get: {
      tags: ['Purchases'],
      summary: 'List purchases',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...listParams,
        {
          in: 'query',
          name: 'supplierId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED'],
          },
        },
      ],
      responses: { 200: { description: 'Purchase list' }, ...standardErrors },
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
      responses: { 201: { description: 'Purchase created' }, ...standardErrors },
    },
  },
  '/purchases/{id}': {
    get: {
      tags: ['Purchases'],
      summary: 'Get purchase',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Purchase found' }, ...standardErrors },
    },
    patch: {
      tags: ['Purchases'],
      summary: 'Update purchase',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Updated' }, ...standardErrors },
    },
    delete: {
      tags: ['Purchases'],
      summary: 'Cancel/soft-delete purchase',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' }, ...standardErrors },
    },
  },
  '/purchases/{id}/receive': {
    post: {
      tags: ['Purchases'],
      summary: 'Mark purchase received and update stock',
      description:
        'Receives purchase lines into inventory (PURCHASE movements) and updates supplier outstanding balance.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Received' }, ...standardErrors },
    },
  },
  '/purchase-returns': {
    get: {
      tags: ['Purchases'],
      summary: 'List purchase returns',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Return list' }, ...standardErrors },
    },
    post: {
      tags: ['Purchases'],
      summary: 'Create purchase return',
      description:
        'Creates a purchase return. Completing validates return qty against remaining returnable quantity.',
      security: [{ bearerAuth: [] }],
      responses: { 201: { description: 'Return created' }, ...standardErrors },
    },
  },
  '/purchase-returns/{id}': {
    get: {
      tags: ['Purchases'],
      summary: 'Get purchase return',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Return found' }, ...standardErrors },
    },
    patch: {
      tags: ['Purchases'],
      summary: 'Update purchase return',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Updated' }, ...standardErrors },
    },
    delete: {
      tags: ['Purchases'],
      summary: 'Cancel purchase return',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' }, ...standardErrors },
    },
  },
  '/purchase-returns/{id}/complete': {
    post: {
      tags: ['Purchases'],
      summary: 'Complete purchase return and reduce stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Completed' }, ...standardErrors },
    },
  },
  '/sales': {
    get: {
      tags: ['Sales'],
      summary: 'List sales',
      security: [{ bearerAuth: [] }],
      parameters: [
        ...listParams,
        {
          in: 'query',
          name: 'customerId',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['DRAFT', 'HELD', 'COMPLETED', 'CANCELLED', 'RETURNED'],
          },
        },
      ],
      responses: { 200: { description: 'Sale list' }, ...standardErrors },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create sale with items and optional split payments',
      description:
        'Create a sale. When status=COMPLETED, payments[] is required and stock is deducted.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSaleRequest' },
          },
        },
      },
      responses: { 201: { description: 'Sale created' }, ...standardErrors },
    },
  },
  '/sales/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Sale found' }, ...standardErrors },
    },
    patch: {
      tags: ['Sales'],
      summary: 'Update sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Updated' }, ...standardErrors },
    },
    delete: {
      tags: ['Sales'],
      summary: 'Cancel sale',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' }, ...standardErrors },
    },
  },
  '/sales/{id}/complete': {
    post: {
      tags: ['Sales'],
      summary: 'Complete sale with payments and deduct stock',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResumeHoldBillRequest' },
          },
        },
      },
      responses: { 200: { description: 'Completed' }, ...standardErrors },
    },
  },
  '/hold-bills': {
    get: {
      tags: ['Sales'],
      summary: 'List hold bills',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Hold bill list' }, ...standardErrors },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create hold bill',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateHoldBillRequest' },
          },
        },
      },
      responses: { 201: { description: 'Hold bill created' }, ...standardErrors },
    },
  },
  '/hold-bills/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get hold bill',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Hold bill found' }, ...standardErrors },
    },
  },
  '/hold-bills/{id}/resume': {
    post: {
      tags: ['Sales'],
      summary: 'Resume hold bill into completed sale',
      description: 'Completes the linked sale with payments and closes the hold bill.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ResumeHoldBillRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Resumed',
          content: {
            'application/json': {
              example: {
                success: true,
                message: 'Hold bill resumed',
                data: { holdBill: {}, sale: {} },
              },
            },
          },
        },
        ...standardErrors,
      },
    },
  },
  '/hold-bills/{id}/cancel': {
    post: {
      tags: ['Sales'],
      summary: 'Cancel hold bill',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Cancelled' }, ...standardErrors },
    },
  },
  '/payments': {
    get: {
      tags: ['Sales'],
      summary: 'List payments',
      security: [{ bearerAuth: [] }],
      parameters: listParams,
      responses: { 200: { description: 'Payment list' }, ...standardErrors },
    },
    post: {
      tags: ['Sales'],
      summary: 'Create payment for sale or purchase',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePaymentRequest' },
          },
        },
      },
      responses: { 201: { description: 'Payment created' }, ...standardErrors },
    },
  },
  '/payments/{id}': {
    get: {
      tags: ['Sales'],
      summary: 'Get payment',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Payment found' }, ...standardErrors },
    },
    delete: {
      tags: ['Sales'],
      summary: 'Refund/soft-delete payment',
      description:
        'Soft-deletes/refunds a payment record. Full financial reversal of sale/purchase totals is a follow-up hardening item.',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/IdPath' }],
      responses: { 200: { description: 'Deleted' }, ...standardErrors },
    },
  },
  '/receipt-settings': {
    get: {
      tags: ['Settings'],
      summary: 'Get receipt settings for branch',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: { 200: { description: 'Receipt settings' }, ...standardErrors },
    },
    put: {
      tags: ['Settings'],
      summary: 'Upsert receipt settings',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'Upserted' }, ...standardErrors },
    },
    delete: {
      tags: ['Settings'],
      summary: 'Soft-delete receipt settings',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/BranchId' }],
      responses: { 200: { description: 'Deleted' }, ...standardErrors },
    },
  },
};
