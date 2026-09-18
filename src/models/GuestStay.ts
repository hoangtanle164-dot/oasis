export type GuestStayStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type RentalType = 'monthly' | 'daily';

export interface GuestStay {
  id: string;
  apartmentId: string;
  guestName: string;
  rentalType: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  paymentDueDay: number;
  deposit?: number;
  salesName?: string;
  status: GuestStayStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
