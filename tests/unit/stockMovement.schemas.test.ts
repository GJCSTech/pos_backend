import { createStockMovementSchema } from '../../src/validators/stockMovement.schemas';

describe('stockMovement.schemas', () => {
  const productId = '11111111-1111-4111-8111-111111111111';

  const positiveTypes = ['PURCHASE', 'SALE_RETURN', 'TRANSFER_IN', 'OPENING'] as const;
  const negativeTypes = ['SALE', 'PURCHASE_RETURN', 'TRANSFER_OUT'] as const;

  it.each(positiveTypes)('accepts a positive quantity for %s', (movementType) => {
    const result = createStockMovementSchema.safeParse({ productId, movementType, quantity: 5 });
    expect(result.success).toBe(true);
  });

  it.each(positiveTypes)('rejects a negative quantity for %s', (movementType) => {
    const result = createStockMovementSchema.safeParse({ productId, movementType, quantity: -5 });
    expect(result.success).toBe(false);
  });

  it.each(negativeTypes)('accepts a negative quantity for %s', (movementType) => {
    const result = createStockMovementSchema.safeParse({ productId, movementType, quantity: -5 });
    expect(result.success).toBe(true);
  });

  it.each(negativeTypes)('rejects a positive quantity for %s', (movementType) => {
    const result = createStockMovementSchema.safeParse({ productId, movementType, quantity: 5 });
    expect(result.success).toBe(false);
  });

  it('allows either sign for ADJUSTMENT', () => {
    expect(
      createStockMovementSchema.safeParse({ productId, movementType: 'ADJUSTMENT', quantity: 5 })
        .success,
    ).toBe(true);
    expect(
      createStockMovementSchema.safeParse({ productId, movementType: 'ADJUSTMENT', quantity: -5 })
        .success,
    ).toBe(true);
  });

  it('preserves referenceType/referenceId/occurredAt when provided', () => {
    const referenceId = '22222222-2222-4222-8222-222222222222';
    const occurredAt = new Date('2026-01-01T00:00:00.000Z');
    const result = createStockMovementSchema.parse({
      productId,
      movementType: 'TRANSFER_IN',
      quantity: 5,
      referenceType: 'TRANSFER',
      referenceId,
      occurredAt,
    });

    expect(result.referenceType).toBe('TRANSFER');
    expect(result.referenceId).toBe(referenceId);
    expect(result.occurredAt).toEqual(occurredAt);
  });
});
