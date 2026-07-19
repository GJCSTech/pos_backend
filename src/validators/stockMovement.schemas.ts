import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
export const stockMovementTypeSchema = z.enum(['OPENING', 'PURCHASE', 'PURCHASE_RETURN', 'SALE', 'SALE_RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT']);
export const createStockMovementSchema = z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable().optional(), movementType: stockMovementTypeSchema, quantity: z.coerce.number().refine((n) => n !== 0), unitCost: z.coerce.number().min(0).optional(), referenceType: z.string().max(50).optional(), referenceId: z.string().uuid().optional(), batchNumber: z.string().max(100).nullable().optional(), serialNumber: z.string().max(100).nullable().optional(), notes: z.string().max(1000).optional(), occurredAt: z.coerce.date().optional() });
export const stockMovementListQuerySchema = listQuerySchema.extend({ productId: z.string().uuid().optional(), movementType: stockMovementTypeSchema.optional(), referenceId: z.string().uuid().optional() });
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type StockMovementListQuery = z.infer<typeof stockMovementListQuerySchema>;
