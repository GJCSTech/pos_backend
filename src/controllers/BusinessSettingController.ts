import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { BusinessSettingService } from '../services/BusinessSettingService';
import { ok } from '../types/api';
import type {
  CreateBusinessSettingInput,
  UpdateBusinessSettingInput,
  BusinessSettingListQuery,
} from '../validators/businessSetting.schemas';

export class BusinessSettingController {
  constructor(private readonly service: BusinessSettingService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateBusinessSettingInput);
    res.status(201).json(ok({ businessSetting: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateBusinessSettingInput);
    res.status(200).json(ok({ businessSetting: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ businessSetting: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ businessSetting: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as BusinessSettingListQuery);
    res.status(200).json(ok({ businessSettings: result.items }, result.meta));
  };
}
