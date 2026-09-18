import type { NavigatorScreenParams } from '@react-navigation/native';

export type ApartmentsFilterParams = {
  building?: string;
  status?: string;
};

export type ApartmentsStackParamList = {
  ApartmentsHome: ApartmentsFilterParams | undefined;
};

export type MoreStackParamList = {
  MoreHome: undefined;
  Notifications: undefined;
  MonthlySummary: undefined;
  Settings: undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Apartments: NavigatorScreenParams<ApartmentsStackParamList> | undefined;
  Guests: undefined;
  Payments: undefined;
  More: undefined;
};
