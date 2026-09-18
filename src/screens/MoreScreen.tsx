import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import Card from '../components/Card';
import { MoreStackParamList } from '../navigation/types';
import { BrandColors, Spacing } from '../utils/theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'MoreHome'>;

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const { apartments, guestStays, notifications, doExport, doImport, doReset } = useData();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleImport = async () => {
    const ok = await doImport();
    if (ok) Alert.alert('Thành công', 'Đã nhập dữ liệu.');
  };

  const handleReset = () => {
    Alert.alert('Khôi phục dữ liệu gốc', 'Toàn bộ dữ liệu hiện tại sẽ bị xóa và thay bằng dữ liệu mẫu ban đầu. Bạn có chắc chắn?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Khôi phục',
        style: 'destructive',
        onPress: async () => {
          await doReset();
          Alert.alert('Thành công', 'Đã khôi phục dữ liệu gốc.');
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <LinearGradient colors={[BrandColors.primaryDark, BrandColors.primary]} style={styles.headerIcon}>
          <Ionicons name="business" size={26} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Oasis Retreat</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Quản lý căn hộ offline</Text>
      </View>

      <SectionLabel title="Báo cáo" />
      <Card style={styles.menuCard}>
        <MenuRow
          icon="notifications-outline"
          label="Thông báo"
          badge={unreadCount > 0 ? unreadCount : undefined}
          onPress={() => navigation.navigate('Notifications')}
        />
        <Divider />
        <MenuRow icon="stats-chart-outline" label="Báo cáo tháng" onPress={() => navigation.navigate('MonthlySummary')} last />
      </Card>

      <SectionLabel title="Dữ liệu" />
      <Card style={styles.menuCard}>
        <MenuRow icon="share-outline" label="Xuất dữ liệu (Backup)" onPress={doExport} />
        <Divider />
        <MenuRow icon="download-outline" label="Nhập dữ liệu (Restore)" onPress={handleImport} />
        <Divider />
        <MenuRow icon="refresh-outline" label="Khôi phục dữ liệu gốc" onPress={handleReset} destructive last />
      </Card>

      <SectionLabel title="Cài đặt" />
      <Card style={styles.menuCard}>
        <MenuRow icon="settings-outline" label="Cài đặt" onPress={() => navigation.navigate('Settings')} last />
      </Card>

      <SectionLabel title="Thông tin" />
      <Card style={styles.menuCard}>
        <InfoLine label="Số căn hộ" value={String(apartments.length)} />
        <InfoLine label="Số khách" value={String(guestStays.length)} />
        <InfoLine label="Phiên bản" value="1.0.0" last />
      </Card>
    </ScrollView>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>;
}

function Divider() {
  const { colors } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: colors.separator }]} />;
}

function MenuRow({
  icon,
  label,
  onPress,
  badge,
  destructive,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: number;
  destructive?: boolean;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  const color = destructive ? BrandColors.cardRed : colors.text;

  return (
    <TouchableOpacity style={[styles.menuRow, last && styles.menuRowLast]} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon} size={20} color={destructive ? BrandColors.cardRed : BrandColors.primary} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      {badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

function InfoLine({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.menuRow, last && styles.menuRowLast]}>
      <Text style={[styles.menuLabel, { color: colors.text, marginLeft: 0 }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  menuRowLast: {},
  menuLabel: {
    fontSize: 15,
    marginLeft: Spacing.md,
    flex: 1,
  },
  menuBadge: {
    backgroundColor: BrandColors.cardRed,
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginRight: Spacing.sm,
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg + 20 + Spacing.md,
  },
});
