import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { Apartment } from '../models/Apartment';
import { GuestStay } from '../models/GuestStay';
import { Payment } from '../models/Payment';
import { buildSeedData } from './SeedData';

const KEYS = {
  apartments: 'oasis_apartments',
  guestStays: 'oasis_guest_stays',
  payments: 'oasis_payments',
  readNotifications: 'oasis_read_notifications',
  settings: 'oasis_settings',
  seeded: 'oasis_seeded_v1',
};

export interface AppSettings {
  darkMode: boolean;
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  notificationsEnabled: true,
};

export interface StoredData {
  apartments: Apartment[];
  guestStays: GuestStay[];
  payments: Payment[];
}

export async function loadAllData(): Promise<StoredData> {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (!seeded) {
    const seed = buildSeedData();
    await saveAllData(seed);
    await AsyncStorage.setItem(KEYS.seeded, 'true');
    return seed;
  }

  const [aptsRaw, guestsRaw, paymentsRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.apartments),
    AsyncStorage.getItem(KEYS.guestStays),
    AsyncStorage.getItem(KEYS.payments),
  ]);

  if (!aptsRaw || !guestsRaw || !paymentsRaw) {
    const seed = buildSeedData();
    await saveAllData(seed);
    return seed;
  }

  return {
    apartments: JSON.parse(aptsRaw),
    guestStays: JSON.parse(guestsRaw),
    payments: JSON.parse(paymentsRaw),
  };
}

export async function saveAllData(data: StoredData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.apartments, JSON.stringify(data.apartments)),
    AsyncStorage.setItem(KEYS.guestStays, JSON.stringify(data.guestStays)),
    AsyncStorage.setItem(KEYS.payments, JSON.stringify(data.payments)),
  ]);
}

export async function loadReadNotificationIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(KEYS.readNotifications);
  if (!raw) return new Set();
  try {
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export async function saveReadNotificationIds(ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(KEYS.readNotifications, JSON.stringify(Array.from(ids)));
}

export async function loadSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function resetToSeed(): Promise<StoredData> {
  const seed = buildSeedData();
  await saveAllData(seed);
  await AsyncStorage.setItem(KEYS.readNotifications, JSON.stringify([]));
  await AsyncStorage.setItem(KEYS.seeded, 'true');
  return seed;
}

export async function exportBackup(data: StoredData): Promise<void> {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fileName = `oasis_backup_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;

  const payload = {
    apartments: data.apartments,
    guestStays: data.guestStays,
    payments: data.payments,
    notifications: [],
    exportDate: now.toISOString(),
  };

  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Xuất dữ liệu Oasis Retreat',
    });
  }
}

export async function importBackup(): Promise<StoredData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const uri = result.assets[0].uri;
  const content = await FileSystem.readAsStringAsync(uri);
  const parsed = JSON.parse(content);

  const data: StoredData = {
    apartments: parsed.apartments ?? [],
    guestStays: parsed.guestStays ?? [],
    payments: parsed.payments ?? [],
  };

  await saveAllData(data);
  await AsyncStorage.setItem(KEYS.seeded, 'true');
  return data;
}
