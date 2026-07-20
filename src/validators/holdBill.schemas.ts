import { z } from 'zod';
import { listQuerySchema } from '../utils/pagination';
import { saleBodySchema } from './sale.schemas';

export const createHoldBillSchema = z
  .object({
    saleId: z.string().uuid().optional(),
    customerId: z.string().uuid().nullable().optional(),
    holdNumber: z.string().trim().max(100).optional(),
    referenceNote: z.string().trim().max(255).optional(),
    expiresAt: z.coerce.date().optional(),
    sale: saleBodySchema.omit({ status: true, payments: true }).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.saleId && !value.sale) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either saleId or sale payload is required',
        path: ['saleId'],
      });
    }
  });

export const holdBillListQuerySchema = listQuerySchema.extend({
  customerId: z.string().uuid().optional(),
});

export type CreateHoldBillInput = z.infer<typeof createHoldBillSchema>;
export type HoldBillListQuery = z.infer<typeof holdBillListQuerySchema>;
