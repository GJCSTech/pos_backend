import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';

const item = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  quantity: z.coerce.number().positive().max(1_000_000),
  unitPrice: z.coerce.number().min(0).max(1_000_000_000),
  discountAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  batchNumber: z.string().max(100).nullable().optional(),
  serialNumber: z.string().max(100).nullable().optional(),
  expiryDate: z.coerce.date().optional(),
});

export const purchaseStatusSchema = z.enum([
  'DRAFT',
  'ORDERED',
  'PARTIAL',
  'RECEIVED',
  'CANCELLED',
]);

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid(),
  invoiceNumber: z.string().trim().max(100).optional(),
  invoiceDate: z.coerce.date(),
  status: purchaseStatusSchema.optional(),
  paidAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  notes: z.string().max(1000).optional(),
  items: z.array(item).min(1).max(500),
});

export const updatePurchaseSchema = createPurchaseSchema.partial().extend({
  items: z.array(item).min(1).max(500).optional(),
});

export const purchaseListQuerySchema = listQuerySchema.extend({
  supplierId: z.string().uuid().optional(),
  status: purchaseStatusSchema.optional(),
});

export type PurchaseItemInput = z.infer<typeof item>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type PurchaseListQuery = z.infer<typeof purchaseListQuerySchema>;
