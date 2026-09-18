import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../store/ThemeContext';
import { Radius, Spacing } from '../utils/theme';
import { formatVNDShort } from '../utils/formatters';

interface Props {
  label: string;
  name: string;
  amount: number;
  dateText: string;
  color: string;
}

export default function PaymentAlertRow({ label, name, amount, dateText, color }: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderLeftColor: color }]}>
      <View style={styles.left}>
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.name, { color: colors.textSecondary }]} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.text }]}>{formatVNDShort(amount)}</Text>
        <Text style={[styles.date, { color }]}>{dateText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  left: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  name: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
});
