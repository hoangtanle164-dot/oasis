import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import FilterChip from '../components/FilterChip';
import ApartmentRow from '../components/ApartmentRow';
import ApartmentDetailSheet from '../components/ApartmentDetailSheet';
import ApartmentFormSheet from '../components/ApartmentFormSheet';
import AddGuestStaySheet from '../components/AddGuestStaySheet';
import { Apartment, apartmentLabel } from '../models/Apartment';
import { BUILDINGS } from '../utils/constants';
import { ApartmentsStackParamList } from '../navigation/types';
import { BrandColors, Radius, Spacing } from '../utils/theme';

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'occupied', label: 'Đang thuê' },
  { value: 'vacant', label: 'Trống' },
  { value: 'reserved', label: 'Đã đặt' },
  { value: 'maintenance', label: 'Bảo trì' },
];

export default function ApartmentsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ApartmentsStackParamList, 'ApartmentsHome'>>();
  const { colors } = useAppTheme();
  const { apartments, refresh, loading } = useData();

  const [buildingFilter, setBuildingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.building) setBuildingFilter(route.params.building);
      if (route.params?.status) setStatusFilter(route.params.status);
    }, [route.params])
  );

  const [selectedApartment, setSelectedApartment] = useState<Apartment | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | undefined>();
  const [addGuestApartmentId, setAddGuestApartmentId] = useState<string | undefined>();
  const [addGuestVisible, setAddGuestVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setEditingApartment(undefined);
            setFormVisible(true);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apartments.filter((a) => {
      if (buildingFilter !== 'all' && a.building !== buildingFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (q) {
        const matches =
          a.roomNumber.toLowerCase().includes(q) ||
          (a.ownerName ?? '').toLowerCase().includes(q) ||
          apartmentLabel(a).toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [apartments, buildingFilter, statusFilter, search]);

  const sections = useMemo(() => {
    return BUILDINGS.filter((b) => buildingFilter === 'all' || buildingFilter === b)
      .map((building) => ({
        title: building,
        data: filtered.filter((a) => a.building === building).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)),
      }))
      .filter((section) => section.data.length > 0);
  }, [filtered, buildingFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        <FilterChip label="Tất cả" selected={buildingFilter === 'all'} onPress={() => setBuildingFilter('all')} />
        {BUILDINGS.map((b) => (
          <FilterChip key={b} label={b} selected={buildingFilter === b} onPress={() => setBuildingFilter(b)} />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={styles.chipsContent}>
        {STATUS_FILTERS.map((s) => (
          <FilterChip key={s.value} label={s.label} selected={statusFilter === s.value} onPress={() => setStatusFilter(s.value)} />
        ))}
      </ScrollView>

      <View style={[searchStyles.wrap, { backgroundColor: colors.chipBg, borderColor: colors.border }]}>
        <Ionicons name="search" size={16} color={colors.textTertiary} style={searchStyles.icon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm phòng, chủ nhà..."
          placeholderTextColor={colors.textTertiary}
          style={[searchStyles.input, { color: colors.text }]}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={BrandColors.primary} />}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionHeaderCount, { color: colors.textSecondary }]}>{section.data.length} căn</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ApartmentRow
            apartment={item}
            onPress={() => {
              setSelectedApartment(item);
              setDetailVisible(true);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Không có căn hộ</Text>
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
    paddingTop: Spacing.sm,
  },
  headerBtn: {
    marginRight: Spacing.sm,
  },
  chipsRow: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: Spacing.sm,
  },
  chipsContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    height: 44,
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

const searchStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 40,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 40,
  },
});
