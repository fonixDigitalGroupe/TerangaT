import { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { paiementsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors, font, formatXof, spacing } from '../../src/theme';

type OpKey = 'wave' | 'om';
const OP_LOGOS: Record<OpKey, ReturnType<typeof require>> = {
  wave: require('../../assets/logo-wave.png'),
  om: require('../../assets/logo-om.png'),
};
const OP_NAMES: Record<OpKey, string> = { wave: 'Wave', om: 'Orange Money' };

function WalletRow({ label, op, phone }: { label: string; op: OpKey; phone: string }) {
  return (
    <View style={styles.walletRow}>
      <Image source={OP_LOGOS[op]} style={styles.walletLogo} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={styles.walletLabel}>{label}</Text>
        <Text style={styles.walletPhone}>+221 {phone}</Text>
      </View>
      <Text style={styles.walletOp}>{OP_NAMES[op]}</Text>
    </View>
  );
}

export default function ConfirmScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount: string;
    from: string;
    to: string;
    fromOp: OpKey;
    toOp: OpKey;
    support: string;
    otp: string;
  }>();

  const amount = Number(params.amount) || 0;
  const from = String(params.from ?? '');
  const to = String(params.to ?? '');
  const fromOp: OpKey = params.fromOp === 'om' ? 'om' : 'wave';
  const toOp: OpKey = params.toOp === 'om' ? 'om' : 'wave';
  const supportFees = params.support === '1';
  const otp = String(params.otp ?? '');

  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const onValidate = async () => {
    setError(null);
    setSending(true);
    try {
      const res = await paiementsApi.transfert({
        operator: fromOp === 'om' ? 'orange-money' : 'wave',
        amount,
        from_number: from,
        to_number: to,
        ...(fromOp === 'om' && otp ? { otp } : {}),
      });

      // Wave : ouvrir l'app Wave pour valider le débit du numéro « De »
      if (res.pay_url) {
        await Linking.openURL(res.pay_url);
      }

      // Redirige vers l'historique ; la transaction s'y affiche
      router.replace('/(tabs)/transactions');
    } catch (e) {
      setError(apiErrorMessage(e, 'Transfert impossible.'));
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header turquoise */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {error && <Alert message={error} />}

        {/* Montant en évidence */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Montant à transférer</Text>
          <Text style={styles.amountValue}>{formatXof(amount)}</Text>
        </View>

        {/* Résumé wallets */}
        <View style={styles.card}>
          <WalletRow label="Envoyeur (De)" op={fromOp} phone={from} />
          <View style={styles.arrowWrap}>
            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-down" size={18} color={colors.white} />
            </View>
          </View>
          <WalletRow label="Receveur (Vers)" op={toOp} phone={to} />
        </View>

        {/* Détails */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Montant</Text>
            <Text style={styles.detailVal}>{formatXof(amount)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Frais</Text>
            <Text style={styles.detailVal}>Calculés par PayDunya</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Frais supportés par</Text>
            <Text style={styles.detailVal}>{supportFees ? 'L’agent' : 'Le destinataire'}</Text>
          </View>
        </View>

        <Text style={styles.notice}>
          En validant, vous serez redirigé vers {OP_NAMES[fromOp]} pour confirmer le débit du
          numéro « De ». Une fois confirmé, le montant est transféré au numéro « Vers ».
        </Text>

        <Pressable
          onPress={onValidate}
          disabled={sending}
          style={({ pressed }) => [
            styles.validateBtn,
            sending && styles.validateBtnDisabled,
            pressed && !sending && { opacity: 0.9 },
          ]}
        >
          <Text style={styles.validateText}>{sending ? 'Traitement…' : 'Valider le transfert'}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.cancelBtn} disabled={sending}>
          <Text style={styles.cancelText}>Modifier</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef1f5' },
  header: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backBtn: { width: 26, alignItems: 'flex-start' },
  headerTitle: { color: colors.white, fontSize: font.lg, fontWeight: '800' },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  amountCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  amountLabel: { fontSize: font.sm, color: colors.textMuted, marginBottom: 6 },
  amountValue: { fontSize: 34, fontWeight: '900', color: colors.orange },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  walletLogo: { width: 44, height: 44, borderRadius: 22 },
  walletLabel: { fontSize: font.sm, color: colors.textMuted },
  walletPhone: { fontSize: font.md, fontWeight: '700', color: colors.text, marginTop: 2 },
  walletOp: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  arrowWrap: { alignItems: 'center', marginVertical: spacing.xs },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  detailKey: { fontSize: font.md, color: colors.textMuted },
  detailVal: { fontSize: font.md, fontWeight: '700', color: colors.text },
  detailDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  notice: { fontSize: font.sm, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  validateBtn: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateBtnDisabled: { backgroundColor: '#8b8b8b' },
  validateText: { color: colors.white, fontSize: font.md, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  cancelText: { color: colors.textMuted, fontSize: font.md, fontWeight: '600' },
});
