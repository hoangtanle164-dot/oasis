import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BottomSheet from './BottomSheet';
import AppTextField from './AppTextField';
import PickerField from './PickerField';
import DateField from './DateField';
import { useData } from '../store/DataContext';
import { useAppTheme } from '../store/ThemeContext';
import { Payment } from '../models/Payment';
import { apartmentLabel } from '../models/Apartment';
import { PAYMENT_METHODS } from '../utils/constants';
import { formatVND, toISODate, todayDate } from '../utils/formatters';
import { BrandColors, Radius, Spacing } from '../utils/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  payment?: Payment;
}

export default function RecordPaymentSheet({ visible, onClose, payment }: Props) {
  const { colors } = useAppTheme();
  const { getApartmentById, recordPayment } = useData();

  const remaining = payment ? Math.max(0, payment.amountDue - payment.amountPaid) : 0;
  const apt = payment ? getApartmentById(payment.apartmentId) : undefined;

  const [amount, setAmount] = useState('');
  const [paidDate, setPaidDate] = useState(toISODate(todayDate()));
  const [method, setMethod] = useState('transfer');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && payment) {
      setAmount(String(Math.max(0, payment.amountDue - payment.amountPaid)));
      setPaidDate(toISODate(todayDate()));
      setMethod('transfer');
      setNotes('');
      setError('');
    }
  }, [visible, payment]);

  if (!payment) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    const methodLabel = PAYMENT_METHODS.find((m) => m.value === method)?.label ?? '';
    const result = await recordPayment(payment.id, Number(amount) || 0, paidDate, notes ? `${methodLabel}: ${notes}` : methodLabel);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Có lỗi xảy ra');
      return;
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Thu tiền">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.summary, { backgroundColor: colors.chipBg }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Phòng</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{apt ? apartmentLabel(apt) : ''}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Số tiền cần thu</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatVND(payment.amountDue)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Đã thu</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatVND(payment.amountPaid)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Còn lại</Text>
            <Text style={[styles.summaryValue, { color: BrandColors.cardRed }]}>{formatVND(remaining)}</Text>
          </View>
        </View>

        <AppTextField label="Số tiền thu" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="number-pad" />
        <DateField label="Ngày thu" value={paidDate} onChange={setPaidDate} />
        <PickerField label="Phương thức" value={method} options={PAYMENT_METHODS} onChange={setMethod} />
        <AppTextField label="Ghi chú" value={notes} onChangeText={setNotes} multiline placeholder="Ghi chú thêm..." />

        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
          <Text style={styles.submitText}>Xác nhận thu tiền</Text>
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
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
