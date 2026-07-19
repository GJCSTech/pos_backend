import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { SaleService } from '../services/SaleService';
import { ok } from '../types/api';
import type {
  CreateSaleInput,
  SaleListQuery,
  SalePaymentInput,
  UpdateSaleInput,
} from '../validators/sale.schemas';

export class SaleController {
  constructor(private readonly service: SaleService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const sale = await this.service.create(req.user, req.body as CreateSaleInput);
    res.status(201).json(ok({ sale }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const sale = await this.service.update(
      req.user,
      String(req.params.id),
      req.body as UpdateSaleInput,
    );
    res.status(200).json(ok({ sale }));
  };

  complete = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const payments = (req.body as { payments?: SalePaymentInput[] }).payments;
    const sale = await this.service.complete(req.user, String(req.params.id), payments);
    res.status(200).json(ok({ sale }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const sale = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ sale }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const sale = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ sale }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as SaleListQuery);
    res.status(200).json(ok({ sales: result.items }, result.meta));
  };
}
