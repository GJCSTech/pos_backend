import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
const item = z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable().optional(), unitId: z.string().uuid().nullable().optional(), quantity: z.coerce.number().positive(), unitPrice: z.coerce.number().min(0), discountAmount: z.coerce.number().min(0).optional(), taxRate: z.coerce.number().min(0).optional(), batchNumber: z.string().max(100).nullable().optional(), serialNumber: z.string().max(100).nullable().optional() });
const payment = z.object({ method: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER']), amount: z.coerce.number().positive(), referenceNo: z.string().max(100).optional(), notes: z.string().max(500).optional() });
export const saleStatusSchema = z.enum(['DRAFT', 'HELD', 'COMPLETED', 'CANCELLED', 'RETURNED']);
export const createSaleSchema = z.object({ customerId: z.string().uuid().nullable().optional(), billNumber: z.string().max(100).optional(), status: saleStatusSchema.optional(), notes: z.string().max(1000).optional(), items: z.array(item).min(1), payments: z.array(payment).optional() });
export const updateSaleSchema = createSaleSchema.partial().extend({ items: z.array(item).min(1).optional(), payments: z.array(payment).optional() });
export const saleListQuerySchema = listQuerySchema.extend({ customerId: z.string().uuid().optional(), status: saleStatusSchema.optional() });
export type SaleItemInput = z.infer<typeof item>; export type SalePaymentInput = z.infer<typeof payment>; export type CreateSaleInput = z.infer<typeof createSaleSchema>; export type UpdateSaleInput = z.infer<typeof updateSaleSchema>; export type SaleListQuery = z.infer<typeof saleListQuerySchema>;
