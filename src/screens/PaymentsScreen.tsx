import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import PaymentRow from '../components/PaymentRow';
import RecordPaymentSheet from '../components/RecordPaymentSheet';
import { Payment } from '../models/Payment';
import { formatMonthYear, formatVND, parseISODate } from '../utils/formatters';
import { BrandColors, Radius, Spacing } from '../utils/theme';

export default function PaymentsScreen() {
  const { colors } = useAppTheme();
  const { payments, refresh, loading } = useData();

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [showPaid, setShowPaid] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const monthPayments = useMemo(() => {
    return payments.filter((p) => {
      const d = parseISODate(p.dueDate);
      return d.getFullYear() === monthCursor.getFullYear() && d.getMonth() === monthCursor.getMonth();
    });
  }, [payments, monthCursor]);

  const totalDue = monthPayments.reduce((sum, p) => sum + p.amountDue, 0);
  const totalPaid = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalRemaining = totalDue - totalPaid;

  const overdue = monthPayments.filter((p) => p.status === 'overdue');
  const dueToday = monthPayments.filter((p) => p.status === 'due_today');
  const upcoming = monthPayments.filter((p) => p.status === 'upcoming' || p.status === 'partially_paid');
  const paid = monthPayments.filter((p) => p.status === 'paid');

  const openPayment = (p: Payment) => {
    setSelectedPayment(p);
    setSheetVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <View style={styles.summaryBar}>
        <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryValue, { color: BrandColors.cardBlue }]}>{formatVND(totalDue)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tổng</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryValue, { color: BrandColors.cardGreen }]}>{formatVND(totalPaid)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Đã thu</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.summaryValue, { color: BrandColors.cardRed }]}>{formatVND(totalRemaining)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Còn lại</Text>
        </View>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'x'}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={BrandColors.primary} />}
        ListHeaderComponent={
          <View>
            <GroupHeader icon="warning" color={BrandColors.cardRed} title={`Quá hạn (${overdue.length})`} />
            {overdue.map((p) => (
              <PaymentRow key={p.id} payment={p} onPress={() => openPayment(p)} />
            ))}

            <GroupHeader icon="time" color={BrandColors.cardOrange} title={`Hôm nay (${dueToday.length})`} />
            {dueToday.map((p) => (
              <PaymentRow key={p.id} payment={p} onPress={() => openPayment(p)} />
            ))}

            <GroupHeader icon="calendar" color={BrandColors.cardBlue} title={`Sắp đến hạn (${upcoming.length})`} />
            {upcoming.map((p) => (
              <PaymentRow key={p.id} payment={p} onPress={() => openPayment(p)} />
            ))}

            <TouchableOpacity style={styles.disclosureHeader} onPress={() => setShowPaid(!showPaid)} activeOpacity={0.7}>
              <Ionicons name="checkmark-circle" size={16} color={BrandColors.cardGreen} />
              <Text style={[styles.groupTitle, { color: colors.text }]}>Đã thu ({paid.length})</Text>
              <Ionicons name={showPaid ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            {showPaid && paid.map((p) => <PaymentRow key={p.id} payment={p} onPress={() => openPayment(p)} />)}

            {monthPayments.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="cash-outline" size={40} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Chưa có thanh toán</Text>
              </View>
            ) : null}
          </View>
        }
      />

      <RecordPaymentSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} payment={selectedPayment} />
    </View>
  );
}

function GroupHeader({ icon, color, title }: { icon: keyof typeof Ionicons.glyphMap; color: string; title: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.groupHeader}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.groupTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  summaryBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  summaryBox: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    flex: 1,
  },
  disclosureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
});
