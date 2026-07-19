import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { PurchaseReturnService } from '../services/PurchaseReturnService';
import { ok } from '../types/api';
import type {
  CreatePurchaseReturnInput,
  PurchaseReturnListQuery,
  UpdatePurchaseReturnInput,
} from '../validators/purchaseReturn.schemas';

export class PurchaseReturnController {
  constructor(private readonly service: PurchaseReturnService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchaseReturn = await this.service.create(
      req.user,
      req.body as CreatePurchaseReturnInput,
    );
    res.status(201).json(ok({ purchaseReturn }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchaseReturn = await this.service.update(
      req.user,
      String(req.params.id),
      req.body as UpdatePurchaseReturnInput,
    );
    res.status(200).json(ok({ purchaseReturn }));
  };

  complete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchaseReturn = await this.service.complete(req.user, String(req.params.id));
    res.status(200).json(ok({ purchaseReturn }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchaseReturn = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ purchaseReturn }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const purchaseReturn = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ purchaseReturn }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(
      req.user,
      req.query as unknown as PurchaseReturnListQuery,
    );
    res.status(200).json(ok({ purchaseReturns: result.items }, result.meta));
  };
}
