import type { DiscountType, InvoiceStatus } from '@prisma/client';

export interface CalculationItemInput {
  quantity: number;
  rate: number;
}

export interface CalculationInput {
  items: CalculationItemInput[];
  discountType?: DiscountType | null;
  discountValue?: number | null;
  totalPaid?: number;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  grandTotal: number;
  outstandingBalance: number;
  status?: InvoiceStatus;
}

export class InvoiceCalculationService {
  /**
   * Centralized calculation helper for Invoice subtotal, discount, grand total, and outstanding balance.
   */
  public calculate(input: CalculationInput): CalculationResult {
    const subtotal = input.items.reduce((sum, item) => {
      const lineAmount = Math.round(item.quantity * item.rate * 100) / 100;
      return sum + lineAmount;
    }, 0);

    let discountAmount = 0;
    if (input.discountType && input.discountValue && input.discountValue > 0) {
      if (input.discountType === 'PERCENTAGE') {
        discountAmount = Math.round(((subtotal * input.discountValue) / 100) * 100) / 100;
      } else if (input.discountType === 'FIXED_AMOUNT') {
        discountAmount = Math.round(input.discountValue * 100) / 100;
      }
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    const grandTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    const totalPaid = Math.round((input.totalPaid ?? 0) * 100) / 100;
    const outstandingBalance = Math.max(0, Math.round((grandTotal - totalPaid) * 100) / 100);

    return {
      subtotal,
      discountAmount,
      grandTotal,
      outstandingBalance,
    };
  }

  public determineStatus(
    currentStatus: InvoiceStatus,
    grandTotal: number,
    totalPaid: number,
  ): InvoiceStatus {
    if (currentStatus === 'VOID') {
      return 'VOID';
    }

    if (totalPaid >= grandTotal && grandTotal > 0) {
      return 'PAID';
    }

    if (totalPaid > 0 && totalPaid < grandTotal) {
      return 'PARTIALLY_PAID';
    }

    return currentStatus;
  }
}

export const invoiceCalculationService = new InvoiceCalculationService();
