import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../store/ThemeContext';
import { Radius, Spacing } from '../utils/theme';

interface Props {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle?: string;
  onPress?: () => void;
}

export default function MetricCard({ title, value, icon, color, subtitle, onPress }: Props) {
  const { colors } = useAppTheme();

  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: withOpacity(color, 0.12) }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color }]}>{subtitle}</Text> : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, { backgroundColor: colors.card }]}>{content}</View>;
}

function withOpacity(rgbColor: string, opacity: number): string {
  const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
  }
  return rgbColor;
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    fontSize: 13,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
