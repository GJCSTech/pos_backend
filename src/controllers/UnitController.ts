import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { UnitService } from '../services/UnitService';
import { ok } from '../types/api';
import type {
  CreateUnitInput,
  UpdateUnitInput,
  UnitListQuery,
} from '../validators/unit.schemas';

export class UnitController {
  constructor(private readonly service: UnitService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateUnitInput);
    res.status(201).json(ok({ unit: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateUnitInput);
    res.status(200).json(ok({ unit: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ unit: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ unit: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as UnitListQuery);
    res.status(200).json(ok({ units: result.items }, result.meta));
  };
}
