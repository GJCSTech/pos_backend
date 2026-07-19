import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
const item = z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable().optional(), quantity: z.coerce.number().positive(), unitPrice: z.coerce.number().min(0), taxRate: z.coerce.number().min(0).optional(), discountAmount: z.coerce.number().min(0).optional(), batchNumber: z.string().max(100).nullable().optional(), serialNumber: z.string().max(100).nullable().optional() });
export const purchaseReturnStatusSchema = z.enum(['DRAFT', 'COMPLETED', 'CANCELLED']);
export const createPurchaseReturnSchema = z.object({ purchaseId: z.string().uuid(), returnNumber: z.string().max(100).optional(), status: purchaseReturnStatusSchema.optional(), reason: z.string().max(1000).optional(), items: z.array(item).min(1) });
export const updatePurchaseReturnSchema = createPurchaseReturnSchema.partial();
export const purchaseReturnListQuerySchema = listQuerySchema.extend({ purchaseId: z.string().uuid().optional(), status: purchaseReturnStatusSchema.optional() });
export type PurchaseReturnItemInput = z.infer<typeof item>; export type CreatePurchaseReturnInput = z.infer<typeof createPurchaseReturnSchema>; export type UpdatePurchaseReturnInput = z.infer<typeof updatePurchaseReturnSchema>; export type PurchaseReturnListQuery = z.infer<typeof purchaseReturnListQuerySchema>;
