import { z } from 'zod';

export const devicePlatformSchema = z.enum(['ANDROID', 'IOS', 'WEB', 'UNKNOWN']);

export const registerDeviceSchema = z.object({
  deviceUuid: z.string().uuid(),
  platform: devicePlatformSchema.default('ANDROID'),
  deviceName: z.string().trim().min(1).max(200),
  appVersion: z.string().trim().min(1).max(50),
  branchId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
