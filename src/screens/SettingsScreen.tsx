import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import Card from '../components/Card';
import { BrandColors, Spacing } from '../utils/theme';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { settings, updateSettings } = useData();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <ReadonlyRow label="Tên" value="Oasis Retreat Management" last={false} />
        <ReadonlyRow label="Đơn vị tiền tệ" value="VND (₫)" last />
      </Card>

      <Card style={styles.card}>
        <SwitchRow
          label="Chế độ tối"
          value={settings.darkMode}
          onChange={(v) => updateSettings({ darkMode: v })}
        />
        <SwitchRow
          label="Bật thông báo"
          value={settings.notificationsEnabled}
          onChange={(v) => updateSettings({ notificationsEnabled: v })}
          last
        />
      </Card>

      <Card style={styles.card}>
        <ReadonlyRow label="Chế độ" value="Offline" last={false} />
        <ReadonlyRow label="Phiên bản" value="1.0.0" last />
      </Card>
    </ScrollView>
  );
}

function ReadonlyRow({ label, value, last }: { label: string; value: string; last: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onChange,
  last,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: BrandColors.primary }} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  card: {
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  label: {
    fontSize: 15,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
});
