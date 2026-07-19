import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
export const inventoryListQuerySchema = listQuerySchema.extend({ productId: z.string().uuid().optional(), variantId: z.string().uuid().optional(), batchNumber: z.string().max(100).optional() });
export const adjustStockSchema = z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable().optional(), quantity: z.coerce.number().refine((n) => n !== 0), unitCost: z.coerce.number().min(0).optional(), batchNumber: z.string().max(100).nullable().optional(), serialNumber: z.string().max(100).nullable().optional(), expiryDate: z.coerce.date().optional(), notes: z.string().max(1000).optional() });
export type InventoryListQuery = z.infer<typeof inventoryListQuerySchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
