import { Apartment } from '../models/Apartment';
import { GuestStay } from '../models/GuestStay';
import { Payment } from '../models/Payment';
import { generatePaymentsForGuestStay } from './paymentGenerator';

const RAW_APARTMENTS: Apartment[] = [
  { id: 'apt-oc1a-1028', building: 'OC1A', roomNumber: '1028', status: 'occupied', ownerLeaseStart: '2025-07-13', ownerLeaseEnd: '2026-07-13', ownerPaymentDueDay: 3, notes: 'HĐ chủ hết hạn' },
  { id: 'apt-oc1a-1116', building: 'OC1A', roomNumber: '1116', status: 'occupied', ownerLeaseStart: '2026-04-06', ownerLeaseEnd: '2027-04-06', ownerPaymentDueDay: 20, notes: 'Khách ở ngày' },
  { id: 'apt-oc1a-12a04', building: 'OC1A', roomNumber: '12A04', status: 'occupied' },
  { id: 'apt-oc1a-12a06', building: 'OC1A', roomNumber: '12A06', status: 'occupied', ownerLeaseStart: '2026-01-01', ownerLeaseEnd: '2026-10-01', ownerPaymentDueDay: 1 },
  { id: 'apt-oc1a-1614', building: 'OC1A', roomNumber: '1614', status: 'occupied', ownerLeaseStart: '2024-12-20', ownerLeaseEnd: '2026-08-20', ownerPaymentDueDay: 1, notes: 'HĐ chủ hết hạn' },
  { id: 'apt-oc1a-1930', building: 'OC1A', roomNumber: '1930', status: 'occupied', ownerLeaseStart: '2026-06-09', ownerLeaseEnd: '2027-06-09' },
  { id: 'apt-oc1a-2006', building: 'OC1A', roomNumber: '2006', status: 'occupied', ownerLeaseStart: '2026-03-05', ownerLeaseEnd: '2027-03-05', ownerPaymentDueDay: 26 },
  { id: 'apt-oc1a-2806', building: 'OC1A', roomNumber: '2806', status: 'occupied', ownerLeaseStart: '2026-05-25', ownerLeaseEnd: '2026-11-25', ownerPaymentDueDay: 16 },
  { id: 'apt-oc1a-2834', building: 'OC1A', roomNumber: '2834', status: 'occupied', ownerLeaseStart: '2026-03-28', ownerLeaseEnd: '2027-03-28', ownerPaymentDueDay: 4, notes: 'Khách ở ngày' },
  { id: 'apt-oc1a-4010', building: 'OC1A', roomNumber: '4010', status: 'occupied', ownerLeaseStart: '2026-01-01', ownerLeaseEnd: '2027-01-01', ownerPaymentDueDay: 23 },
  { id: 'apt-oc1a-4012', building: 'OC1A', roomNumber: '4012', status: 'occupied', ownerLeaseStart: '2026-01-14', ownerLeaseEnd: '2027-01-14', ownerPaymentDueDay: 10 },
  { id: 'apt-oc1b-1714', building: 'OC1B', roomNumber: '1714', status: 'occupied', ownerLeaseStart: '2026-03-05', ownerLeaseEnd: '2027-03-05', ownerPaymentDueDay: 18 },
  { id: 'apt-oc1b-2002', building: 'OC1B', roomNumber: '2002', status: 'occupied', ownerLeaseStart: '2026-03-08', ownerLeaseEnd: '2027-03-08' },
  { id: 'apt-oc1b-2320', building: 'OC1B', roomNumber: '2320', status: 'occupied', ownerPaymentDueDay: 15 },
  { id: 'apt-oc1b-2730', building: 'OC1B', roomNumber: '2730', status: 'occupied', ownerLeaseStart: '2026-02-18', ownerLeaseEnd: '2027-02-18', ownerPaymentDueDay: 8 },
  { id: 'apt-oc1b-3218', building: 'OC1B', roomNumber: '3218', status: 'occupied', ownerLeaseStart: '2026-03-05', ownerLeaseEnd: '2027-03-05' },
  { id: 'apt-oc2a-206', building: 'OC2A', roomNumber: '206', status: 'occupied', ownerLeaseStart: '2026-02-01', ownerLeaseEnd: '2027-09-01', ownerPaymentDueDay: 17 },
  { id: 'apt-oc2a-420', building: 'OC2A', roomNumber: '420', status: 'occupied', ownerLeaseStart: '2026-06-05', ownerLeaseEnd: '2027-06-05', ownerPaymentDueDay: 9 },
  { id: 'apt-oc2a-908', building: 'OC2A', roomNumber: '908', status: 'occupied', ownerLeaseStart: '2026-01-10', ownerLeaseEnd: '2026-09-26', ownerPaymentDueDay: 26 },
  { id: 'apt-oc2a-3030', building: 'OC2A', roomNumber: '3030', status: 'occupied', ownerPaymentDueDay: 9 },
  { id: 'apt-oc2a-3614', building: 'OC2A', roomNumber: '3614', status: 'vacant', ownerLeaseStart: '2026-08-03', ownerLeaseEnd: '2026-10-03', notes: 'Trống' },
  { id: 'apt-oc2a-3910', building: 'OC2A', roomNumber: '3910', status: 'occupied', ownerLeaseStart: '2025-12-07', ownerLeaseEnd: '2026-12-07', ownerPaymentDueDay: 23 },
  { id: 'apt-oc2a-3912', building: 'OC2A', roomNumber: '3912', status: 'occupied', ownerLeaseStart: '2026-12-30', ownerLeaseEnd: '2027-12-30', ownerPaymentDueDay: 1 },
  { id: 'apt-oc2b-314', building: 'OC2B', roomNumber: '314', status: 'occupied', ownerLeaseStart: '2026-07-17', ownerLeaseEnd: '2027-07-17', ownerPaymentDueDay: 24 },
  { id: 'apt-oc2b-320', building: 'OC2B', roomNumber: '320', status: 'occupied', ownerPaymentDueDay: 6 },
  { id: 'apt-oc2b-928', building: 'OC2B', roomNumber: '928', status: 'occupied', ownerLeaseStart: '2026-06-05', ownerLeaseEnd: '2027-06-05', ownerPaymentDueDay: 13 },
  { id: 'apt-oc2b-2208', building: 'OC2B', roomNumber: '2208', status: 'occupied', ownerLeaseStart: '2026-04-07', ownerLeaseEnd: '2027-04-07', ownerPaymentDueDay: 16, notes: 'Khách ở ngày' },
  { id: 'apt-oc2b-2324', building: 'OC2B', roomNumber: '2324', status: 'occupied', ownerLeaseStart: '2026-04-10', ownerLeaseEnd: '2027-04-10', ownerPaymentDueDay: 28 },
  { id: 'apt-oc2b-3202', building: 'OC2B', roomNumber: '3202', status: 'occupied', ownerLeaseStart: '2026-04-04', ownerLeaseEnd: '2027-04-04', ownerPaymentDueDay: 17 },
  { id: 'apt-oc2b-3324', building: 'OC2B', roomNumber: '3324', status: 'occupied', ownerPaymentDueDay: 28 },
  { id: 'apt-oc2b-3416', building: 'OC2B', roomNumber: '3416', status: 'occupied', ownerLeaseStart: '2026-06-19', ownerLeaseEnd: '2026-08-28', ownerPaymentDueDay: 19, notes: 'HĐ chủ ngắn hạn' },
  { id: 'apt-oc2b-3626', building: 'OC2B', roomNumber: '3626', status: 'occupied', ownerLeaseStart: '2026-04-10', ownerLeaseEnd: '2027-04-10', ownerPaymentDueDay: 6 },
  { id: 'apt-oc2b-3628', building: 'OC2B', roomNumber: '3628', status: 'occupied', ownerLeaseStart: '2026-04-10', ownerLeaseEnd: '2027-04-10', ownerPaymentDueDay: 6 },
  { id: 'apt-oc2b-3632', building: 'OC2B', roomNumber: '3632', status: 'occupied', ownerLeaseStart: '2026-03-10', ownerLeaseEnd: '2027-03-10', ownerPaymentDueDay: 15 },
  { id: 'apt-oc3-828', building: 'OC3', roomNumber: '828', status: 'occupied', ownerPaymentDueDay: 28 },
  { id: 'apt-oc3-3728', building: 'OC3', roomNumber: '3728', status: 'occupied', ownerLeaseStart: '2026-04-30', ownerLeaseEnd: '2027-04-30', ownerPaymentDueDay: 4 },
];

const RAW_GUEST_STAYS: GuestStay[] = [
  { id: 'gs-1028', apartmentId: 'apt-oc1a-1028', guestName: 'Khách 1028', rentalType: 'monthly', startDate: '2026-09-03', endDate: '2026-11-03', monthlyRent: 10000000, paymentDueDay: 3, deposit: 20000000, salesName: 'Khánh Vân', status: 'active' },
  { id: 'gs-1116', apartmentId: 'apt-oc1a-1116', guestName: 'Khách 1116', rentalType: 'daily', startDate: '2026-09-20', endDate: '2026-10-15', monthlyRent: 9000000, paymentDueDay: 20, status: 'active' },
  { id: 'gs-12a06', apartmentId: 'apt-oc1a-12a06', guestName: 'Khách 12A06', rentalType: 'monthly', startDate: '2026-09-01', endDate: '2026-12-01', monthlyRent: 7500000, paymentDueDay: 1, status: 'active' },
  { id: 'gs-1614', apartmentId: 'apt-oc1a-1614', guestName: 'Khách 1614', rentalType: 'monthly', startDate: '2026-09-01', endDate: '2026-12-01', monthlyRent: 7000000, paymentDueDay: 1, status: 'active' },
  { id: 'gs-1930', apartmentId: 'apt-oc1a-1930', guestName: 'Khách 1930', rentalType: 'monthly', startDate: '2026-09-01', endDate: '2026-12-31', monthlyRent: 13000000, paymentDueDay: 1, status: 'active' },
  { id: 'gs-2006', apartmentId: 'apt-oc1a-2006', guestName: 'Khách 2006', rentalType: 'monthly', startDate: '2026-07-26', endDate: '2026-10-26', monthlyRent: 8000000, paymentDueDay: 26, status: 'active' },
  { id: 'gs-2806', apartmentId: 'apt-oc1a-2806', guestName: 'Khách 2806', rentalType: 'monthly', startDate: '2026-09-16', endDate: '2026-12-16', monthlyRent: 14000000, paymentDueDay: 16, status: 'active' },
  { id: 'gs-2834', apartmentId: 'apt-oc1a-2834', guestName: 'Khách 2834', rentalType: 'daily', startDate: '2026-09-04', endDate: '2026-10-04', monthlyRent: 11000000, paymentDueDay: 4, status: 'active' },
  { id: 'gs-4010', apartmentId: 'apt-oc1a-4010', guestName: 'Khách 4010', rentalType: 'monthly', startDate: '2026-08-23', endDate: '2026-09-23', monthlyRent: 8000000, paymentDueDay: 23, status: 'active' },
  { id: 'gs-4012', apartmentId: 'apt-oc1a-4012', guestName: 'Khách 4012', rentalType: 'monthly', startDate: '2026-09-10', endDate: '2026-10-10', monthlyRent: 8000000, paymentDueDay: 10, status: 'active' },
  { id: 'gs-1714', apartmentId: 'apt-oc1b-1714', guestName: 'Khách 1714', rentalType: 'monthly', startDate: '2026-09-18', endDate: '2026-12-18', monthlyRent: 10000000, paymentDueDay: 18, status: 'active' },
  { id: 'gs-2002', apartmentId: 'apt-oc1b-2002', guestName: 'Khách 2002', rentalType: 'monthly', startDate: '2026-09-01', endDate: '2026-12-31', monthlyRent: 15000000, paymentDueDay: 1, status: 'active' },
  { id: 'gs-2320', apartmentId: 'apt-oc1b-2320', guestName: 'Khách 2320', rentalType: 'monthly', startDate: '2026-08-15', endDate: '2027-02-15', monthlyRent: 0, paymentDueDay: 15, status: 'active' },
  { id: 'gs-2730', apartmentId: 'apt-oc1b-2730', guestName: 'Khách 2730', rentalType: 'monthly', startDate: '2026-09-08', endDate: '2026-12-08', monthlyRent: 8500000, paymentDueDay: 8, salesName: 'Thảo', status: 'active' },
  { id: 'gs-3218', apartmentId: 'apt-oc1b-3218', guestName: 'Khách 3218', rentalType: 'monthly', startDate: '2026-09-01', endDate: '2026-12-31', monthlyRent: 9000000, paymentDueDay: 1, status: 'active' },
  { id: 'gs-206', apartmentId: 'apt-oc2a-206', guestName: 'Khách 206', rentalType: 'monthly', startDate: '2026-09-17', endDate: '2026-11-17', monthlyRent: 15000000, paymentDueDay: 17, salesName: 'Thảo', status: 'active' },
  { id: 'gs-420', apartmentId: 'apt-oc2a-420', guestName: 'Khách 420', rentalType: 'monthly', startDate: '2026-09-09', endDate: '2027-03-09', monthlyRent: 12000000, paymentDueDay: 9, status: 'active' },
  { id: 'gs-908', apartmentId: 'apt-oc2a-908', guestName: 'Khách 908', rentalType: 'monthly', startDate: '2026-08-26', endDate: '2026-09-26', monthlyRent: 13000000, paymentDueDay: 26, status: 'active' },
  { id: 'gs-3030', apartmentId: 'apt-oc2a-3030', guestName: 'Khách 3030', rentalType: 'monthly', startDate: '2026-09-09', endDate: '2027-03-09', monthlyRent: 10000000, paymentDueDay: 9, status: 'active' },
  { id: 'gs-3910', apartmentId: 'apt-oc2a-3910', guestName: 'Khách 3910', rentalType: 'monthly', startDate: '2026-08-23', endDate: '2026-11-23', monthlyRent: 8000000, paymentDueDay: 23, status: 'active' },
  { id: 'gs-3912', apartmentId: 'apt-oc2a-3912', guestName: 'Khách 3912', rentalType: 'monthly', startDate: '2026-07-01', endDate: '2026-10-01', monthlyRent: 8000000, paymentDueDay: 1, status: 'active' },
  { id: 'gs-314', apartmentId: 'apt-oc2b-314', guestName: 'Khách 314', rentalType: 'monthly', startDate: '2026-08-24', endDate: '2026-09-24', monthlyRent: 11000000, paymentDueDay: 24, status: 'active' },
  { id: 'gs-320', apartmentId: 'apt-oc2b-320', guestName: 'Khách 320', rentalType: 'monthly', startDate: '2026-08-06', endDate: '2026-10-06', monthlyRent: 15000000, paymentDueDay: 6, status: 'active' },
  { id: 'gs-928', apartmentId: 'apt-oc2b-928', guestName: 'Khách 928', rentalType: 'monthly', startDate: '2026-09-13', endDate: '2026-12-13', monthlyRent: 18000000, paymentDueDay: 13, status: 'active' },
  { id: 'gs-2208', apartmentId: 'apt-oc2b-2208', guestName: 'Khách 2208', rentalType: 'daily', startDate: '2026-09-16', endDate: '2026-10-05', monthlyRent: 10000000, paymentDueDay: 16, status: 'active' },
  { id: 'gs-2324', apartmentId: 'apt-oc2b-2324', guestName: 'Khách 2324', rentalType: 'monthly', startDate: '2026-08-30', endDate: '2026-11-30', monthlyRent: 10500000, paymentDueDay: 28, status: 'active' },
  { id: 'gs-3202', apartmentId: 'apt-oc2b-3202', guestName: 'Khách 3202', rentalType: 'monthly', startDate: '2026-08-17', endDate: '2026-10-17', monthlyRent: 15000000, paymentDueDay: 17, status: 'active' },
  { id: 'gs-3324', apartmentId: 'apt-oc2b-3324', guestName: 'Khách 3324', rentalType: 'monthly', startDate: '2026-08-31', endDate: '2026-10-31', monthlyRent: 16000000, paymentDueDay: 28, salesName: 'Thảo', status: 'active' },
  { id: 'gs-3416', apartmentId: 'apt-oc2b-3416', guestName: 'Khách 3416', rentalType: 'monthly', startDate: '2026-09-19', endDate: '2026-10-19', monthlyRent: 0, paymentDueDay: 19, status: 'active' },
  { id: 'gs-3626', apartmentId: 'apt-oc2b-3626', guestName: 'Khách 3626', rentalType: 'monthly', startDate: '2026-08-06', endDate: '2027-02-06', monthlyRent: 13000000, paymentDueDay: 6, status: 'active' },
  { id: 'gs-3628', apartmentId: 'apt-oc2b-3628', guestName: 'Khách 3628', rentalType: 'monthly', startDate: '2026-08-06', endDate: '2027-02-06', monthlyRent: 15000000, paymentDueDay: 6, status: 'active' },
  { id: 'gs-3632', apartmentId: 'apt-oc2b-3632', guestName: 'Khách 3632', rentalType: 'monthly', startDate: '2026-09-15', endDate: '2026-12-15', monthlyRent: 12000000, paymentDueDay: 15, status: 'active' },
  { id: 'gs-828', apartmentId: 'apt-oc3-828', guestName: 'Khách 828', rentalType: 'monthly', startDate: '2026-08-29', endDate: '2026-09-29', monthlyRent: 14000000, paymentDueDay: 28, status: 'active' },
  { id: 'gs-3728', apartmentId: 'apt-oc3-3728', guestName: 'Khách 3728', rentalType: 'monthly', startDate: '2026-09-04', endDate: '2026-10-04', monthlyRent: 13000000, paymentDueDay: 4, status: 'active' },
];

const OWNER_NAMES = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
  'Vũ Thị Phương', 'Đặng Văn Giang', 'Bùi Thị Hoa', 'Đỗ Văn Inh', 'Ngô Thị Kim',
  'Dương Văn Long', 'Lý Thị Mai', 'Phan Văn Nam', 'Võ Thị Oanh', 'Đinh Văn Phúc',
  'Trịnh Thị Quyên', 'Tô Văn Sơn', 'Lâm Thị Thu', 'Mai Văn Uy', 'Chu Thị Vân',
  'Cao Văn Xuân', 'Kiều Thị Yến', 'Hồ Văn Bảo', 'Lương Thị Cẩm', 'Tăng Văn Đức',
  'Thái Thị Giang', 'Nghiêm Văn Hùng', 'Quách Thị Ích', 'Từ Văn Khoa', 'Vương Thị Lan',
  'Âu Văn Minh', 'Ông Thị Ngọc', 'Tạ Văn Phát', 'Diệp Thị Quỳnh', 'Huỳnh Văn Rạng',
  'Châu Thị Sương',
];

function ownerNameFor(index: number): string {
  return OWNER_NAMES[index % OWNER_NAMES.length];
}

export interface SeedBundle {
  apartments: Apartment[];
  guestStays: GuestStay[];
  payments: Payment[];
}

export function buildSeedData(): SeedBundle {
  const guestStays: GuestStay[] = RAW_GUEST_STAYS.map((gs) => ({ ...gs }));
  const guestByApartment = new Map<string, GuestStay>();
  guestStays.forEach((gs) => {
    if (gs.status === 'active') guestByApartment.set(gs.apartmentId, gs);
  });

  const apartments: Apartment[] = RAW_APARTMENTS.map((apt, index) => {
    const enriched: Apartment = { ...apt };
    if (apt.status === 'occupied' || apt.status === 'reserved') {
      const guest = guestByApartment.get(apt.id);
      const baseRent = guest?.monthlyRent && guest.monthlyRent > 0 ? guest.monthlyRent : 8000000;
      enriched.ownerName = ownerNameFor(index);
      enriched.ownerMonthlyRent = Math.round((baseRent * 0.72) / 100000) * 100000;
      enriched.electricityContract = `PE${apt.building}${apt.roomNumber}`;
      enriched.wifiContract = `WF${apt.building}${apt.roomNumber}`;
    }
    enriched.createdAt = '2026-01-01';
    enriched.updatedAt = '2026-01-01';
    return enriched;
  });

  const payments: Payment[] = [];
  guestStays.forEach((gs) => {
    payments.push(...generatePaymentsForGuestStay(gs));
  });

  return { apartments, guestStays, payments };
}
