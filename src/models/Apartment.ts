export type ApartmentStatus = 'occupied' | 'vacant' | 'reserved' | 'maintenance';

export interface Apartment {
  id: string;
  building: string;
  roomNumber: string;
  status: ApartmentStatus;
  ownerName?: string;
  ownerMonthlyRent?: number;
  ownerLeaseStart?: string;
  ownerLeaseEnd?: string;
  ownerPaymentDueDay?: number;
  electricityContract?: string;
  wifiContract?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function apartmentLabel(apt: Apartment): string {
  return `${apt.building} ${apt.roomNumber}`;
}
