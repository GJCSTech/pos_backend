import { createCustomerSchema, updateCustomerSchema } from '../../src/validators/customer.schemas';

describe('customer.schemas', () => {
  it('createCustomerSchema still accepts outstandingBalance and loyaltyPoints', () => {
    const result = createCustomerSchema.parse({
      name: 'Walk-in Customer',
      code: 'CUST-1',
      outstandingBalance: 500,
      loyaltyPoints: 10,
    });

    expect(result.outstandingBalance).toBe(500);
    expect(result.loyaltyPoints).toBe(10);
  });

  it('updateCustomerSchema strips outstandingBalance and loyaltyPoints', () => {
    const result = updateCustomerSchema.parse({
      name: 'Renamed Customer',
      outstandingBalance: 99999,
      loyaltyPoints: 99999,
    });

    expect(result).not.toHaveProperty('outstandingBalance');
    expect(result).not.toHaveProperty('loyaltyPoints');
    expect(result.name).toBe('Renamed Customer');
  });

  it('updateCustomerSchema still allows other legitimate fields', () => {
    const result = updateCustomerSchema.parse({
      loyaltyReady: false,
      isActive: false,
    });

    expect(result.loyaltyReady).toBe(false);
    expect(result.isActive).toBe(false);
  });
});
