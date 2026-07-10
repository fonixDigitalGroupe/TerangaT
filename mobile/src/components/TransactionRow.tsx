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

export function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const isDeposit = tx.type === 'dépôt';

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
      </View>
      <Text style={styles.amount}>
        {isDeposit ? '' : '-'}
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
  amount: { fontSize: font.md, fontWeight: '700', color: colors.text },
});
