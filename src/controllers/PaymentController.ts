import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { PaymentService } from '../services/PaymentService';
import { ok } from '../types/api';
import type { CreatePaymentInput, PaymentListQuery } from '../validators/payment.schemas';

export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const payment = await this.service.create(req.user, req.body as CreatePaymentInput);
    res.status(201).json(ok({ payment }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(
      req.user,
      req.query as unknown as PaymentListQuery,
    );
    res.status(200).json(ok({ payments: result.items }, result.meta));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const payment = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ payment }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const payment = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ payment }));
  };
}
