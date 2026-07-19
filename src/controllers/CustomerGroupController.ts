import type { Request, Response } from 'express';
import { unauthorized } from '../errors/AppError';
import type { CustomerGroupService } from '../services/CustomerGroupService';
import { ok } from '../types/api';
import type {
  CreateCustomerGroupInput,
  UpdateCustomerGroupInput,
  CustomerGroupListQuery,
} from '../validators/customerGroup.schemas';

export class CustomerGroupController {
  constructor(private readonly service: CustomerGroupService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.create(req.user, req.body as CreateCustomerGroupInput);
    res.status(201).json(ok({ customerGroup: item }));
  };

  update = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.update(req.user, String(req.params.id), req.body as UpdateCustomerGroupInput);
    res.status(200).json(ok({ customerGroup: item }));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.remove(req.user, String(req.params.id));
    res.status(200).json(ok({ customerGroup: item }));
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const item = await this.service.getById(req.user, String(req.params.id));
    res.status(200).json(ok({ customerGroup: item }));
  };

  list = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) throw unauthorized();
    const result = await this.service.list(req.user, req.query as unknown as CustomerGroupListQuery);
    res.status(200).json(ok({ customerGroups: result.items }, result.meta));
  };
}
