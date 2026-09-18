import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import Card from '../components/Card';
import { formatMonthYear, formatVND, parseISODate } from '../utils/formatters';
import { BrandColors, Spacing } from '../utils/theme';

export default function MonthlySummaryScreen() {
  const { colors } = useAppTheme();
  const { apartments, payments } = useData();

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const monthPayments = useMemo(() => {
    return payments.filter((p) => {
      const d = parseISODate(p.dueDate);
      return d.getFullYear() === monthCursor.getFullYear() && d.getMonth() === monthCursor.getMonth();
    });
  }, [payments, monthCursor]);

  const expectedRevenue = monthPayments.reduce((sum, p) => sum + p.amountDue, 0);
  const collected = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const shortfall = Math.max(0, expectedRevenue - collected);
  const ownerCost = apartments.filter((a) => a.status === 'occupied').reduce((sum, a) => sum + (a.ownerMonthlyRent ?? 0), 0);
  const grossMargin = expectedRevenue - ownerCost;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.monthSelector}>
        <TouchableOpacity
          onPress={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={BrandColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.monthText, { color: colors.text }]}>{formatMonthYear(monthCursor)}</Text>
        <TouchableOpacity
          onPress={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
          hitSlop={10}
        >
          <Ionicons name="chevron-forward" size={22} color={BrandColors.primary} />
        </TouchableOpacity>
      </View>

      <Card>
        <SummaryLine label="Dự kiến thu" value={expectedRevenue} color={BrandColors.cardBlue} />
        <SummaryLine label="Đã thu" value={collected} color={BrandColors.cardGreen} />
        <SummaryLine label="Còn thiếu" value={shortfall} color={BrandColors.cardOrange} />
        <SummaryLine label="Chi chủ nhà" value={ownerCost} color={BrandColors.cardRed} />
        <SummaryLine
          label="Lãi gộp ước tính"
          value={grossMargin}
          color={grossMargin >= 0 ? BrandColors.cardGreen : BrandColors.cardRed}
          last
        />
      </Card>
    </ScrollView>
  );
}

function SummaryLine({ label, value, color, last }: { label: string; value: number; color: string; last?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.line, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <Text style={[styles.lineLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.lineValue, { color }]}>{formatVND(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  monthText: {
    fontSize: 17,
    fontWeight: '700',
    marginHorizontal: Spacing.xl,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  lineLabel: {
    fontSize: 14,
  },
  lineValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
