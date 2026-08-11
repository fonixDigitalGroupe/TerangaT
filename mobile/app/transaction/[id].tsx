import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { formatF } from '../../src/components/TransactionRow';
import { colors, font, spacing } from '../../src/theme';
import type { Transaction } from '../../src/types';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} à ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function prettyPhone(raw: string): string {
  const d = (raw ?? '').replace(/\D/g, '').replace(/^221/, '');
  return d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}

function statusInfo(status: string): { label: string; color: string; icon: 'checkmark-circle' | 'close-circle' | 'time' } {
  const s = (status ?? '').toLowerCase();
  if (['completed', 'réussi', 'reussi', 'terminé', 'termine', 'success', 'payé', 'paye'].includes(s)) {
    return { label: 'Effectué', color: colors.success, icon: 'checkmark-circle' };
  }
  if (['échoué', 'echoue', 'failed', 'cancelled', 'annulé', 'annule', 'refusé', 'refuse'].includes(s)) {
    return { label: 'Échoué', color: colors.danger, icon: 'close-circle' };
  }
  return { label: 'En attente', color: colors.orange, icon: 'time' };
}

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

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.blue} size="large" />
      </View>
    );
  }

  if (error || !tx) {
    return (
      <View style={styles.center}>
        <Alert message={error ?? 'Transaction introuvable.'} />
      </View>
    );
  }

  const isDeposit = tx.type === 'dépôt';
  const st = statusInfo(tx.status);
  const frais = Math.max(0, (tx.total ?? 0) + (tx.commission ?? 0) - tx.amount);

  const onShare = () => {
    void Share.share({
      message:
        `Téranga Transfert\n` +
        `${isDeposit ? 'Dépôt' : 'Retrait'} — ${prettyPhone(tx.client_phone)}\n` +
        `Montant : ${formatF(tx.amount)}\n` +
        `Statut : ${st.label}\n` +
        `Date : ${formatDateTime(tx.created_at)}\n` +
        `ID : ${tx.reference}`,
    });
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {/* Montant + description */}
      <Text style={[styles.amount, { color: isDeposit ? colors.danger : colors.text }]}>
        {isDeposit ? '-' : ''}{formatF(tx.amount)}
      </Text>
      <Text style={styles.description}>
        {isDeposit ? 'Dépôt' : 'Retrait'} — {prettyPhone(tx.client_phone)}
      </Text>

      {/* Carte Partager */}
      <View style={styles.card}>
        <Pressable style={styles.shareBtn} onPress={onShare}>
          <View style={styles.shareIcon}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </View>
          <Text style={styles.shareText}>Partager</Text>
        </Pressable>
      </View>

      {/* Carte détails */}
      <View style={styles.card}>
        <Row label="Statut">
          <View style={styles.statusVal}>
            <Ionicons name={st.icon} size={18} color={st.color} />
            <Text style={[styles.value, { color: st.color, marginLeft: 6 }]}>{st.label}</Text>
          </View>
        </Row>
        <Divider />
        <Row label="Frais"><Text style={styles.value}>{formatF(frais)}</Text></Row>
        <Divider />
        <Row label="Date et heure"><Text style={styles.value}>{formatDateTime(tx.created_at)}</Text></Row>
        <Divider />
        <Row label="Numéro client"><Text style={styles.value}>+221 {prettyPhone(tx.client_phone)}</Text></Row>
        <Divider />
        <Row label="ID de transaction">
          <Text style={[styles.value, styles.mono]} numberOfLines={2}>{tx.reference}</Text>
        </Row>
      </View>
    </ScrollView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f2f4f7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f4f7', padding: spacing.lg },
  content: { padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  amount: { fontSize: 40, fontWeight: '800', textAlign: 'center' },
  description: { fontSize: font.md, color: colors.text, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  shareBtn: { alignItems: 'center', gap: spacing.sm },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef1f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { fontSize: font.md, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  rowLabel: { color: colors.text, fontSize: font.md },
  rowValue: { flex: 1, alignItems: 'flex-end', paddingLeft: spacing.md },
  statusVal: { flexDirection: 'row', alignItems: 'center' },
  value: { color: colors.textMuted, fontSize: font.md, textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: font.sm },
  divider: { height: 1, backgroundColor: colors.border },
});
