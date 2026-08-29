import { conflict, notFound, validationError } from '../errors/AppError';
import type { IHoldBillRepository } from '../repositories/HoldBillRepository';
import type { SaleService } from './SaleService';
import type { AuthUser } from '../types/auth';
import { assertPermission } from '../utils/permissions';
import type { CreateHoldBillInput, HoldBillListQuery } from '../validators/holdBill.schemas';
import type { CreateSaleInput, SalePaymentInput } from '../validators/sale.schemas';

function buildHoldNumber(input?: string): string {
  return input?.trim() || `HLD-${Date.now()}`;
}

export class HoldBillService {
  constructor(
    private readonly holdBills: IHoldBillRepository,
    private readonly saleService: SaleService,
  ) {}

  async list(user: AuthUser, query: HoldBillListQuery) {
    assertPermission(user, 'sales.view');
    return this.holdBills.list(user.companyId, {
      ...query,
      branchId: query.branchId ?? user.branchId,
      isActive: query.isActive ?? true,
    });
  }

  async getById(user: AuthUser, id: string) {
    assertPermission(user, 'sales.view');
    const holdBill = await this.holdBills.findById(user.companyId, id);
    if (!holdBill) {
      throw notFound('Hold bill not found');
    }
    return holdBill;
  }

  async create(user: AuthUser, input: CreateHoldBillInput) {
    assertPermission(user, 'sales.manage');
    const db = this.holdBills.getClient();

    return db.$transaction(async (tx) => {
      let saleId = input.saleId;
      let customerId = input.customerId ?? null;

      if (!saleId) {
        if (!input.sale || typeof input.sale !== 'object') {
          throw validationError('Either saleId or sale payload is required');
        }
        const saleInput: CreateSaleInput = {
          ...input.sale!,
          status: 'HELD',
          customerId: customerId ?? input.sale?.customerId ?? null,
        };
        const sale = await this.saleService.create(user, saleInput, tx);
        saleId = sale.id;
        customerId = sale.customerId;
      } else {
        const existing = await tx.sale.findFirst({
          where: { id: saleId, companyId: user.companyId, deletedAt: null },
        });
        if (!existing) {
          throw notFound('Sale not found');
        }
        if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
          throw conflict(`Cannot hold sale in status ${existing.status}`);
        }
        await this.saleService.update(
          user,
          saleId,
          {
            status: 'HELD',
            customerId: customerId ?? existing.customerId,
          },
          tx,
        );
        customerId = customerId ?? existing.customerId;
      }

      return tx.holdBill.create({
        data: {
          company: { connect: { id: user.companyId } },
          branch: { connect: { id: user.branchId } },
          sale: { connect: { id: saleId } },
          ...(customerId ? { customer: { connect: { id: customerId } } } : {}),
          holdNumber: buildHoldNumber(input.holdNumber),
          referenceNote: input.referenceNote,
          expiresAt: input.expiresAt,
          heldAt: new Date(),
          isActive: true,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });
    });
  }

  async resume(user: AuthUser, id: string, payments: SalePaymentInput[]) {
    assertPermission(user, 'sales.manage');
    if (!payments.length) {
      throw validationError('Payments are required to resume a hold bill');
    }
    const db = this.holdBills.getClient();

    return db.$transaction(async (tx) => {
      const holdBill = await tx.holdBill.findFirst({
        where: { id, companyId: user.companyId, deletedAt: null },
      });
      if (!holdBill) {
        throw notFound('Hold bill not found');
      }
      if (!holdBill.isActive) {
        throw conflict('Hold bill is no longer active');
      }

      const sale = await this.saleService.complete(user, holdBill.saleId, payments, tx);
      const closed = await tx.holdBill.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          updatedBy: user.id,
          version: { increment: 1 },
        },
      });
      return { holdBill: closed, sale };
    });
  }

  async cancel(user: AuthUser, id: string) {
    assertPermission(user, 'sales.manage');
    const db = this.holdBills.getClient();

    return db.$transaction(async (tx) => {
      const holdBill = await tx.holdBill.findFirst({
        where: { id, companyId: user.companyId, deletedAt: null },
      });
      if (!holdBill) {
        throw notFound('Hold bill not found');
      }
      if (!holdBill.isActive) {
        throw conflict('Hold bill is no longer active');
      }

      await this.saleService.remove(user, holdBill.saleId, tx);
      return tx.holdBill.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          updatedBy: user.id,
          version: { increment: 1 },
        },
      });
    });
  }
}
