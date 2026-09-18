export type PaymentStatus = 'upcoming' | 'due_today' | 'paid' | 'partially_paid' | 'overdue';

export interface Payment {
  id: string;
  guestStayId: string;
  apartmentId: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
