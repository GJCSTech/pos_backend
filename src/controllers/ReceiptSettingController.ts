import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { ReceiptSettingService } from '../services/ReceiptSettingService';
import { ok } from '../types/api';
import type { UpsertReceiptSettingInput } from '../validators/receiptSetting.schemas';

export class ReceiptSettingController {
  constructor(private readonly service: ReceiptSettingService) {}

  get = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const branchId =
      typeof req.query.branchId === 'string' ? req.query.branchId : undefined;
    const receiptSetting = await this.service.get(req.user, branchId);
    res.status(200).json(ok({ receiptSetting }));
  };

  upsert = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const receiptSetting = await this.service.upsert(
      req.user,
      req.body as UpsertReceiptSettingInput,
    );
    res.status(200).json(ok({ receiptSetting }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const branchId =
      typeof req.query.branchId === 'string' ? req.query.branchId : undefined;
    const receiptSetting = await this.service.remove(req.user, branchId);
    res.status(200).json(ok({ receiptSetting }));
  };
}
