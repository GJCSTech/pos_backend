import type { Supplier, Prisma } from '@prisma/client';
import { notFound } from '../errors/AppError';
import type { ISupplierRepository } from '../repositories/SupplierRepository';
import type { AuthUser } from '../types/auth';
import type { PaginatedResult } from '../utils/pagination';
import { assertPermission } from '../utils/permissions';
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
  SupplierListQuery,
} from '../validators/supplier.schemas';

export class SupplierService {
  constructor(private readonly repo: ISupplierRepository) {}

  async create(user: AuthUser, input: CreateSupplierInput): Promise<Supplier> {
    assertPermission(user, 'supplier.manage');
    const { branchId, ...rest } = input;
    return this.repo.create({
      ...rest,
      company: { connect: { id: user.companyId } },
      branch: { connect: { id: branchId ?? user.branchId } },
      createdBy: user.id,
      updatedBy: user.id,
    } as Prisma.SupplierCreateInput);
  }

  async update(user: AuthUser, id: string, input: UpdateSupplierInput): Promise<Supplier> {
    assertPermission(user, 'supplier.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Supplier not found');
    }
    const { branchId, ...rest } = input;
    return this.repo.update(id, {
      ...rest,
      ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
      updatedBy: user.id,
    } as Prisma.SupplierUpdateInput);
  }

  async remove(user: AuthUser, id: string): Promise<Supplier> {
    assertPermission(user, 'supplier.manage');
    const existing = await this.repo.findById(user.companyId, id);
    if (!existing) {
      throw notFound('Supplier not found');
    }
    return this.repo.softDelete(id, user.id);
  }

  async getById(user: AuthUser, id: string): Promise<Supplier> {
    assertPermission(user, 'supplier.view');
    const item = await this.repo.findById(user.companyId, id);
    if (!item) {
      throw notFound('Supplier not found');
    }
    return item;
  }

  async list(user: AuthUser, query: SupplierListQuery): Promise<PaginatedResult<Supplier>> {
    assertPermission(user, 'supplier.view');
    return this.repo.list(user.companyId, query);
  }
}
