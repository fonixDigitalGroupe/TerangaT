import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert, Badge, Card } from '../../src/components/ui';
import { colors, font, formatXof, radius, spacing } from '../../src/theme';
import type { Transaction } from '../../src/types';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await transactionsApi.show(Number(id));
      setTx(data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.blue} size="large" />
      </View>
    );
  }

  if (error || !tx) {
    return (
      <View style={styles.content}>
        <Alert message={error ?? 'Transaction introuvable.'} />
      </View>
    );
  }

  const isDeposit = tx.type === 'dépôt';
  const date = new Date(tx.created_at).toLocaleString('fr-FR');

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.amountHeader}>
        <Badge label={isDeposit ? 'Dépôt' : 'Retrait'} tone={isDeposit ? 'orange' : 'blue'} />
        <Text style={styles.amount}>{formatXof(tx.amount)}</Text>
        <Badge label={tx.status === 'completed' ? 'Complétée' : tx.status} tone="success" />
      </View>

      <Card style={styles.card}>
        <Row label="Référence" value={tx.reference} />
        <Divider />
        <Row label="Téléphone client" value={tx.client_phone} />
        <Divider />
        <Row label="Date" value={date} />
        <Divider />
        <Row label="Montant" value={formatXof(tx.amount)} />
        <Divider />
        <Row label="Commission agent" value={formatXof(tx.commission)} />
        <Divider />
        <Row label="Total" value={formatXof(tx.total)} bold />
      </Card>

      {tx.commission_breakdown && (
        <>
          <Text style={styles.sectionTitle}>Répartition des commissions</Text>
          <Card style={styles.card}>
            <Row label="Part agent (60%)" value={formatXof(tx.commission_breakdown.agent_amount)} />
            <Divider />
            <Row label="Part plateforme (40%)" value={formatXof(tx.commission_breakdown.platform_amount)} />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { fontWeight: '800', color: colors.blue }]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  amountHeader: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.lg },
  amount: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  card: { padding: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { color: colors.textMuted, fontSize: font.sm },
  rowValue: { color: colors.text, fontSize: font.sm, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
});
