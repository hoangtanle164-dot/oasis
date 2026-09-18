import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BottomSheet from './BottomSheet';
import AppTextField from './AppTextField';
import PickerField from './PickerField';
import DateField from './DateField';
import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import { Apartment, ApartmentStatus } from '../models/Apartment';
import { APARTMENT_STATUS_LABELS, BUILDINGS } from '../utils/constants';
import { BrandColors, Radius, Spacing } from '../utils/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  apartment?: Apartment;
}

const STATUS_OPTIONS = (Object.keys(APARTMENT_STATUS_LABELS) as ApartmentStatus[]).map((value) => ({
  value,
  label: APARTMENT_STATUS_LABELS[value],
}));

const BUILDING_OPTIONS = BUILDINGS.map((b) => ({ value: b, label: b }));

export default function ApartmentFormSheet({ visible, onClose, apartment }: Props) {
  const { colors } = useAppTheme();
  const { addApartment, updateApartment } = useData();
  const isEdit = !!apartment;

  const [building, setBuilding] = useState<string>(BUILDINGS[0]);
  const [roomNumber, setRoomNumber] = useState('');
  const [status, setStatus] = useState<ApartmentStatus>('vacant');
  const [ownerName, setOwnerName] = useState('');
  const [ownerMonthlyRent, setOwnerMonthlyRent] = useState('');
  const [ownerLeaseStart, setOwnerLeaseStart] = useState('');
  const [ownerLeaseEnd, setOwnerLeaseEnd] = useState('');
  const [ownerPaymentDueDay, setOwnerPaymentDueDay] = useState('');
  const [electricityContract, setElectricityContract] = useState('');
  const [wifiContract, setWifiContract] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setBuilding(apartment?.building ?? BUILDINGS[0]);
      setRoomNumber(apartment?.roomNumber ?? '');
      setStatus(apartment?.status ?? 'vacant');
      setOwnerName(apartment?.ownerName ?? '');
      setOwnerMonthlyRent(apartment?.ownerMonthlyRent ? String(apartment.ownerMonthlyRent) : '');
      setOwnerLeaseStart(apartment?.ownerLeaseStart ?? '');
      setOwnerLeaseEnd(apartment?.ownerLeaseEnd ?? '');
      setOwnerPaymentDueDay(apartment?.ownerPaymentDueDay ? String(apartment.ownerPaymentDueDay) : '');
      setElectricityContract(apartment?.electricityContract ?? '');
      setWifiContract(apartment?.wifiContract ?? '');
      setNotes(apartment?.notes ?? '');
      setError('');
    }
  }, [visible, apartment]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      building,
      roomNumber,
      status,
      ownerName: ownerName || undefined,
      ownerMonthlyRent: ownerMonthlyRent ? Number(ownerMonthlyRent) : undefined,
      ownerLeaseStart: ownerLeaseStart || undefined,
      ownerLeaseEnd: ownerLeaseEnd || undefined,
      ownerPaymentDueDay: ownerPaymentDueDay ? Number(ownerPaymentDueDay) : undefined,
      electricityContract: electricityContract || undefined,
      wifiContract: wifiContract || undefined,
      notes: notes || undefined,
    };

    const result = isEdit ? await updateApartment(apartment!.id, payload) : await addApartment(payload);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Có lỗi xảy ra');
      return;
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={isEdit ? 'Sửa căn hộ' : 'Thêm căn hộ'}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.row2}>
          <View style={styles.half}>
            {isEdit ? (
              <View style={styles.readonlyWrap}>
                <Text style={[styles.readonlyLabel, { color: colors.textSecondary }]}>Tòa nhà</Text>
                <Text style={[styles.readonlyValue, { color: colors.text }]}>{building}</Text>
              </View>
            ) : (
              <PickerField label="Tòa nhà" value={building} options={BUILDING_OPTIONS} onChange={setBuilding} />
            )}
          </View>
          <View style={styles.half}>
            {isEdit ? (
              <View style={styles.readonlyWrap}>
                <Text style={[styles.readonlyLabel, { color: colors.textSecondary }]}>Số phòng</Text>
                <Text style={[styles.readonlyValue, { color: colors.text }]}>{roomNumber}</Text>
              </View>
            ) : (
              <AppTextField label="Số phòng" value={roomNumber} onChangeText={setRoomNumber} placeholder="4010" keyboardType="default" />
            )}
          </View>
        </View>

        <PickerField label="Trạng thái" value={status} options={STATUS_OPTIONS} onChange={(v) => setStatus(v as ApartmentStatus)} />

        <AppTextField label="Tên chủ nhà" value={ownerName} onChangeText={setOwnerName} placeholder="Nguyễn Văn A" />
        <AppTextField
          label="Tiền thuê/tháng (chủ nhà)"
          value={ownerMonthlyRent}
          onChangeText={setOwnerMonthlyRent}
          placeholder="0"
          keyboardType="number-pad"
        />

        <View style={styles.row2}>
          <View style={styles.half}>
            <DateField label="Bắt đầu HĐ" value={ownerLeaseStart} onChange={setOwnerLeaseStart} />
          </View>
          <View style={styles.half}>
            <DateField label="Kết thúc HĐ" value={ownerLeaseEnd} onChange={setOwnerLeaseEnd} />
          </View>
        </View>

        <AppTextField
          label="Ngày đóng tiền chủ nhà (1-28)"
          value={ownerPaymentDueDay}
          onChangeText={setOwnerPaymentDueDay}
          placeholder="1"
          keyboardType="number-pad"
        />

        <AppTextField label="Mã HĐ Điện" value={electricityContract} onChangeText={setElectricityContract} placeholder="PE..." />
        <AppTextField label="Mã HĐ Wifi" value={wifiContract} onChangeText={setWifiContract} placeholder="WF..." />
        <AppTextField label="Ghi chú" value={notes} onChangeText={setNotes} multiline placeholder="Ghi chú thêm..." />

        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          <Text style={styles.submitText}>{isEdit ? 'Lưu thay đổi' : 'Thêm căn hộ'}</Text>
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
  readonlyWrap: {
    marginBottom: Spacing.md,
  },
  readonlyLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  readonlyValue: {
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 14,
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
