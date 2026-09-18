import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import PickerField from './PickerField';
import { useAppTheme } from '../store/ThemeContext';
import { daysInMonth, parseISODate, toISODate } from '../utils/formatters';
import { Spacing } from '../utils/theme';

interface Props {
  label?: string;
  value: string;
  onChange: (isoDate: string) => void;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }));

function yearOptions(centerYear: number) {
  const years: { value: string; label: string }[] = [];
  for (let y = centerYear - 3; y <= centerYear + 6; y++) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

export default function DateField({ label, value, onChange }: Props) {
  const { colors } = useAppTheme();
  const today = new Date();
  const current = value ? parseISODate(value) : today;

  const day = current.getDate();
  const month = current.getMonth() + 1;
  const year = current.getFullYear();

  const dayOptions = Array.from({ length: daysInMonth(year, month - 1) }, (_, i) => ({
    value: String(i + 1),
    label: `Ngày ${i + 1}`,
  }));

  const update = (nextDay: number, nextMonth: number, nextYear: number) => {
    const clampedDay = Math.min(nextDay, daysInMonth(nextYear, nextMonth - 1));
    onChange(toISODate(new Date(nextYear, nextMonth - 1, clampedDay)));
  };

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <View style={styles.row}>
        <View style={styles.col}>
          <PickerField value={String(day)} options={dayOptions} onChange={(v) => update(Number(v), month, year)} />
        </View>
        <View style={styles.col}>
          <PickerField value={String(month)} options={MONTH_OPTIONS} onChange={(v) => update(day, Number(v), year)} />
        </View>
        <View style={styles.col}>
          <PickerField value={String(year)} options={yearOptions(today.getFullYear())} onChange={(v) => update(day, month, Number(v))} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  col: {
    flex: 1,
  },
});
