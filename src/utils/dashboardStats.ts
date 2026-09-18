import { Apartment } from '../models/Apartment';
import { GuestStay } from '../models/GuestStay';
import { Payment } from '../models/Payment';
import { BUILDINGS } from './constants';
import { daysUntil, todayDate, toISODate } from './formatters';

export interface UrgentPayment {
  payment: Payment;
  apartment?: Apartment;
  guest?: GuestStay;
  daysUntilDue: number;
}

export interface UrgentOwnerPayment {
  apartment: Apartment;
  daysRemaining: number;
}

export function ownerPaymentDaysRemaining(apt: Apartment): number | undefined {
  if (!apt.ownerPaymentDueDay) return undefined;
  const today = todayDate();
  const dueDate = new Date(today.getFullYear(), today.getMonth(), Math.min(apt.ownerPaymentDueDay, 28));
  return daysUntil(toISODate(dueDate));
}

export function buildGuestPaymentReminders(apartments: Apartment[], guestStays: GuestStay[], payments: Payment[]) {
  const apartmentById = new Map(apartments.map((a) => [a.id, a]));
  const guestById = new Map(guestStays.map((g) => [g.id, g]));

  const overdue = payments.filter((p) => p.status === 'overdue');
  const dueToday = payments.filter((p) => p.status === 'due_today');
  const upcoming7 = payments.filter((p) => {
    if (p.status !== 'upcoming') return false;
    const d = daysUntil(p.dueDate);
    return d > 0 && d <= 7;
  });

  const urgent: UrgentPayment[] = [...overdue, ...dueToday]
    .map((p) => ({
      payment: p,
      apartment: apartmentById.get(p.apartmentId),
      guest: guestById.get(p.guestStayId),
      daysUntilDue: daysUntil(p.dueDate),
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
    .slice(0, 3);

  return { overdue, dueToday, upcoming7, urgent };
}

export function buildOwnerPaymentReminders(apartments: Apartment[]) {
  const withDueDay = apartments.filter((a) => a.ownerPaymentDueDay);

  const overdue: UrgentOwnerPayment[] = [];
  const dueToday: UrgentOwnerPayment[] = [];
  const upcoming7: UrgentOwnerPayment[] = [];

  withDueDay.forEach((apt) => {
    const remaining = ownerPaymentDaysRemaining(apt);
    if (remaining === undefined) return;
    if (remaining < 0) overdue.push({ apartment: apt, daysRemaining: remaining });
    else if (remaining === 0) dueToday.push({ apartment: apt, daysRemaining: remaining });
    else if (remaining <= 7) upcoming7.push({ apartment: apt, daysRemaining: remaining });
  });

  const urgent = [...overdue, ...dueToday].sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 3);

  return { overdue, dueToday, upcoming7, urgent };
}

export function buildBuildingStats(apartments: Apartment[]) {
  return BUILDINGS.map((building) => {
    const list = apartments.filter((a) => a.building === building);
    const occupied = list.filter((a) => a.status === 'occupied').length;
    const vacant = list.filter((a) => a.status === 'vacant').length;
    return { building, total: list.length, occupied, vacant };
  });
}

export function buildLeaseWarnings(apartments: Apartment[]) {
  return apartments
    .filter((a) => a.ownerLeaseEnd && daysUntil(a.ownerLeaseEnd) <= 60)
    .map((a) => ({ apartment: a, daysRemaining: daysUntil(a.ownerLeaseEnd) }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function buildFinancialSummary(apartments: Apartment[], guestStays: GuestStay[]) {
  const totalGuestRevenue = guestStays.filter((g) => g.status === 'active').reduce((sum, g) => sum + g.monthlyRent, 0);
  const totalOwnerCost = apartments
    .filter((a) => a.status === 'occupied')
    .reduce((sum, a) => sum + (a.ownerMonthlyRent ?? 0), 0);
  return { totalGuestRevenue, totalOwnerCost, grossMargin: totalGuestRevenue - totalOwnerCost };
}
