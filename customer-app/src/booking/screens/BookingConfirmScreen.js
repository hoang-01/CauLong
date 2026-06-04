import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Screen from '../../shared/components/Screen';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadow } from '../../theme';
import Button from '../../shared/components/Button';
import { formatPrice } from '../../utils/formatters';
import { getCourts, getFacilities, getCourtTypes } from '../../data/mockStore';
import * as api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import PaymentOption from '../../shared/components/PaymentOption';

export default function BookingConfirmScreen({ route, navigation }) {
  const courtId = route?.params?.courtId ?? null;
  const startTime = route?.params?.startTime ?? '';
  const endTime = route?.params?.endTime ?? '';
  const total = route?.params?.total ?? 0;
  const facilityId = route?.params?.facilityId ?? null;
  const sportId = route?.params?.sportId ?? null;
  const sportNameParam = route?.params?.sportName ?? '';
  const date = route?.params?.date ?? null;
  const initialCourtName = route?.params?.courtName ?? '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [facility, setFacility] = useState(null);
  const [sport, setSport] = useState(null);
  const [courts, setCourts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' hoặc 'vnpay' khớp với backend enum
  useEffect(() => {
    async function loadData() {
      try {
        const [facilities, types, allCourts] = await Promise.all([
          getFacilities(),
          getCourtTypes(facilityId),
          getCourts({ facilityId })
        ]);
        setFacility(facilities.find(f => f.id === facilityId));
        const foundSport = types.find(s => s.id === sportId);
        setSport(foundSport);
        setCourts(allCourts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [facilityId, sportId]);

  const courtName = (id) => courts.find((c) => c.id === id)?.name ?? id;

  const getSportLabel = () => {
    const name = sport?.name || sportNameParam;
    const mapping = {
      badminton: 'Cầu lông',
      tennis: 'Tennis',
      football: 'Bóng đá',
      table_tennis: 'Bóng bàn'
    };
    return mapping[name] || name || '—';
  };
  const sportLabel = getSportLabel();

  const durationText = useMemo(() => {
    if (!startTime || !endTime) return '';
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    const startMins = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMins = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    const diff = endMins - startMins;
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h} tiếng${m > 0 ? ` ${m} phút` : ''}`;
  }, [startTime, endTime]);

  const handleConfirm = async () => {
    try {
        setSubmitting(true);
        
        const slots = [{
            court_id: courtId,
            start_at: `${date} ${startTime}`,
            end_at: `${date} ${endTime}`,
            price_cents: total
        }];

        const response = await api.createBooking({
            facility_id: facilityId,
            court_id: courtId,
            date: date,
            start_time: startTime,
            end_time: endTime,
            payment_method: paymentMethod,
        });

        if (paymentMethod === 'vnpay' && response?.paymentUrl) {
           navigation.navigate('PaymentWebView', { 
             url: response.paymentUrl,
             onPaymentSuccess: (url) => {
               navigation.navigate('MyBookings');
               Alert.alert('Thành công', 'Thanh toán đặt sân thành công qua VNPay!');
             },
             onPaymentCancel: (url) => {
               Alert.alert('Thông báo', 'Giao dịch đặt sân đã bị hủy.');
             }
           });
        } else {
           Alert.alert('Thành công', 'Đặt sân thành công!', [
               { text: 'OK', onPress: () => navigation.navigate('MyBookings') }
           ]);
        }
    } catch (error) {
        console.error("Lỗi đặt sân:", error.response?.data || error.message);
        const msg = error.response?.data?.message || 'Không thể hoàn tất đặt sân. Vui lòng thử lại.';
        Alert.alert('Lỗi', msg);
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) {
      return (
          <Screen>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary} />
              </View>
          </Screen>
      )
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Xác nhận đặt sân</Text>
        <Text style={styles.sub}>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Thông tin</Text>
          <Text style={styles.meta}>Cơ sở: {facility?.name ?? '—'}</Text>
          <Text style={styles.meta}>Bộ môn: {sportLabel}</Text>
          <Text style={styles.meta}>Ngày: {date ?? '—'}</Text>
          <Text style={styles.meta}>
            Sân/Bàn: {initialCourtName || courtName(courtId)}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Khung giờ</Text>
          <Text style={styles.item}>
            {startTime} – {endTime} ({durationText})
          </Text>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Phương thức thanh toán</Text>
          <PaymentOption 
            label="Thanh toán tại quầy" 
            selected={paymentMethod === 'cash'} 
            onPress={() => setPaymentMethod('cash')} 
            icon="cash-outline"
          />
          <PaymentOption 
            label="VNPay (Thanh toán online)" 
            selected={paymentMethod === 'vnpay'} 
            onPress={() => setPaymentMethod('vnpay')} 
            icon="card-outline"
          />
        </View>

        <View style={styles.actions}>
          <Button 
            title={paymentMethod === 'vnpay' ? "Thanh toán VNPay" : "Xác nhận đặt sân"} 
            onPress={handleConfirm}
            loading={submitting}
            fullWidth={true} 
          />
          <View style={{ height: spacing.sm }} />
          <Button title="Quay lại" variant="outline" onPress={() => navigation.goBack()} fullWidth={true} disabled={submitting} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  sub: { marginTop: 6, fontSize: fontSize.sm, color: colors.textMuted },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  label: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: fontWeight.semiBold, marginBottom: spacing.sm },
  assignmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  assignmentRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  assignmentSlot: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  assignmentCourt: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: fontWeight.bold },
  meta: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6, fontWeight: fontWeight.semiBold },
  item: { fontSize: fontSize.md, color: colors.textPrimary, marginBottom: 6 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semiBold, color: colors.textMuted },
  totalValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  actions: { marginTop: spacing.xl },
  paymentCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  paymentTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  paymentOptionSelected: {
    // borderBottomColor: colors.primary,
  },
  paymentLabel: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.medium },
  paymentLabelSelected: { color: colors.primary, fontWeight: fontWeight.bold },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  warnBox: {
    marginTop: spacing.sm,
    backgroundColor: '#FFF7ED',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: spacing.md,
  },
  warnText: { fontSize: fontSize.sm, color: '#9A3412', fontWeight: fontWeight.semiBold, lineHeight: 18 },
});

