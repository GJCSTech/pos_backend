import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
export const createOpeningStockSchema = z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable().optional(), quantity: z.coerce.number().positive(), unitCost: z.coerce.number().min(0).default(0), batchNumber: z.string().max(100).nullable().optional(), serialNumber: z.string().max(100).nullable().optional(), expiryDate: z.coerce.date().optional(), notes: z.string().max(1000).optional(), stockedAt: z.coerce.date().optional() });
export const openingStockListQuerySchema = listQuerySchema.extend({ productId: z.string().uuid().optional(), isPosted: z.coerce.boolean().optional() });
export type CreateOpeningStockInput = z.infer<typeof createOpeningStockSchema>;
export type OpeningStockListQuery = z.infer<typeof openingStockListQuerySchema>;
