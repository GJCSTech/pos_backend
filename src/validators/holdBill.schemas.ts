import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
export const createHoldBillSchema = z.object({ saleId: z.string().uuid().optional(), customerId: z.string().uuid().nullable().optional(), holdNumber: z.string().max(100).optional(), referenceNote: z.string().max(255).optional(), expiresAt: z.coerce.date().optional(), sale: z.unknown().optional() });
export const holdBillListQuerySchema = listQuerySchema.extend({ isActive: z.coerce.boolean().optional(), customerId: z.string().uuid().optional() });
export type CreateHoldBillInput = z.infer<typeof createHoldBillSchema>; export type HoldBillListQuery = z.infer<typeof holdBillListQuerySchema>;
