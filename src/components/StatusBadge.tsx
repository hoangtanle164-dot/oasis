import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { StatusColors } from '../utils/theme';
import { APARTMENT_STATUS_LABELS, GUEST_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../utils/constants';

type Kind = 'apartment' | 'payment' | 'guest';

interface Props {
  kind: Kind;
  status: string;
  small?: boolean;
}

function labelFor(kind: Kind, status: string): string {
  if (kind === 'apartment') return APARTMENT_STATUS_LABELS[status] ?? status;
  if (kind === 'payment') return PAYMENT_STATUS_LABELS[status] ?? status;
  return GUEST_STATUS_LABELS[status] ?? status;
}

export default function StatusBadge({ kind, status, small }: Props) {
  const color = (StatusColors as Record<string, string>)[status] ?? '#999999';
  const label = labelFor(kind, status);

  return (
    <View
      style={[
        styles.badge,
        small && styles.badgeSmall,
        { backgroundColor: withOpacity(color, 0.15) },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, small && styles.textSmall, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function withOpacity(rgbColor: string, opacity: number): string {
  const match = rgbColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
  }
  return rgbColor;
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
});
