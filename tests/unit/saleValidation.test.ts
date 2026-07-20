import { createSaleSchema } from '../../src/validators/sale.schemas';
import { createHoldBillSchema } from '../../src/validators/holdBill.schemas';

describe('sale / hold bill validation', () => {
  it('requires payments when creating a COMPLETED sale', () => {
    const result = createSaleSchema.safeParse({
      status: 'COMPLETED',
      items: [
        {
          productId: '11111111-1111-4111-8111-111111111111',
          quantity: 1,
          unitPrice: 100,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('requires saleId or sale payload for hold bills', () => {
    const result = createHoldBillSchema.safeParse({ holdNumber: 'HLD-1' });
    expect(result.success).toBe(false);
  });

  it('accepts hold bill with nested sale payload', () => {
    const result = createHoldBillSchema.safeParse({
      sale: {
        items: [
          {
            productId: '11111111-1111-4111-8111-111111111111',
            quantity: 2,
            unitPrice: 50,
          },
        ],
      },
    });
    expect(result.success).toBe(true);
  });
});
