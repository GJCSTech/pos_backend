import { Prisma } from '@prisma/client';

export function toDecimal(value: number | string | Prisma.Decimal): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) {
    return value;
  }
  return new Prisma.Decimal(value);
}

export function decimalToNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  return Number(value.toString());
}

export function roundMoney(value: Prisma.Decimal | number | string): Prisma.Decimal {
  return toDecimal(value).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function calculateLineTotals(input: {
  quantity: number | string;
  unitPrice: number | string;
  discountAmount?: number | string;
  taxRate?: number | string;
}): {
  lineSubtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  taxableAmount: Prisma.Decimal;
  taxAmount: Prisma.Decimal;
  lineTotal: Prisma.Decimal;
} {
  const quantity = toDecimal(input.quantity);
  const unitPrice = toDecimal(input.unitPrice);
  const discountAmount = roundMoney(input.discountAmount ?? 0);
  const taxRate = toDecimal(input.taxRate ?? 0);

  const lineSubtotal = roundMoney(quantity.mul(unitPrice));
  const afterDiscount = lineSubtotal.sub(discountAmount);
  const taxableAmount = roundMoney(afterDiscount.lt(0) ? 0 : afterDiscount);
  const taxAmount = roundMoney(taxableAmount.mul(taxRate).div(100));
  const lineTotal = roundMoney(taxableAmount.add(taxAmount));

  return {
    lineSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    lineTotal,
  };
}
