import { createSupplierSchema, updateSupplierSchema } from '../../src/validators/supplier.schemas';

describe('supplier.schemas', () => {
  it('createSupplierSchema still accepts outstandingBalance', () => {
    const result = createSupplierSchema.parse({
      name: 'Acme Supplies',
      code: 'SUP-1',
      outstandingBalance: 1200,
    });

    expect(result.outstandingBalance).toBe(1200);
  });

  it('updateSupplierSchema strips outstandingBalance', () => {
    const result = updateSupplierSchema.parse({
      name: 'Renamed Supplier',
      outstandingBalance: 99999,
    });

    expect(result).not.toHaveProperty('outstandingBalance');
    expect(result.name).toBe('Renamed Supplier');
  });

  it('updateSupplierSchema still allows other legitimate fields', () => {
    const result = updateSupplierSchema.parse({
      isActive: false,
      paymentTerms: 'Net 30',
    });

    expect(result.isActive).toBe(false);
    expect(result.paymentTerms).toBe('Net 30');
  });
});
