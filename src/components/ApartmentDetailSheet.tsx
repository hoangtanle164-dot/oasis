import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomSheet from './BottomSheet';
import StatusBadge from './StatusBadge';
import { useData, useApartmentComputed } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import { Apartment, apartmentLabel } from '../models/Apartment';
import { formatDate, formatVND } from '../utils/formatters';
import { BrandColors, Radius, Spacing } from '../utils/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  apartment?: Apartment;
  onAddGuest: (apartmentId: string) => void;
  onEdit: (apartment: Apartment) => void;
}

function SectionTitle({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{children}</Text>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ApartmentDetailBody({ apartment, onAddGuest, onEdit, onClose }: Omit<Props, 'visible'>) {
  const { colors } = useAppTheme();
  const { getCurrentGuestStay, getPaymentsForApartment } = useData();
  const computed = useApartmentComputed(apartment!);
  const guest = getCurrentGuestStay(apartment!.id);
  const recentPayments = getPaymentsForApartment(apartment!.id).slice(0, 3);

  const showOverstayWarning = !!(guest && apartment!.ownerLeaseEnd && new Date(guest.endDate) > new Date(apartment!.ownerLeaseEnd));

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statusRow}>
        <StatusBadge kind="apartment" status={apartment!.status} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
        <SectionTitle>Thông tin chủ nhà</SectionTitle>
        <InfoRow label="Tên chủ nhà" value={apartment!.ownerName ?? '--'} />
        <InfoRow label="Tiền thuê/tháng" value={apartment!.ownerMonthlyRent ? formatVND(apartment!.ownerMonthlyRent) : '--'} />
        <InfoRow label="Bắt đầu HĐ" value={formatDate(apartment!.ownerLeaseStart)} />
        <InfoRow label="Kết thúc HĐ" value={formatDate(apartment!.ownerLeaseEnd)} />
        {computed.isLeaseExpired ? (
          <View style={styles.warningBadge}>
            <Ionicons name="alert-circle" size={14} color={BrandColors.cardRed} />
            <Text style={[styles.warningBadgeText, { color: BrandColors.cardRed }]}>
              HĐ đã hết hạn {Math.abs(computed.leaseDaysRemaining ?? 0)} ngày
            </Text>
          </View>
        ) : computed.isLeaseExpiring ? (
          <View style={styles.warningBadge}>
            <Ionicons name="warning" size={14} color={BrandColors.cardOrange} />
            <Text style={[styles.warningBadgeText, { color: BrandColors.cardOrange }]}>
              HĐ sắp hết hạn, còn {computed.leaseDaysRemaining} ngày
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
        <SectionTitle>Hợp đồng dịch vụ</SectionTitle>
        <InfoRow label="Mã HĐ Điện ⚡" value={apartment!.electricityContract ?? '--'} />
        <InfoRow label="Mã HĐ Wifi 📶" value={apartment!.wifiContract ?? '--'} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
        <SectionTitle>Khách hiện tại</SectionTitle>
        {guest ? (
          <>
            <InfoRow label="Tên khách" value={guest.guestName} />
            <InfoRow label="Tiền thuê" value={formatVND(guest.monthlyRent)} />
            <InfoRow label="Thời gian" value={`${formatDate(guest.startDate)} - ${formatDate(guest.endDate)}`} />
            <InfoRow label="Ngày thu tiền" value={`Ngày ${guest.paymentDueDay}`} />
            <InfoRow label="Tiền cọc" value={guest.deposit ? formatVND(guest.deposit) : '--'} />
            <InfoRow label="Sale" value={guest.salesName ?? '--'} />
          </>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Chưa có khách thuê</Text>
        )}
        {showOverstayWarning ? (
          <View style={styles.warningBadge}>
            <Ionicons name="warning" size={14} color={BrandColors.accent} />
            <Text style={[styles.warningBadgeText, { color: BrandColors.accent }]}>
              Thời gian thuê của khách vượt quá hợp đồng chủ nhà
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
        <SectionTitle>Thanh toán gần đây</SectionTitle>
        {recentPayments.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Chưa có thanh toán</Text>
        ) : (
          recentPayments.map((p) => (
            <View key={p.id} style={styles.paymentRow}>
              <Text style={[styles.paymentDate, { color: colors.text }]}>{formatDate(p.dueDate)}</Text>
              <Text style={[styles.paymentAmount, { color: colors.text }]}>{formatVND(p.amountDue)}</Text>
              <StatusBadge kind="payment" status={p.status} small />
            </View>
          ))
        )}
      </View>

      {apartment!.notes ? (
        <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
          <SectionTitle>Ghi chú</SectionTitle>
          <Text style={[styles.notesText, { color: colors.text }]}>{apartment!.notes}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {apartment!.status === 'vacant' || apartment!.status === 'reserved' ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: BrandColors.primary }]}
            onPress={() => {
              onClose();
              onAddGuest(apartment!.id);
            }}
          >
            <Text style={styles.actionBtnText}>Thêm khách</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: BrandColors.primary }]}
          onPress={() => {
            onClose();
            onEdit(apartment!);
          }}
        >
          <Text style={[styles.actionBtnText, { color: BrandColors.primary }]}>Chỉnh sửa căn hộ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function ApartmentDetailSheet({ visible, onClose, apartment, onAddGuest, onEdit }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={apartment ? apartmentLabel(apartment) : undefined}>
      {apartment ? (
        <ApartmentDetailBody apartment={apartment} onAddGuest={onAddGuest} onEdit={onEdit} onClose={onClose} />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  warningBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paymentDate: {
    fontSize: 12,
    flex: 1,
  },
  paymentAmount: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
