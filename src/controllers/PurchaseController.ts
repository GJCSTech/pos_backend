import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { PurchaseService } from '../services/PurchaseService';
import { ok } from '../types/api';
import type {
  CreatePurchaseInput,
  PurchaseListQuery,
  UpdatePurchaseInput,
} from '../validators/purchase.schemas';

export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchase = await this.service.create(req.user, req.body as CreatePurchaseInput);
    res.status(201).json(ok({ purchase }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchase = await this.service.update(
      req.user,
      String(req.params.id),
      req.body as UpdatePurchaseInput,
    );
    res.status(200).json(ok({ purchase }));
  };

  receive = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchase = await this.service.receive(req.user, String(req.params.id));
    res.status(200).json(ok({ purchase }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchase = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ purchase }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchase = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ purchase }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(
      req.user,
      req.query as unknown as PurchaseListQuery,
    );
    res.status(200).json(ok({ purchases: result.items }, result.meta));
  };
}
