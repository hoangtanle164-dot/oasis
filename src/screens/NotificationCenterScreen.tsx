import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import { formatDate } from '../utils/formatters';
import { BrandColors, Spacing } from '../utils/theme';

export default function NotificationCenterScreen() {
  const { colors } = useAppTheme();
  const { notifications, markNotificationRead } = useData();

  const sections = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications.filter((n) => n.isRead);
    const result = [];
    if (unread.length > 0) result.push({ title: `Chưa đọc (${unread.length})`, data: unread });
    if (read.length > 0) result.push({ title: 'Đã đọc', data: read });
    return result;
  }, [notifications]);

  return (
    <SectionList
      style={{ backgroundColor: colors.background }}
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderSectionHeader={({ section }) => (
        <Text style={[styles.sectionTitle, { color: colors.text, backgroundColor: colors.background }]}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.card }]}
          onPress={() => markNotificationRead(item.id)}
          activeOpacity={0.7}
        >
          {!item.isRead ? <View style={styles.dot} /> : <View style={styles.dotPlaceholder} />}
          <View style={styles.middle}>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.message}
            </Text>
            <Text style={[styles.date, { color: colors.textTertiary }]}>{formatDate(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không có thông báo</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.cardBlue,
    marginRight: Spacing.sm,
    marginTop: 5,
  },
  dotPlaceholder: {
    width: 8,
    marginRight: Spacing.sm,
  },
  middle: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    marginTop: 6,
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
