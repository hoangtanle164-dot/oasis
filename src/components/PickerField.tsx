import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../store/ThemeContext';
import { BrandColors, Radius, Spacing } from '../utils/theme';

export interface PickerOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PickerField({ label, value, options, onChange, placeholder }: Props) {
  const { colors, dark } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.field, { backgroundColor: dark ? '#2C2C2E' : '#F2F2F7' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.text, { color: selected ? colors.text : colors.textTertiary }]}>
          {selected ? selected.label : placeholder ?? 'Chọn'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{item.label}</Text>
                  {item.value === value ? (
                    <Ionicons name="checkmark" size={18} color={BrandColors.primary} />
                  ) : null}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.separator }]} />}
            />
          </View>
        </Pressable>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dropdown: {
    borderRadius: Radius.lg,
    maxHeight: 360,
    paddingVertical: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 15,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.lg,
  },
});
