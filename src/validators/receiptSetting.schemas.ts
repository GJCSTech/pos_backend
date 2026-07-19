import { z } from 'zod';
export const upsertReceiptSettingSchema = z.object({
  headerText: z.string().max(500).nullable().optional(),
  footerText: z.string().max(500).nullable().optional(),
  showLogo: z.boolean().optional(),
  logoUrl: z.string().trim().max(500).nullable().optional(),
  showGstin: z.boolean().optional(),
  showAddress: z.boolean().optional(),
  showCustomerInfo: z.boolean().optional(),
  paperWidthMm: z.coerce.number().int().min(40).max(120).optional(),
  copies: z.coerce.number().int().min(1).max(10).optional(),
  extraSettings: z.unknown().optional(),
  isActive: z.boolean().optional(),
  branchId: z.string().uuid().optional(),
});
export type UpsertReceiptSettingInput = z.infer<typeof upsertReceiptSettingSchema>;
