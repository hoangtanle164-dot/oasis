import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import BottomSheet from './BottomSheet';
import AppTextField from './AppTextField';
import PickerField from './PickerField';
import DateField from './DateField';
import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import { apartmentLabel } from '../models/Apartment';
import { RENTAL_TYPES } from '../utils/constants';
import { daysUntil, toISODate, todayDate } from '../utils/formatters';
import { BrandColors, Radius, Spacing } from '../utils/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  apartmentId?: string;
}

export default function AddGuestStaySheet({ visible, onClose, apartmentId }: Props) {
  const { colors } = useAppTheme();
  const { apartments, addGuestStay } = useData();

  const availableApartments = useMemo(
    () => apartments.filter((a) => a.status === 'vacant' || a.status === 'reserved' || a.id === apartmentId),
    [apartments, apartmentId]
  );
  const apartmentOptions = availableApartments.map((a) => ({ value: a.id, label: apartmentLabel(a) }));

  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [rentalType, setRentalType] = useState('monthly');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [paymentDueDay, setPaymentDueDay] = useState('1');
  const [deposit, setDeposit] = useState('');
  const [salesName, setSalesName] = useState('');
  const [startDate, setStartDate] = useState(toISODate(todayDate()));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedApartmentId(apartmentId ?? (apartmentOptions[0]?.value ?? ''));
      setGuestName('');
      setRentalType('monthly');
      setMonthlyRent('');
      setPaymentDueDay('1');
      setDeposit('');
      setSalesName('');
      setStartDate(toISODate(todayDate()));
      setEndDate('');
      setNotes('');
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, apartmentId]);

  const selectedApartment = apartments.find((a) => a.id === selectedApartmentId);
  const showLeaseWarning =
    selectedApartment?.ownerLeaseEnd && endDate && daysUntil(selectedApartment.ownerLeaseEnd) < daysUntil(endDate);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await addGuestStay({
      apartmentId: selectedApartmentId,
      guestName,
      rentalType,
      startDate,
      endDate,
      monthlyRent: Number(monthlyRent) || 0,
      paymentDueDay: Number(paymentDueDay) || 1,
      deposit: deposit ? Number(deposit) : undefined,
      salesName: salesName || undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Có lỗi xảy ra');
      return;
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Thêm khách">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <PickerField
          label="Chọn phòng"
          value={selectedApartmentId}
          options={apartmentOptions}
          onChange={setSelectedApartmentId}
          placeholder="Chọn phòng trống"
        />
        <AppTextField label="Tên khách" value={guestName} onChangeText={setGuestName} placeholder="Nguyễn Văn A" />

        <PickerField label="Hình thức thuê" value={rentalType} options={RENTAL_TYPES} onChange={setRentalType} />

        <AppTextField
          label="Tiền thuê/tháng"
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          placeholder="0"
          keyboardType="number-pad"
        />

        <View style={styles.row2}>
          <View style={styles.half}>
            <AppTextField
              label="Ngày thu tiền (1-28)"
              value={paymentDueDay}
              onChangeText={setPaymentDueDay}
              placeholder="1"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.half}>
            <AppTextField label="Tiền cọc" value={deposit} onChangeText={setDeposit} placeholder="0" keyboardType="number-pad" />
          </View>
        </View>

        <AppTextField label="Sale phụ trách" value={salesName} onChangeText={setSalesName} placeholder="Tên nhân viên" />

        <View style={styles.row2}>
          <View style={styles.half}>
            <DateField label="Ngày bắt đầu" value={startDate} onChange={setStartDate} />
          </View>
          <View style={styles.half}>
            <DateField label="Ngày kết thúc" value={endDate} onChange={setEndDate} />
          </View>
        </View>

        <AppTextField label="Ghi chú" value={notes} onChangeText={setNotes} multiline placeholder="Ghi chú thêm..." />

        {showLeaseWarning ? (
          <View style={styles.warningBox}>
            <Ionicons name="warning" size={16} color={BrandColors.accent} />
            <Text style={styles.warningText}>Thời gian thuê của khách vượt quá hợp đồng chủ nhà</Text>
          </View>
        ) : null}

        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          <Text style={styles.submitText}>Thêm khách</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217,166,33,0.15)',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  warningText: {
    color: BrandColors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
