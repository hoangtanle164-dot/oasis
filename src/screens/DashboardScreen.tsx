import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import Card from '../components/Card';
import MetricCard from '../components/MetricCard';
import PaymentAlertRow from '../components/PaymentAlertRow';
import ApartmentDetailSheet from '../components/ApartmentDetailSheet';
import ApartmentFormSheet from '../components/ApartmentFormSheet';
import AddGuestStaySheet from '../components/AddGuestStaySheet';
import { Apartment, apartmentLabel } from '../models/Apartment';
import { formatDate, formatVND, todayDate, toISODate } from '../utils/formatters';
import {
  buildBuildingStats,
  buildFinancialSummary,
  buildGuestPaymentReminders,
  buildLeaseWarnings,
  buildOwnerPaymentReminders,
} from '../utils/dashboardStats';
import { BrandColors, Radius, Spacing } from '../utils/theme';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const { apartments, guestStays, payments, refresh, loading } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const [selectedApartment, setSelectedApartment] = useState<Apartment | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | undefined>();
  const [formVisible, setFormVisible] = useState(false);
  const [addGuestApartmentId, setAddGuestApartmentId] = useState<string | undefined>();
  const [addGuestVisible, setAddGuestVisible] = useState(false);

  const openApartmentDetail = (apartment?: Apartment) => {
    if (!apartment) return;
    setSelectedApartment(apartment);
    setDetailVisible(true);
  };

  const goToApartments = (params: { building?: string; status?: string }) => {
    navigation.navigate('Apartments', { screen: 'ApartmentsHome', params });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const total = apartments.length;
  const occupied = apartments.filter((a) => a.status === 'occupied').length;
  const vacant = apartments.filter((a) => a.status === 'vacant').length;
  const reserved = apartments.filter((a) => a.status === 'reserved').length;
  const maintenance = apartments.filter((a) => a.status === 'maintenance').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  const guestReminders = useMemo(() => buildGuestPaymentReminders(apartments, guestStays, payments), [apartments, guestStays, payments]);
  const ownerReminders = useMemo(() => buildOwnerPaymentReminders(apartments), [apartments]);
  const buildingStats = useMemo(() => buildBuildingStats(apartments), [apartments]);
  const leaseWarnings = useMemo(() => buildLeaseWarnings(apartments), [apartments]);
  const financial = useMemo(() => buildFinancialSummary(apartments, guestStays), [apartments, guestStays]);

  const maxBuildingCount = Math.max(1, ...buildingStats.map((b) => b.total));

  const overduePayments = useMemo(() => payments.filter((p) => p.status === 'overdue'), [payments]);
  const dueTodayPayments = useMemo(() => payments.filter((p) => p.status === 'due_today'), [payments]);
  const upcomingPayments = useMemo(() => payments.filter((p) => p.status === 'upcoming'), [payments]);

  const apartmentById = new Map(apartments.map((a) => [a.id, a]));
  const guestById = new Map(guestStays.map((g) => [g.id, g]));

  return (
    <>
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={BrandColors.primary} />}
    >
      <LinearGradient
        colors={[BrandColors.primaryDark, BrandColors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View>
          <Text style={styles.bannerGreeting}>Xin chào! 👋</Text>
          <Text style={styles.bannerDate}>{formatDate(toISODate(todayDate()))}</Text>
        </View>
        <View style={styles.bannerRight}>
          <Text style={styles.bannerPercent}>{occupancyRate}%</Text>
          <Text style={styles.bannerPercentLabel}>Lấp đầy</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <MetricCard
          title="Tổng căn hộ"
          value={total}
          icon="business"
          color={BrandColors.cardBlue}
          onPress={() => goToApartments({ building: 'all', status: 'all' })}
        />
        <MetricCard
          title="Đang thuê"
          value={occupied}
          icon="person"
          color={BrandColors.cardGreen}
          onPress={() => goToApartments({ building: 'all', status: 'occupied' })}
        />
        <MetricCard
          title="Trống"
          value={vacant}
          icon="exit-outline"
          color="#999999"
          onPress={() => goToApartments({ building: 'all', status: 'vacant' })}
        />
        <MetricCard
          title="Đã đặt"
          value={reserved}
          icon="calendar"
          color={BrandColors.cardPurple}
          subtitle={maintenance > 0 ? `Bảo trì: ${maintenance}` : undefined}
          onPress={() => goToApartments({ building: 'all', status: 'reserved' })}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Ionicons name="notifications" size={18} color={colors.text} />
        <Text style={[styles.sectionHeaderText, { color: colors.text }]}>Lịch nhắc hẹn</Text>
      </View>

      <Card>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderHeaderLeft}>
            <Ionicons name="cash" size={18} color={BrandColors.cardGreen} />
            <Text style={[styles.reminderTitle, { color: colors.text }]}>Thu tiền khách</Text>
          </View>
          {guestReminders.overdue.length + guestReminders.dueToday.length + guestReminders.upcoming7.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {guestReminders.overdue.length + guestReminders.dueToday.length + guestReminders.upcoming7.length}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.countsRow}>
          <Text style={[styles.countText, { color: BrandColors.cardRed }]}>Quá hạn: {guestReminders.overdue.length}</Text>
          <Text style={[styles.countText, { color: BrandColors.cardOrange }]}>Hôm nay: {guestReminders.dueToday.length}</Text>
          <Text style={[styles.countText, { color: BrandColors.cardBlue }]}>Sắp đến hạn: {guestReminders.upcoming7.length}</Text>
        </View>

        {guestReminders.urgent.length > 0 ? (
          guestReminders.urgent.map((item) => (
            <PaymentAlertRow
              key={item.payment.id}
              label={item.apartment ? apartmentLabel(item.apartment) : ''}
              name={item.guest?.guestName ?? ''}
              amount={item.payment.amountDue - item.payment.amountPaid}
              dateText={item.daysUntilDue < 0 ? `Quá hạn ${-item.daysUntilDue} ngày` : item.daysUntilDue === 0 ? 'Hôm nay' : formatDate(item.payment.dueDate)}
              color={item.daysUntilDue < 0 ? BrandColors.cardRed : BrandColors.cardOrange}
              onPress={() => openApartmentDetail(item.apartment)}
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>✅ Không có khoản nào cần thu</Text>
        )}
      </Card>

      <Card>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderHeaderLeft}>
            <Ionicons name="home" size={18} color={BrandColors.cardPurple} />
            <Text style={[styles.reminderTitle, { color: colors.text }]}>Đóng tiền chủ nhà</Text>
          </View>
          {ownerReminders.overdue.length + ownerReminders.dueToday.length + ownerReminders.upcoming7.length > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {ownerReminders.overdue.length + ownerReminders.dueToday.length + ownerReminders.upcoming7.length}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.countsRow}>
          <Text style={[styles.countText, { color: BrandColors.cardRed }]}>Quá hạn: {ownerReminders.overdue.length}</Text>
          <Text style={[styles.countText, { color: BrandColors.cardOrange }]}>Hôm nay: {ownerReminders.dueToday.length}</Text>
          <Text style={[styles.countText, { color: BrandColors.cardBlue }]}>Sắp đến hạn: {ownerReminders.upcoming7.length}</Text>
        </View>

        {ownerReminders.urgent.length > 0 ? (
          ownerReminders.urgent.map((item) => (
            <PaymentAlertRow
              key={item.apartment.id}
              label={apartmentLabel(item.apartment)}
              name={item.apartment.ownerName ?? ''}
              amount={item.apartment.ownerMonthlyRent ?? 0}
              dateText={item.daysRemaining < 0 ? `Quá hạn ${-item.daysRemaining} ngày` : item.daysRemaining === 0 ? 'Hôm nay' : `Còn ${item.daysRemaining} ngày`}
              color={item.daysRemaining < 0 ? BrandColors.cardRed : BrandColors.cardOrange}
              onPress={() => openApartmentDetail(item.apartment)}
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>✅ Không có khoản nào cần đóng</Text>
        )}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Thống kê theo tòa</Text>
        <View style={styles.chart}>
          {buildingStats.map((b) => (
            <View key={b.building} style={styles.chartCol}>
              <View style={styles.chartBars}>
                <View
                  style={[
                    styles.chartBar,
                    { height: (b.occupied / maxBuildingCount) * 100, backgroundColor: BrandColors.cardGreen },
                  ]}
                />
                <View
                  style={[styles.chartBar, { height: (b.vacant / maxBuildingCount) * 100, backgroundColor: '#999999' }]}
                />
              </View>
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>{b.building}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: BrandColors.cardGreen }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Đang thuê</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#999999' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Trống</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Chi tiết tòa nhà</Text>
        {buildingStats.map((b) => (
          <TouchableOpacity
            key={b.building}
            style={styles.buildingRow}
            activeOpacity={0.6}
            onPress={() => goToApartments({ building: b.building, status: 'all' })}
          >
            <Ionicons name="business-outline" size={20} color={BrandColors.primary} style={styles.buildingIcon} />
            <View style={styles.buildingMiddle}>
              <Text style={[styles.buildingName, { color: colors.text }]}>{b.building}</Text>
              <Text style={[styles.buildingCounts, { color: colors.textSecondary }]}>
                {b.total} tổng · {b.occupied} đang thuê · {b.vacant} trống
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${b.total > 0 ? (b.occupied / b.total) * 100 : 0}%`, backgroundColor: BrandColors.cardGreen },
                  ]}
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Cảnh báo thanh toán</Text>
        {overduePayments.length + dueTodayPayments.length + upcomingPayments.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>✅ Không có cảnh báo thanh toán</Text>
        ) : (
          <>
            {overduePayments.length > 0 && (
              <View>
                <Text style={[styles.groupLabel, { color: BrandColors.cardRed }]}>Quá hạn ({overduePayments.length})</Text>
                {overduePayments.slice(0, 5).map((p) => (
                  <PaymentAlertRow
                    key={p.id}
                    label={apartmentById.get(p.apartmentId) ? apartmentLabel(apartmentById.get(p.apartmentId)!) : ''}
                    name={guestById.get(p.guestStayId)?.guestName ?? ''}
                    amount={p.amountDue - p.amountPaid}
                    dateText={formatDate(p.dueDate)}
                    color={BrandColors.cardRed}
                    onPress={() => openApartmentDetail(apartmentById.get(p.apartmentId))}
                  />
                ))}
              </View>
            )}
            {dueTodayPayments.length > 0 && (
              <View>
                <Text style={[styles.groupLabel, { color: BrandColors.cardOrange }]}>Hôm nay cần thu ({dueTodayPayments.length})</Text>
                {dueTodayPayments.slice(0, 5).map((p) => (
                  <PaymentAlertRow
                    key={p.id}
                    label={apartmentById.get(p.apartmentId) ? apartmentLabel(apartmentById.get(p.apartmentId)!) : ''}
                    name={guestById.get(p.guestStayId)?.guestName ?? ''}
                    amount={p.amountDue - p.amountPaid}
                    dateText={formatDate(p.dueDate)}
                    color={BrandColors.cardOrange}
                    onPress={() => openApartmentDetail(apartmentById.get(p.apartmentId))}
                  />
                ))}
              </View>
            )}
            {upcomingPayments.length > 0 && (
              <View>
                <Text style={[styles.groupLabel, { color: BrandColors.cardBlue }]}>Sắp đến hạn ({upcomingPayments.length})</Text>
                {upcomingPayments.slice(0, 5).map((p) => (
                  <PaymentAlertRow
                    key={p.id}
                    label={apartmentById.get(p.apartmentId) ? apartmentLabel(apartmentById.get(p.apartmentId)!) : ''}
                    name={guestById.get(p.guestStayId)?.guestName ?? ''}
                    amount={p.amountDue - p.amountPaid}
                    dateText={formatDate(p.dueDate)}
                    color={BrandColors.cardBlue}
                    onPress={() => openApartmentDetail(apartmentById.get(p.apartmentId))}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </Card>

      <Card>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Hợp đồng chủ nhà</Text>
        {leaseWarnings.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>✅ Tất cả hợp đồng còn hạn</Text>
        ) : (
          leaseWarnings.map(({ apartment, daysRemaining }) => (
            <TouchableOpacity
              key={apartment.id}
              style={styles.leaseRow}
              activeOpacity={0.6}
              onPress={() => openApartmentDetail(apartment)}
            >
              <View style={styles.leaseLeft}>
                <Text style={[styles.leaseLabel, { color: colors.text }]}>{apartmentLabel(apartment)}</Text>
                <Text style={[styles.leaseOwner, { color: colors.textSecondary }]}>{apartment.ownerName ?? '--'}</Text>
              </View>
              <View
                style={[
                  styles.leaseBadge,
                  { backgroundColor: daysRemaining < 0 ? BrandColors.cardRed : daysRemaining <= 30 ? BrandColors.cardOrange : BrandColors.cardBlue },
                ]}
              >
                <Text style={styles.leaseBadgeText}>{daysRemaining < 0 ? 'Đã hết hạn' : `Còn ${daysRemaining} ngày`}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </Card>

      <Card style={styles.lastCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tài chính tháng này</Text>
        <View style={styles.financeRow}>
          <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Thu từ khách</Text>
          <Text style={[styles.financeValue, { color: BrandColors.cardGreen }]}>{formatVND(financial.totalGuestRevenue)}</Text>
        </View>
        <View style={styles.financeRow}>
          <Text style={[styles.financeLabel, { color: colors.textSecondary }]}>Chi cho chủ nhà</Text>
          <Text style={[styles.financeValue, { color: BrandColors.cardRed }]}>{formatVND(financial.totalOwnerCost)}</Text>
        </View>
        <View style={[styles.financeRow, styles.financeDivider, { borderTopColor: colors.border }]}>
          <Text style={[styles.financeLabel, { color: colors.text, fontWeight: '700' }]}>Lãi gộp</Text>
          <Text style={[styles.financeValue, { color: financial.grossMargin >= 0 ? BrandColors.cardGreen : BrandColors.cardRed }]}>
            {formatVND(financial.grossMargin)}
          </Text>
        </View>
      </Card>
    </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  banner: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bannerGreeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bannerDate: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  bannerPercent: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  bannerPercentLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  reminderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: BrandColors.cardRed,
    borderRadius: 999,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  countsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBar: {
    width: 10,
    marginHorizontal: 2,
    borderRadius: 3,
    minHeight: 2,
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  buildingIcon: {
    marginRight: Spacing.sm,
  },
  buildingMiddle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  buildingName: {
    fontSize: 14,
    fontWeight: '700',
  },
  buildingCounts: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: 6,
  },
  leaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  leaseLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  leaseLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  leaseOwner: {
    fontSize: 12,
    marginTop: 2,
  },
  leaseBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  leaseBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  financeDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    paddingTop: 10,
  },
  financeLabel: {
    fontSize: 14,
  },
  financeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  lastCard: {
    marginBottom: 0,
  },
});
