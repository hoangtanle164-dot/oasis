import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { Apartment, ApartmentStatus } from '../models/Apartment';
import { GuestStay } from '../models/GuestStay';
import { Payment } from '../models/Payment';
import { AppNotification } from '../models/Notification';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  exportBackup,
  importBackup,
  loadAllData,
  loadReadNotificationIds,
  loadSettings,
  resetToSeed,
  saveAllData,
  saveReadNotificationIds,
  saveSettings,
} from '../data/LocalStorage';
import { buildNotifications } from '../data/notifications';
import { generatePaymentsForGuestStay } from '../data/paymentGenerator';
import { daysUntil, parseISODate, toISODate, todayDate } from '../utils/formatters';

interface DataContextValue {
  loading: boolean;
  apartments: Apartment[];
  guestStays: GuestStay[];
  payments: Payment[];
  notifications: AppNotification[];
  settings: AppSettings;
  refresh: () => Promise<void>;

  addApartment: (apt: Omit<Apartment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ ok: boolean; error?: string }>;
  updateApartment: (id: string, changes: Partial<Apartment>) => Promise<{ ok: boolean; error?: string }>;

  addGuestStay: (
    guest: Omit<GuestStay, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => Promise<{ ok: boolean; error?: string }>;

  recordPayment: (
    paymentId: string,
    amount: number,
    paidDate: string,
    notes?: string
  ) => Promise<{ ok: boolean; error?: string }>;

  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  updateSettings: (changes: Partial<AppSettings>) => Promise<void>;

  doExport: () => Promise<void>;
  doImport: () => Promise<boolean>;
  doReset: () => Promise<void>;

  getApartmentById: (id: string) => Apartment | undefined;
  getGuestStaysForApartment: (apartmentId: string) => GuestStay[];
  getPaymentsForApartment: (apartmentId: string) => Payment[];
  getCurrentGuestStay: (apartmentId: string) => GuestStay | undefined;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [guestStays, setGuestStays] = useState<GuestStay[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const load = useCallback(async () => {
    setLoading(true);
    const [data, read, settingsData] = await Promise.all([loadAllData(), loadReadNotificationIds(), loadSettings()]);
    setApartments(data.apartments);
    setGuestStays(data.guestStays);
    setPayments(data.payments);
    setReadIds(read);
    setSettings(settingsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(async (next: { apartments: Apartment[]; guestStays: GuestStay[]; payments: Payment[] }) => {
    setApartments(next.apartments);
    setGuestStays(next.guestStays);
    setPayments(next.payments);
    await saveAllData(next);
  }, []);

  const addApartment = useCallback<DataContextValue['addApartment']>(
    async (apt) => {
      const room = apt.roomNumber.trim();
      if (!room) return { ok: false, error: 'Số phòng không được để trống' };
      const duplicate = apartments.some((a) => a.building === apt.building && a.roomNumber === room);
      if (duplicate) return { ok: false, error: 'Căn hộ này đã tồn tại' };
      if (apt.ownerLeaseStart && apt.ownerLeaseEnd) {
        if (parseISODate(apt.ownerLeaseEnd).getTime() <= parseISODate(apt.ownerLeaseStart).getTime()) {
          return { ok: false, error: 'Ngày kết thúc HĐ phải sau ngày bắt đầu' };
        }
      }
      if ((apt.ownerMonthlyRent ?? 0) < 0) return { ok: false, error: 'Tiền thuê không hợp lệ' };

      const now = toISODate(todayDate());
      const newApt: Apartment = {
        ...apt,
        roomNumber: room,
        id: `apt-${apt.building.toLowerCase()}-${room.toLowerCase()}-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      const nextApartments = [...apartments, newApt];
      await persist({ apartments: nextApartments, guestStays, payments });
      return { ok: true };
    },
    [apartments, guestStays, payments, persist]
  );

  const updateApartment = useCallback<DataContextValue['updateApartment']>(
    async (id, changes) => {
      if (changes.ownerLeaseStart && changes.ownerLeaseEnd) {
        if (parseISODate(changes.ownerLeaseEnd).getTime() <= parseISODate(changes.ownerLeaseStart).getTime()) {
          return { ok: false, error: 'Ngày kết thúc HĐ phải sau ngày bắt đầu' };
        }
      }
      const nextApartments = apartments.map((a) => (a.id === id ? { ...a, ...changes, updatedAt: toISODate(todayDate()) } : a));
      await persist({ apartments: nextApartments, guestStays, payments });
      return { ok: true };
    },
    [apartments, guestStays, payments, persist]
  );

  const addGuestStay = useCallback<DataContextValue['addGuestStay']>(
    async (guest) => {
      if (!guest.apartmentId) return { ok: false, error: 'Vui lòng chọn phòng' };
      if (!guest.guestName.trim()) return { ok: false, error: 'Tên khách không được để trống' };
      if (!(guest.monthlyRent > 0)) return { ok: false, error: 'Tiền thuê phải lớn hơn 0' };
      if (guest.paymentDueDay < 1 || guest.paymentDueDay > 28) return { ok: false, error: 'Ngày thu tiền phải từ 1-28' };
      const start = parseISODate(guest.startDate);
      const end = parseISODate(guest.endDate);
      if (end.getTime() <= start.getTime()) return { ok: false, error: 'Ngày kết thúc phải sau ngày bắt đầu' };

      const overlap = guestStays.some((g) => {
        if (g.apartmentId !== guest.apartmentId) return false;
        if (g.status === 'cancelled' || g.status === 'completed') return false;
        const gStart = parseISODate(g.startDate).getTime();
        const gEnd = parseISODate(g.endDate).getTime();
        return start.getTime() < gEnd && end.getTime() > gStart;
      });
      if (overlap) return { ok: false, error: 'Đã có khách ở phòng này trong khoảng thời gian đã chọn' };

      const now = toISODate(todayDate());
      const status: GuestStay['status'] = start.getTime() <= todayDate().getTime() ? 'active' : 'upcoming';
      const newGuest: GuestStay = {
        ...guest,
        id: `gs-${Date.now()}`,
        status,
        createdAt: now,
        updatedAt: now,
      };

      const newPayments = generatePaymentsForGuestStay(newGuest);
      const nextGuestStays = [...guestStays, newGuest];
      const nextPayments = [...payments, ...newPayments];

      const nextApartments = apartments.map((a) => {
        if (a.id !== guest.apartmentId) return a;
        const newStatus: ApartmentStatus = start.getTime() <= todayDate().getTime() ? 'occupied' : 'reserved';
        return { ...a, status: newStatus, updatedAt: now };
      });

      await persist({ apartments: nextApartments, guestStays: nextGuestStays, payments: nextPayments });
      return { ok: true };
    },
    [apartments, guestStays, payments, persist]
  );

  const recordPayment = useCallback<DataContextValue['recordPayment']>(
    async (paymentId, amount, paidDate, notes) => {
      const target = payments.find((p) => p.id === paymentId);
      if (!target) return { ok: false, error: 'Không tìm thấy khoản thu' };
      if (amount <= 0) return { ok: false, error: 'Số tiền thu phải lớn hơn 0' };

      const nextAmountPaid = target.amountPaid + amount;
      const status: Payment['status'] = nextAmountPaid >= target.amountDue ? 'paid' : 'partially_paid';

      const nextPayments = payments.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              amountPaid: Math.min(nextAmountPaid, p.amountDue),
              status,
              paidDate,
              notes: notes ?? p.notes,
              updatedAt: toISODate(todayDate()),
            }
          : p
      );
      await persist({ apartments, guestStays, payments: nextPayments });
      return { ok: true };
    },
    [apartments, guestStays, payments, persist]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      const next = new Set(readIds);
      next.add(id);
      setReadIds(next);
      await saveReadNotificationIds(next);
    },
    [readIds]
  );

  const notifications = useMemo(
    () => buildNotifications(apartments, guestStays, payments, readIds),
    [apartments, guestStays, payments, readIds]
  );

  const markAllNotificationsRead = useCallback(async () => {
    const next = new Set(readIds);
    notifications.forEach((n) => next.add(n.id));
    setReadIds(next);
    await saveReadNotificationIds(next);
  }, [readIds, notifications]);

  const updateSettings = useCallback(
    async (changes: Partial<AppSettings>) => {
      const next = { ...settings, ...changes };
      setSettings(next);
      await saveSettings(next);
    },
    [settings]
  );

  const doExport = useCallback(async () => {
    try {
      await exportBackup({ apartments, guestStays, payments });
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể xuất dữ liệu.');
    }
  }, [apartments, guestStays, payments]);

  const doImport = useCallback(async (): Promise<boolean> => {
    try {
      const result = await importBackup();
      if (!result) return false;
      setApartments(result.apartments);
      setGuestStays(result.guestStays);
      setPayments(result.payments);
      return true;
    } catch (e) {
      Alert.alert('Lỗi', 'Tệp dữ liệu không hợp lệ.');
      return false;
    }
  }, []);

  const doReset = useCallback(async () => {
    const seed = await resetToSeed();
    setApartments(seed.apartments);
    setGuestStays(seed.guestStays);
    setPayments(seed.payments);
    setReadIds(new Set());
  }, []);

  const getApartmentById = useCallback((id: string) => apartments.find((a) => a.id === id), [apartments]);

  const getGuestStaysForApartment = useCallback(
    (apartmentId: string) =>
      guestStays
        .filter((g) => g.apartmentId === apartmentId)
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [guestStays]
  );

  const getPaymentsForApartment = useCallback(
    (apartmentId: string) =>
      payments
        .filter((p) => p.apartmentId === apartmentId)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [payments]
  );

  const getCurrentGuestStay = useCallback(
    (apartmentId: string) => {
      const candidates = guestStays.filter((g) => g.apartmentId === apartmentId && g.status !== 'cancelled' && g.status !== 'completed');
      if (candidates.length === 0) return undefined;
      const active = candidates.find((g) => g.status === 'active');
      return active ?? candidates.sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
    },
    [guestStays]
  );

  const value: DataContextValue = {
    loading,
    apartments,
    guestStays,
    payments,
    notifications,
    settings,
    refresh: load,
    addApartment,
    updateApartment,
    addGuestStay,
    recordPayment,
    markNotificationRead,
    markAllNotificationsRead,
    updateSettings,
    doExport,
    doImport,
    doReset,
    getApartmentById,
    getGuestStaysForApartment,
    getPaymentsForApartment,
    getCurrentGuestStay,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function useApartmentComputed(apt: Apartment) {
  return useMemo(() => {
    const leaseDaysRemaining = apt.ownerLeaseEnd ? daysUntil(apt.ownerLeaseEnd) : undefined;
    const isLeaseExpiring = leaseDaysRemaining !== undefined && leaseDaysRemaining <= 60 && leaseDaysRemaining >= 0;
    const isLeaseExpired = leaseDaysRemaining !== undefined && leaseDaysRemaining < 0;

    let paymentDaysRemaining: number | undefined;
    if (apt.ownerPaymentDueDay) {
      const today = todayDate();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), Math.min(apt.ownerPaymentDueDay, 28));
      paymentDaysRemaining = daysUntil(toISODate(dueDate));
    }

    return { leaseDaysRemaining, isLeaseExpiring, isLeaseExpired, paymentDaysRemaining };
  }, [apt]);
}
