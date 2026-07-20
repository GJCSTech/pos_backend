import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { HoldBillService } from '../services/HoldBillService';
import { ok } from '../types/api';
import type { CreateHoldBillInput, HoldBillListQuery } from '../validators/holdBill.schemas';
import type { SalePaymentInput } from '../validators/sale.schemas';

export class HoldBillController {
  constructor(private readonly service: HoldBillService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const holdBill = await this.service.create(req.user, req.body as CreateHoldBillInput);
    res.status(201).json(ok({ holdBill }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(
      req.user,
      req.query as unknown as HoldBillListQuery,
    );
    res.status(200).json(ok({ holdBills: result.items }, result.meta));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const holdBill = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ holdBill }));
  };

  resume = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const payments = (req.body as { payments: SalePaymentInput[] }).payments ?? [];
    const result = await this.service.resume(req.user, String(req.params.id), payments);
    res.status(200).json(ok({ holdBill: result.holdBill, sale: result.sale }, 'Hold bill resumed'));
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const holdBill = await this.service.cancel(req.user, String(req.params.id));
    res.status(200).json(ok({ holdBill }));
  };
}
