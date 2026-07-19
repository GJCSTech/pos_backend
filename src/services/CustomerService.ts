import type { Customer, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { ICustomerRepository } from '../repositories/CustomerRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListQuery,
} from '../validators/customer.schemas';

export class CustomerService {
  constructor(private readonly repo: ICustomerRepository) {}

  async create(user: AuthUser, input: CreateCustomerInput): Promise<Customer> {
    assertPermission(user, 'customer.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.CustomerCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateCustomerInput): Promise<Customer> {
    assertPermission(user, 'customer.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Customer not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.CustomerUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<Customer> {
    assertPermission(user, 'customer.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Customer not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<Customer> {
    assertPermission(user, 'customer.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('Customer not found');
    }
    return item;
  }

  async list(user: AuthUser, query: CustomerListQuery): Promise<PaginatedResult<Customer>> {
    assertPermission(user, 'customer.view');
    return this.repo.list(user.companyId, query);
  }
}
