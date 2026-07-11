import { useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { paiementsApi, type Operator } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { Alert, Button, Card, Field } from '../../src/components/ui';
import { colors, font, formatXof, radius, spacing } from '../../src/theme';
import type { TransactionType } from '../../src/types';

const OPERATORS: { key: Operator; name: string; logo: any; fee: number }[] = [
  { key: 'wave', name: 'Wave', logo: require('../../assets/logo-wave.png'), fee: 1 },
  { key: 'orange-money', name: 'Orange Money', logo: require('../../assets/logo-om.png'), fee: 1.5 },
];

export default function NewTransactionScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [type, setType] = useState<TransactionType>('dépôt');
  const [operator, setOperator] = useState<Operator>('wave'); // Wave par défaut
  const [amount, setAmount] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const needsOtp = type === 'retrait' && operator === 'orange-money';

  const preview = useMemo(() => {
    const value = parseFloat(amount) || 0;
    const fee = OPERATORS.find((o) => o.key === operator)?.fee ?? 1;
    const commission = Math.round((value * fee) / 100);
    return { commission, fee };
  }, [amount, operator]);

  const onSubmit = async () => {
    setError(null);
    const value = parseFloat(amount);
    if (!value || value < 100) {
      setError('Saisissez un montant valide (min. 100 FCFA).');
      return;
    }
    if (!clientPhone.trim()) {
      setError('Le téléphone du client est requis.');
      return;
    }
    if (needsOtp && !otp.trim()) {
      setError('Le code Orange Money (#144#391#) est requis.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        operator,
        amount: value,
        client_phone: clientPhone.trim(),
        ...(needsOtp ? { otp: otp.trim() } : {}),
      };

      const res =
        type === 'retrait' ? await paiementsApi.retrait(payload) : await paiementsApi.depot(payload);

      // Retrait Wave : ouvrir l'app/URL Wave pour que le client valide
      if (res.pay_url) {
        await Linking.openURL(res.pay_url);
      }

      await refresh();
      router.replace('/(tabs)/transactions');
    } catch (e) {
      setError(apiErrorMessage(e, 'Opération refusée.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View>
        {error && <Alert message={error} />}

        {/* Type d'opération */}
        <Text style={styles.label}>Type d'opération</Text>
        <View style={styles.segment}>
          <SegmentButton active={type === 'dépôt'} label="📤 Dépôt" onPress={() => setType('dépôt')} />
          <SegmentButton active={type === 'retrait'} label="📥 Retrait" onPress={() => setType('retrait')} />
        </View>

        {/* Opérateur */}
        <Text style={styles.label}>Opérateur</Text>
        <View style={styles.operatorRow}>
          {OPERATORS.map((op) => (
            <Pressable
              key={op.key}
              onPress={() => setOperator(op.key)}
              style={[styles.operatorCard, operator === op.key && styles.operatorCardActive]}
            >
              <Image source={op.logo} style={styles.operatorLogo} resizeMode="contain" />
              <Text style={[styles.operatorName, operator === op.key && styles.operatorNameActive]}>
                {op.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field
          label="Montant (FCFA)"
          placeholder="10 000"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
        />
        <Field
          label="Téléphone du client"
          placeholder="77 123 45 67"
          keyboardType="phone-pad"
          value={clientPhone}
          onChangeText={setClientPhone}
        />

        {needsOtp && (
          <Field
            label="Code Orange Money (#144#391#)"
            placeholder="Code généré par le client"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
        )}

        <Card style={styles.preview}>
          <Text style={styles.previewTitle}>Aperçu</Text>
          <PreviewRow label={`Commission (${preview.fee}%)`} value={formatXof(preview.commission)} />
        </Card>

        <Button
          title={type === 'dépôt' ? 'Envoyer le dépôt' : 'Encaisser le retrait'}
          onPress={onSubmit}
          loading={loading}
        />
      </View>
      </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SegmentButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={styles.previewValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xs },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.blueLight,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentBtn: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  segmentBtnActive: { backgroundColor: colors.white },
  segmentText: { fontSize: font.md, fontWeight: '700', color: colors.textMuted },
  segmentTextActive: { color: colors.blue },
  operatorRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  operatorCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  operatorCardActive: { borderColor: colors.orange, backgroundColor: '#fff4ec' },
  operatorLogo: { width: 44, height: 44, borderRadius: radius.sm },
  operatorName: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted },
  operatorNameActive: { color: colors.orange },
  preview: { marginBottom: spacing.md, backgroundColor: colors.white },
  previewTitle: { fontSize: font.sm, fontWeight: '700', color: colors.blue, marginBottom: spacing.sm },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  previewLabel: { color: colors.textMuted, fontSize: font.sm },
  previewValue: { fontSize: font.sm, fontWeight: '700', color: colors.text },
});
