export type NotificationType = 'payment_overdue' | 'lease_expiring';

export interface AppNotification {
  id: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  scheduledAt?: string;
  sentAt?: string;
  isRead: boolean;
  createdAt?: string;
}
