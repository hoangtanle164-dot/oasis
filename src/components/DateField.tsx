import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useAppTheme } from '../store/ThemeContext';
import { formatDate, parseISODate, toISODate } from '../utils/formatters';
import { BrandColors, Radius, Spacing } from '../utils/theme';

interface Props {
  label?: string;
  value: string;
  onChange: (isoDate: string) => void;
}

export default function DateField({ label, value, onChange }: Props) {
  const { colors, dark } = useAppTheme();
  const [show, setShow] = useState(false);

  const dateValue = value ? parseISODate(value) : new Date();

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.field, { backgroundColor: dark ? '#2C2C2E' : '#F2F2F7' }]}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, { color: colors.text }]}>{value ? formatDate(value) : 'Chọn ngày'}</Text>
        <Ionicons name="calendar-outline" size={18} color={BrandColors.primary} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, selected) => {
            if (Platform.OS !== 'ios') setShow(false);
            if (event.type === 'dismissed') return;
            if (selected) onChange(toISODate(selected));
          }}
        />
      )}
      {show && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => setShow(false)}>
          <Text style={styles.doneText}>Xong</Text>
        </TouchableOpacity>
      )}
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
  field: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 15,
  },
  doneBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneText: {
    color: BrandColors.primary,
    fontWeight: '600',
  },
});
