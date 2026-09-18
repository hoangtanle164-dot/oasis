import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../store/ThemeContext';
import { BrandColors } from '../utils/theme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, selected, onPress }: Props) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        { backgroundColor: selected ? BrandColors.primary : colors.chipBg },
      ]}
    >
      <Text style={[styles.text, { color: selected ? '#FFFFFF' : colors.chipText }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
