import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { CustomerService } from '../services/CustomerService';
import { ok } from '../types/api';
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListQuery,
} from '../validators/customer.schemas';

export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateCustomerInput);
    res.status(201).json(ok({ customer: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateCustomerInput);
    res.status(200).json(ok({ customer: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ customer: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ customer: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as CustomerListQuery);
    res.status(200).json(ok({ customers: result.items }, result.meta));
  };
}
