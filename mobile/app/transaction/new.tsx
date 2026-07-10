import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { Alert, Button, Card, Field } from '../../src/components/ui';
import { colors, font, formatXof, radius, spacing } from '../../src/theme';
import type { FeeStrategy, TransactionType } from '../../src/types';

const FEE_LABELS: Record<FeeStrategy, string> = {
  client_pays: 'Le client paie les frais',
  deducted: 'Frais déduits du montant',
  agent_receives: 'Frais déduits (agent)',
};

export default function NewTransactionScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [type, setType] = useState<TransactionType>('dépôt');
  const [feeStrategy, setFeeStrategy] = useState<FeeStrategy>('client_pays');
  const [amount, setAmount] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const preview = useMemo(() => {
    const value = parseFloat(amount) || 0;
    const totalFee = value * 0.05;
    const agentCommission = totalFee * 0.6;
    let walletImpact = 0;
    if (type === 'dépôt') {
      walletImpact = feeStrategy === 'client_pays' ? -value : -(value - totalFee);
    } else {
      walletImpact = value + agentCommission;
    }
    return { totalFee, agentCommission, walletImpact };
  }, [amount, type, feeStrategy]);

  const onSubmit = async () => {
    setError(null);
    const value = parseFloat(amount);
    if (!value || value < 1) {
      setError('Saisissez un montant valide.');
      return;
    }
    if (!clientPhone.trim()) {
      setError('Le téléphone du client est requis.');
      return;
    }
    setLoading(true);
    try {
      const tx = await transactionsApi.create({
        type,
        fee_strategy: feeStrategy,
        amount: value,
        client_phone: clientPhone.trim(),
      });
      await refresh();
      router.replace(`/transaction/${tx.id}`);
    } catch (e) {
      setError(apiErrorMessage(e, 'Transaction refusée.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error && <Alert message={error} />}

        <Text style={styles.label}>Type d'opération</Text>
        <View style={styles.segment}>
          <SegmentButton active={type === 'dépôt'} label="📤 Dépôt" onPress={() => setType('dépôt')} />
          <SegmentButton active={type === 'retrait'} label="📥 Retrait" onPress={() => setType('retrait')} />
        </View>

        {type === 'dépôt' && (
          <>
            <Text style={styles.label}>Gestion des frais</Text>
            <View style={styles.feeGroup}>
              {(Object.keys(FEE_LABELS) as FeeStrategy[]).map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setFeeStrategy(key)}
                  style={[styles.feeOption, feeStrategy === key && styles.feeOptionActive]}
                >
                  <View style={[styles.radio, feeStrategy === key && styles.radioActive]} />
                  <Text style={[styles.feeText, feeStrategy === key && styles.feeTextActive]}>
                    {FEE_LABELS[key]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

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

        {/* Live preview */}
        <Card style={styles.preview}>
          <Text style={styles.previewTitle}>Aperçu</Text>
          <PreviewRow label="Commission agent (3%)" value={formatXof(preview.agentCommission)} />
          <PreviewRow label="Frais totaux (5%)" value={formatXof(preview.totalFee)} />
        </Card>

        <Button
          title={type === 'dépôt' ? 'Valider le dépôt' : 'Valider le retrait'}
          onPress={onSubmit}
          loading={loading}
        />
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

function PreviewRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: 'success' | 'danger';
}) {
  const color = highlight === 'success' ? colors.success : highlight === 'danger' ? colors.danger : colors.text;
  return (
    <View style={styles.previewRow}>
      <Text style={styles.previewLabel}>{label}</Text>
      <Text style={[styles.previewValue, { color }]}>{value}</Text>
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
  feeGroup: { marginBottom: spacing.md, gap: spacing.xs },
  feeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  feeOptionActive: { borderColor: colors.blue, backgroundColor: '#e7eef6' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radioActive: { borderColor: colors.blue, borderWidth: 6 },
  feeText: { fontSize: font.sm, color: colors.text },
  feeTextActive: { fontWeight: '700', color: colors.blueDark },
  preview: { marginBottom: spacing.md, backgroundColor: colors.white },
  previewTitle: { fontSize: font.sm, fontWeight: '700', color: colors.blue, marginBottom: spacing.sm },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  previewLabel: { color: colors.textMuted, fontSize: font.sm },
  previewValue: { fontSize: font.sm, fontWeight: '700' },
  previewDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
