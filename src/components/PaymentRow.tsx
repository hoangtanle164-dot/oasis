import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Payment } from '../models/Payment';
import { apartmentLabel } from '../models/Apartment';
import { useAppTheme } from '../store/ThemeContext';
import { useData } from '../store/DataContext';
import { StatusColors, Radius, Spacing } from '../utils/theme';
import { formatDate, formatVND } from '../utils/formatters';
import StatusBadge from './StatusBadge';

interface Props {
  payment: Payment;
  onPress: () => void;
}

export default function PaymentRow({ payment, onPress }: Props) {
  const { colors } = useAppTheme();
  const { getApartmentById, guestStays } = useData();
  const apt = getApartmentById(payment.apartmentId);
  const guest = guestStays.find((g) => g.id === payment.guestStayId);
  const color = (StatusColors as Record<string, string>)[payment.status] ?? '#999';

  return (
    <TouchableOpacity style={[styles.row, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.middle}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {apt ? apartmentLabel(apt) : ''} · {guest?.guestName ?? ''}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatDate(payment.dueDate)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.text }]}>{formatVND(payment.amountDue)}</Text>
        <StatusBadge kind="payment" status={payment.status} small />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  middle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
});
