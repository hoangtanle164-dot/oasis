import { GuestStay } from '../models/GuestStay';
import { Payment, PaymentStatus } from '../models/Payment';
import { addMonths, daysBetween, daysInMonth, parseISODate, toISODate, todayDate } from '../utils/formatters';

function computeStatusForDueDate(dueDate: Date): { status: PaymentStatus; amountPaidRatio: number; paidDate?: string } {
  const diff = daysBetween(todayDate(), dueDate);
  if (diff < -7) {
    return { status: 'paid', amountPaidRatio: 1, paidDate: toISODate(dueDate) };
  }
  if (diff < 0) {
    return { status: 'overdue', amountPaidRatio: 0 };
  }
  if (diff === 0) {
    return { status: 'due_today', amountPaidRatio: 0 };
  }
  return { status: 'upcoming', amountPaidRatio: 0 };
}

export function generatePaymentsForGuestStay(guestStay: GuestStay): Payment[] {
  const payments: Payment[] = [];
  const start = parseISODate(guestStay.startDate);
  const end = parseISODate(guestStay.endDate);
  const dueDay = Math.min(Math.max(guestStay.paymentDueDay || 1, 1), 28);

  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  let index = 0;
  while (cursor.getTime() <= end.getTime()) {
    const year = cursor.getFullYear();
    const month0 = cursor.getMonth();
    const day = Math.min(dueDay, daysInMonth(year, month0));
    const dueDate = new Date(year, month0, day);

    if (dueDate.getTime() >= new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) {
      const { status, amountPaidRatio, paidDate } = computeStatusForDueDate(dueDate);
      const amountDue = guestStay.monthlyRent;
      payments.push({
        id: `pay-${guestStay.id}-${index}`,
        guestStayId: guestStay.id,
        apartmentId: guestStay.apartmentId,
        amountDue,
        amountPaid: Math.round(amountDue * amountPaidRatio),
        dueDate: toISODate(dueDate),
        paidDate,
        status,
        createdAt: toISODate(todayDate()),
        updatedAt: toISODate(todayDate()),
      });
      index += 1;
    }
    cursor = addMonths(cursor, 1);
  }

  return payments;
}
