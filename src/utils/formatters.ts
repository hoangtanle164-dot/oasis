export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / MS);
}

export function daysUntil(dateStr?: string): number {
  if (!dateStr) return Number.NaN;
  return daysBetween(todayDate(), parseISODate(dateStr));
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '--/--/----';
  const d = parseISODate(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatMonthYear(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${mm}/${date.getFullYear()}`;
}

export function formatVND(amount: number): string {
  const rounded = Math.round(amount || 0);
  const negative = rounded < 0;
  const digits = Math.abs(rounded).toString();
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}${withCommas} ₫`;
}

export function formatVNDShort(amount: number): string {
  const n = amount || 0;
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    const str = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${str}tr`;
  }
  if (n >= 1_000) {
    return `${(n / 1000).toFixed(0)}k`;
  }
  return `${n}`;
}

export function formatDateInput(date: Date): string {
  return toISODate(date);
}
