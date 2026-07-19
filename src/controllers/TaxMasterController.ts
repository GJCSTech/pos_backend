import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { TaxMasterService } from '../services/TaxMasterService';
import { ok } from '../types/api';
import type {
  CreateTaxMasterInput,
  UpdateTaxMasterInput,
  TaxMasterListQuery,
} from '../validators/taxMaster.schemas';

export class TaxMasterController {
  constructor(private readonly service: TaxMasterService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateTaxMasterInput);
    res.status(201).json(ok({ taxMaster: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateTaxMasterInput);
    res.status(200).json(ok({ taxMaster: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ taxMaster: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ taxMaster: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as TaxMasterListQuery);
    res.status(200).json(ok({ taxMasters: result.items }, result.meta));
  };
}
