import React from 'react';
import { NavigationContainer, DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import ApartmentsScreen from '../screens/ApartmentsScreen';
import GuestsScreen from '../screens/GuestsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import MoreScreen from '../screens/MoreScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationCenterScreen from '../screens/NotificationCenterScreen';
import MonthlySummaryScreen from '../screens/MonthlySummaryScreen';
import { useAppTheme } from '../store/ThemeContext';
import { BrandColors } from '../utils/theme';
import { MoreStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const DashboardStackNav = createNativeStackNavigator();
const ApartmentsStackNav = createNativeStackNavigator();
const GuestsStackNav = createNativeStackNavigator();
const PaymentsStackNav = createNativeStackNavigator();
const MoreStackNav = createNativeStackNavigator<MoreStackParamList>();

function useStackScreenOptions() {
  const { colors } = useAppTheme();
  return {
    headerStyle: { backgroundColor: colors.card },
    headerTitleStyle: { color: colors.text },
    headerTintColor: BrandColors.primary,
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
}

function DashboardStack() {
  const opts = useStackScreenOptions();
  return (
    <DashboardStackNav.Navigator screenOptions={opts}>
      <DashboardStackNav.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    </DashboardStackNav.Navigator>
  );
}

function ApartmentsStack() {
  const opts = useStackScreenOptions();
  return (
    <ApartmentsStackNav.Navigator screenOptions={opts}>
      <ApartmentsStackNav.Screen name="ApartmentsHome" component={ApartmentsScreen} options={{ title: 'Căn hộ' }} />
    </ApartmentsStackNav.Navigator>
  );
}

function GuestsStack() {
  const opts = useStackScreenOptions();
  return (
    <GuestsStackNav.Navigator screenOptions={opts}>
      <GuestsStackNav.Screen name="GuestsHome" component={GuestsScreen} options={{ title: 'Khách' }} />
    </GuestsStackNav.Navigator>
  );
}

function PaymentsStack() {
  const opts = useStackScreenOptions();
  return (
    <PaymentsStackNav.Navigator screenOptions={opts}>
      <PaymentsStackNav.Screen name="PaymentsHome" component={PaymentsScreen} options={{ title: 'Thanh toán' }} />
    </PaymentsStackNav.Navigator>
  );
}

function MoreStack() {
  const opts = useStackScreenOptions();
  return (
    <MoreStackNav.Navigator screenOptions={opts}>
      <MoreStackNav.Screen name="MoreHome" component={MoreScreen} options={{ title: 'Thêm' }} />
      <MoreStackNav.Screen name="Notifications" component={NotificationCenterScreen} options={{ title: 'Thông báo' }} />
      <MoreStackNav.Screen name="MonthlySummary" component={MonthlySummaryScreen} options={{ title: 'Báo cáo tháng' }} />
      <MoreStackNav.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt' }} />
    </MoreStackNav.Navigator>
  );
}

const TAB_ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid',
  Apartments: 'business',
  Guests: 'people',
  Payments: 'cash',
  More: 'ellipsis-horizontal',
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  Dashboard: 'Dashboard',
  Apartments: 'Căn hộ',
  Guests: 'Khách',
  Payments: 'Thanh toán',
  More: 'Thêm',
};

export default function AppNavigator() {
  const { colors, dark } = useAppTheme();

  const navTheme = {
    ...(dark ? NavDarkTheme : NavDefaultTheme),
    colors: {
      ...(dark ? NavDarkTheme.colors : NavDefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: BrandColors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: BrandColors.primary,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={(focused ? TAB_ICONS[route.name as keyof RootTabParamList] : `${TAB_ICONS[route.name as keyof RootTabParamList]}-outline`) as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: TAB_LABELS[route.name as keyof RootTabParamList],
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStack} />
        <Tab.Screen name="Apartments" component={ApartmentsStack} />
        <Tab.Screen name="Guests" component={GuestsStack} />
        <Tab.Screen name="Payments" component={PaymentsStack} />
        <Tab.Screen name="More" component={MoreStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
