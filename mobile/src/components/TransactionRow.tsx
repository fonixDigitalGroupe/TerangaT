import { Pressable, StyleSheet, Text, View } from 'react-native';
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

export function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const isDeposit = tx.type === 'dépôt';
  const kind = statusKind(tx.status);

  // Dépôt = wallet marchand débité (négatif, rouge) ; Retrait = crédité (positif, sombre).
  const sign = isDeposit ? '-' : '';
  const amountColor =
    kind === 'failed' ? colors.textMuted : isDeposit ? colors.danger : colors.text;

  const statusLabel = STATUS_LABEL[kind];

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
          {statusLabel ? ` · ${statusLabel}` : ''}
        </Text>
      </View>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  middle: { flex: 1, paddingRight: spacing.sm },
  title: { fontSize: font.md, fontWeight: '600', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, marginTop: 3 },
  amount: { fontSize: font.md, fontWeight: '700' },
  amountFailed: { textDecorationLine: 'line-through' },
});
