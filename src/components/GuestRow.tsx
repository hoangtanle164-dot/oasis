import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Apartment, apartmentLabel } from '../models/Apartment';
import { useAppTheme } from '../store/ThemeContext';
import { useData } from '../store/DataContext';
import { StatusColors, Radius, Spacing } from '../utils/theme';
import { formatVNDShort } from '../utils/formatters';
import StatusBadge from './StatusBadge';

interface Props {
  apartment: Apartment;
  onPress: () => void;
}

export default function GuestRow({ apartment, onPress }: Props) {
  const { colors } = useAppTheme();
  const { getCurrentGuestStay } = useData();
  const guest = getCurrentGuestStay(apartment.id);
  const statusColor = (StatusColors as Record<string, string>)[apartment.status] ?? '#999';

  return (
    <TouchableOpacity style={[styles.row, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.roomBox, { backgroundColor: statusColor }]}>
        <Text style={styles.roomText} numberOfLines={1}>
          {apartment.roomNumber}
        </Text>
      </View>

      <View style={styles.middle}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {guest ? guest.guestName : `(Trống) ${apartmentLabel(apartment)}`}
        </Text>
        <View style={styles.metaRow}>
          {guest ? (
            <>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatVNDShort(guest.monthlyRent)}/tháng</Text>
              {guest.salesName ? (
                <Text style={[styles.meta, { color: colors.textSecondary }]}>· {guest.salesName}</Text>
              ) : null}
            </>
          ) : (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{apartmentLabel(apartment)}</Text>
          )}
        </View>
      </View>

      <StatusBadge kind="apartment" status={apartment.status} small />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  roomBox: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roomText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  middle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    marginRight: 4,
  },
});
