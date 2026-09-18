export const BUILDINGS = ['OC1A', 'OC1B', 'OC2A', 'OC2B', 'OC3'] as const;
export type Building = (typeof BUILDINGS)[number];

export const APARTMENT_STATUS_LABELS: Record<string, string> = {
  occupied: 'Đang thuê',
  vacant: 'Trống',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
};

export const GUEST_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Sắp đến',
  active: 'Đang ở',
  completed: 'Đã kết thúc',
  cancelled: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  upcoming: 'Sắp đến',
  due_today: 'Hôm nay',
  paid: 'Đã thu',
  partially_paid: 'Thu một phần',
  overdue: 'Quá hạn',
};

export const APARTMENT_STATUSES = ['occupied', 'vacant', 'reserved', 'maintenance'] as const;

export const RENTAL_TYPES = [
  { value: 'monthly', label: 'Theo tháng' },
  { value: 'daily', label: 'Theo ngày' },
];

export const PAYMENT_METHODS = [
  { value: 'transfer', label: 'Chuyển khoản' },
  { value: 'cash', label: 'Tiền mặt' },
];
