import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, font, spacing } from '../theme';
import type { Transaction } from '../types';

const MONTHS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date}, ${time}`;
}

/** Montant façon « 5.000F » (séparateur point, suffixe F). */
export function formatF(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/\s/g, '.')}F`;
}

/** Numéro lisible : 78 596 19 59. */
function prettyPhone(raw: string): string {
  const d = (raw ?? '').replace(/\D/g, '').replace(/^221/, '');
  return d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}

type StatusKind = 'done' | 'pending' | 'failed';

function statusKind(status: string): StatusKind {
  const s = (status ?? '').toLowerCase();
  if (['completed', 'réussi', 'reussi', 'terminé', 'termine', 'success', 'payé', 'paye'].includes(s)) {
    return 'done';
  }
  if (['échoué', 'echoue', 'failed', 'cancelled', 'annulé', 'annule', 'refusé', 'refuse'].includes(s)) {
    return 'failed';
  }
  return 'pending';
}

const STATUS_LABEL: Record<StatusKind, string> = {
  done: '',
  pending: 'En attente',
  failed: 'Échoué',
};

export function TransactionRow({
  tx,
  onConfirm,
}: {
  tx: Transaction;
  onConfirm?: (tx: Transaction) => Promise<void>;
}) {
  const router = useRouter();
  const isDeposit = tx.type === 'dépôt';
  const kind = statusKind(tx.status);
  const needsConfirm = (tx.status ?? '').toLowerCase() === 'à confirmer';
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm || confirming) return;
    setConfirming(true);
    try {
      await onConfirm(tx);
    } finally {
      setConfirming(false);
    }
  };

  // Dépôt = wallet marchand débité (négatif, rouge) ; Retrait = crédité (positif, sombre).
  const sign = isDeposit ? '-' : '';
  const amountColor =
    kind === 'failed' ? colors.textMuted : isDeposit ? colors.danger : colors.text;

  const statusLabel = STATUS_LABEL[kind];
  const statusColor =
    kind === 'failed' ? colors.danger : kind === 'pending' ? colors.orange : colors.textMuted;

  return (
    <Pressable
      onPress={() => router.push(`/transaction/${tx.id}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
    >
      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {isDeposit ? 'Dépôt' : 'Retrait'} {prettyPhone(tx.client_phone)}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {formatDateTime(tx.created_at)}
          {needsConfirm ? (
            <Text style={{ color: colors.orange, fontWeight: '600' }}> · À confirmer</Text>
          ) : statusLabel ? (
            <Text style={{ color: statusColor, fontWeight: '600' }}> · {statusLabel}</Text>
          ) : null}
        </Text>
      </View>
      {needsConfirm && onConfirm ? (
        <Pressable
          onPress={handleConfirm}
          disabled={confirming}
          style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmText}>Confirmer</Text>
          )}
        </Pressable>
      ) : (
        <Text
          style={[
            styles.amount,
            { color: amountColor },
            kind === 'failed' && styles.amountFailed,
          ]}
        >
          {sign}
          {formatF(tx.amount)}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  middle: { flex: 1, paddingRight: spacing.sm },
  title: { fontSize: font.sm, fontWeight: '500', color: colors.text },
  sub: { fontSize: font.xs, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: font.sm, fontWeight: '600' },
  amountFailed: { textDecorationLine: 'line-through' },
  confirmBtn: {
    backgroundColor: colors.blue,
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  confirmText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
