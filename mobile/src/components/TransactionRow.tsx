import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, font, radius, spacing } from '../theme';
import { formatXof } from '../theme';
import type { Transaction } from '../types';

const MONTHS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} à ${time}`;
}

type StatusKind = 'done' | 'pending' | 'failed';

/** Normalise le statut serveur en 3 états d'affichage. */
function statusInfo(status: string): { kind: StatusKind; label: string; color: string; bg: string } {
  const s = (status ?? '').toLowerCase();
  if (['completed', 'réussi', 'reussi', 'terminé', 'termine', 'success', 'payé', 'paye'].includes(s)) {
    return { kind: 'done', label: 'Réussi', color: colors.success, bg: colors.successBg };
  }
  if (['échoué', 'echoue', 'failed', 'cancelled', 'annulé', 'annule', 'refusé', 'refuse'].includes(s)) {
    return { kind: 'failed', label: 'Échoué', color: colors.danger, bg: colors.dangerBg };
  }
  return { kind: 'pending', label: 'En attente', color: colors.orangeDark, bg: '#fdecd8' };
}

export function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const isDeposit = tx.type === 'dépôt';
  const st = statusInfo(tx.status);
  const debited = st.kind === 'done'; // l'argent n'est réellement débité qu'une fois « Réussi »

  return (
    <Pressable
      onPress={() => router.push(`/transaction/${tx.id}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.icon, isDeposit ? styles.iconPlus : styles.iconMinus]}>
        <Text style={[styles.sign, isDeposit ? styles.signPlus : styles.signMinus]}>
          {isDeposit ? '+' : '−'}
        </Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.title}>{isDeposit ? 'Dépôt' : 'Retrait'}</Text>
        <Text style={styles.date}>{formatDateTime(tx.created_at)}</Text>
        <View style={[styles.badge, { backgroundColor: st.bg }]}>
          <View style={[styles.dot, { backgroundColor: st.color }]} />
          <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          !debited && styles.amountMuted,
          st.kind === 'failed' && styles.amountFailed,
        ]}
      >
        {debited && isDeposit ? '' : debited ? '-' : ''}
        {formatXof(tx.amount)}
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
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconMinus: { backgroundColor: colors.grayLight },
  iconPlus: { backgroundColor: '#ffe3d3' },
  sign: { fontSize: 22, fontWeight: '800', marginTop: -2 },
  signMinus: { color: colors.textMuted },
  signPlus: { color: colors.orange },
  middle: { flex: 1 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  date: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    marginTop: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  badgeText: { fontSize: font.xs, fontWeight: '700' },
  amount: { fontSize: font.md, fontWeight: '700', color: colors.text },
  amountMuted: { color: colors.textMuted },
  amountFailed: { color: colors.textMuted, textDecorationLine: 'line-through' },
});
