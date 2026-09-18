import { Apartment, apartmentLabel } from '../models/Apartment';
import { AppNotification } from '../models/Notification';
import { GuestStay } from '../models/GuestStay';
import { Payment } from '../models/Payment';
import { daysUntil, formatVND } from '../utils/formatters';

export function buildNotifications(
  apartments: Apartment[],
  guestStays: GuestStay[],
  payments: Payment[],
  readIds: Set<string>
): AppNotification[] {
  const notifications: AppNotification[] = [];
  const apartmentById = new Map(apartments.map((a) => [a.id, a]));
  const guestById = new Map(guestStays.map((g) => [g.id, g]));

  payments
    .filter((p) => p.status === 'overdue')
    .forEach((p) => {
      const apt = apartmentById.get(p.apartmentId);
      const guest = guestById.get(p.guestStayId);
      const overdueDays = Math.max(0, -daysUntil(p.dueDate));
      const remaining = Math.max(0, p.amountDue - p.amountPaid);
      const id = `notif-po-${p.id}`;
      notifications.push({
        id,
        type: 'payment_overdue',
        title: 'Tiền thuê quá hạn',
        message: `${apt ? apartmentLabel(apt) : ''} - ${guest?.guestName ?? ''}: quá hạn ${overdueDays} ngày, còn ${formatVND(remaining)}`,
        relatedEntityType: 'payment',
        relatedEntityId: p.id,
        isRead: readIds.has(id),
        createdAt: p.dueDate,
      });
    });

  apartments.forEach((apt) => {
    if (!apt.ownerLeaseEnd) return;
    const remaining = daysUntil(apt.ownerLeaseEnd);
    if (remaining >= 0 && remaining <= 60) {
      const id = `notif-le-${apt.id}`;
      notifications.push({
        id,
        type: 'lease_expiring',
        title: 'HĐ chủ nhà sắp hết hạn',
        message: `${apartmentLabel(apt)} - ${apt.ownerName ?? 'Chủ nhà'}: còn ${remaining} ngày`,
        relatedEntityType: 'apartment',
        relatedEntityId: apt.id,
        isRead: readIds.has(id),
        createdAt: apt.ownerLeaseEnd,
      });
    } else if (remaining < 0) {
      const id = `notif-le-${apt.id}`;
      notifications.push({
        id,
        type: 'lease_expiring',
        title: 'HĐ chủ nhà đã hết hạn',
        message: `${apartmentLabel(apt)} - ${apt.ownerName ?? 'Chủ nhà'}: đã hết hạn ${Math.abs(remaining)} ngày`,
        relatedEntityType: 'apartment',
        relatedEntityId: apt.id,
        isRead: readIds.has(id),
        createdAt: apt.ownerLeaseEnd,
      });
    }
  });

  notifications.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  return notifications;
}
