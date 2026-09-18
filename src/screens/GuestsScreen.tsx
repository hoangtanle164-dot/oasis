import React, { useLayoutEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import FilterChip from '../components/FilterChip';
import GuestRow from '../components/GuestRow';
import ApartmentDetailSheet from '../components/ApartmentDetailSheet';
import ApartmentFormSheet from '../components/ApartmentFormSheet';
import AddGuestStaySheet from '../components/AddGuestStaySheet';
import { Apartment } from '../models/Apartment';
import { BUILDINGS } from '../utils/constants';
import { BrandColors, Spacing } from '../utils/theme';

export default function GuestsScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { apartments, refresh, loading } = useData();

  const [buildingFilter, setBuildingFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [selectedApartment, setSelectedApartment] = useState<Apartment | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | undefined>();
  const [formVisible, setFormVisible] = useState(false);
  const [addGuestApartmentId, setAddGuestApartmentId] = useState<string | undefined>();
  const [addGuestVisible, setAddGuestVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setAddGuestApartmentId(undefined);
            setAddGuestVisible(true);
          }}
          hitSlop={10}
          style={styles.headerBtn}
        >
          <Ionicons name="add-circle" size={28} color={BrandColors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const sections = useMemo(() => {
    return BUILDINGS.filter((b) => buildingFilter === 'all' || buildingFilter === b)
      .map((building) => {
        const data = apartments
          .filter((a) => a.building === building)
          .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
        const occupied = data.filter((a) => a.status === 'occupied').length;
        return { title: building, data, occupied, total: data.length };
      })
      .filter((section) => section.data.length > 0);
  }, [apartments, buildingFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        <FilterChip label="Tất cả" selected={buildingFilter === 'all'} onPress={() => setBuildingFilter('all')} />
        {BUILDINGS.map((b) => (
          <FilterChip key={b} label={b} selected={buildingFilter === b} onPress={() => setBuildingFilter(b)} />
        ))}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={BrandColors.primary} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionHeaderCount, { color: colors.textSecondary }]}>
              {section.occupied}/{section.total} thuê
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <GuestRow
            apartment={item}
            onPress={() => {
              setSelectedApartment(item);
              setDetailVisible(true);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không có khách</Text>
          </View>
        }
      />

      <ApartmentDetailSheet
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        apartment={selectedApartment}
        onAddGuest={(apartmentId) => {
          setAddGuestApartmentId(apartmentId);
          setAddGuestVisible(true);
        }}
        onEdit={(apt) => {
          setEditingApartment(apt);
          setFormVisible(true);
        }}
      />

      <ApartmentFormSheet visible={formVisible} onClose={() => setFormVisible(false)} apartment={editingApartment} />

      <AddGuestStaySheet visible={addGuestVisible} onClose={() => setAddGuestVisible(false)} apartmentId={addGuestApartmentId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBtn: {
    marginRight: Spacing.sm,
  },
  chipsRow: {
    maxHeight: 44,
    marginBottom: Spacing.xs,
  },
  chipsContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: Spacing.sm,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeaderCount: {
    fontSize: 12,
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
