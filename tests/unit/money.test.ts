import { calculateLineTotals, roundMoney, toDecimal } from '../../src/utils/money';

describe('money helpers', () => {
  it('calculates taxable line totals with discount and GST', () => {
    const totals = calculateLineTotals({
      quantity: 2,
      unitPrice: 100,
      discountAmount: 20,
      taxRate: 18,
    });

    expect(Number(totals.lineSubtotal)).toBe(200);
    expect(Number(totals.discountAmount)).toBe(20);
    expect(Number(totals.taxableAmount)).toBe(180);
    expect(Number(totals.taxAmount)).toBe(32.4);
    expect(Number(totals.lineTotal)).toBe(212.4);
  });

  it('rounds money to 2 decimal places', () => {
    expect(Number(roundMoney(toDecimal('10.456')))).toBe(10.46);
  });
});
