import type { CustomerGroup, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { ICustomerGroupRepository } from '../repositories/CustomerGroupRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateCustomerGroupInput,
  UpdateCustomerGroupInput,
  CustomerGroupListQuery,
} from '../validators/customerGroup.schemas';

export class CustomerGroupService {
  constructor(private readonly repo: ICustomerGroupRepository) {}

  async create(user: AuthUser, input: CreateCustomerGroupInput): Promise<CustomerGroup> {
    assertPermission(user, 'customer.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.CustomerGroupCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateCustomerGroupInput): Promise<CustomerGroup> {
    assertPermission(user, 'customer.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('CustomerGroup not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.CustomerGroupUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<CustomerGroup> {
    assertPermission(user, 'customer.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('CustomerGroup not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<CustomerGroup> {
    assertPermission(user, 'customer.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('CustomerGroup not found');
    }
    return item;
  }

  async list(user: AuthUser, query: CustomerGroupListQuery): Promise<PaginatedResult<CustomerGroup>> {
    assertPermission(user, 'customer.view');
    return this.repo.list(user.companyId, query);
  }
}
