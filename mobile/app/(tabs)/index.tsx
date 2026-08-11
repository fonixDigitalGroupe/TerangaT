import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Image,
  InputAccessoryView,
  Keyboard,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { paiementsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors, font, formatXof, spacing } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

const KEYBOARD_ACCESSORY_ID = 'transfertDoneBar';

// Bleu de la maquette (onglet actif + bouton principal).
const BRAND_BLUE = '#1E90FF';
// Indigo du header.
const HEADER_INDIGO = '#4F46E5';

// ===== Logique métier des frais =====
// Espèces encaissées (dépôt) = montant reçu par le client + frais (grille).
// Le marchand y gagne sa commission (50). Son wallet est donc débité de :
//   débit = montant + frais − commission_marchand
// Cette différence brut/net couvre les frais PayDunya (collecte + déboursement)
// et la commission Téranga, encaissée via PayDunya.
const MERCHANT_COMMISSION = 50; // commission marchand, en espèces (FCFA)

// Grille tarifaire des frais facturés au client (jamais une formule).
// Modifiable à tout moment sans changer la logique métier.
const FEE_GRID: { min: number; max: number; fee: number }[] = [
  { min: 100, max: 2000, fee: 150 },
  { min: 2001, max: 5000, fee: 250 },
  { min: 5001, max: 10000, fee: 400 },
  { min: 10001, max: 15000, fee: 600 },
  { min: 15001, max: 20000, fee: 800 },
  { min: 20001, max: 25000, fee: 950 },
  { min: 25001, max: 30000, fee: 1100 },
  { min: 30001, max: 35000, fee: 1300 },
  { min: 35001, max: 40000, fee: 1500 },
  { min: 40001, max: 45000, fee: 1650 },
  { min: 45001, max: 50000, fee: 1850 },
];

// Frais selon la grille ; null si le montant est hors des bornes (1 000 – 50 000).
const gridFee = (montantSouhaite: number): number | null =>
  FEE_GRID.find((r) => montantSouhaite >= r.min && montantSouhaite <= r.max)?.fee ?? null;

type Operator = 'wave' | 'om';
const OP_LOGOS: Record<Operator, ReturnType<typeof require>> = {
  wave: require('../../assets/logo-wave.png'),
  om: require('../../assets/logo-om.png'),
};
const OP_NAMES: Record<Operator, string> = {
  wave: 'Wave Sénégal',
  om: 'Max it',
};

export default function TransfertScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [toOp, setToOp] = useState<Operator>('wave');
  const [operationType, setOperationType] = useState<'depot' | 'retrait'>('depot');
  const [supportFees, setSupportFees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [operatorPickerVisible, setOperatorPickerVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  // Popup de confirmation (résumé) sur la même page
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const transferDate = new Date().toLocaleDateString('fr-FR');

  // Le wallet débité est toujours celui de l'agent : son numéro d'inscription, sur Wave.
  const agentPhone = (user?.phone ?? '').replace(/\D/g, '').replace(/^221/, '');

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const calc = useMemo(() => {
    // Montant saisi = montant que le client reçoit (dépôt) ou retire (retrait).
    const souhaite = numericAmount > 0 ? numericAmount : 0;
    const gridResult = souhaite > 0 ? gridFee(souhaite) : 0;
    const outOfRange = souhaite > 0 && gridResult === null; // hors grille (100 – 50 000)
    const frais = gridResult ?? 0;                      // frais facturés au client (grille)
    const commission = souhaite > 0 ? MERCHANT_COMMISSION : 0;
    // Espèces échangées = montant + frais ; le marchand y garde sa commission,
    // donc son wallet bouge de (montant + frais − commission).
    const especesTotal = souhaite > 0 ? souhaite + frais : 0;
    const brut = souhaite > 0 ? especesTotal - commission : 0;

    if (operationType === 'depot') {
      // Dépôt : le client remet des espèces (montant + frais).
      return { brut, frais, commission, outOfRange, debitWallet: brut, especes: especesTotal };
    }
    // Retrait : le client paie (montant + frais), le marchand est crédité.
    return { brut, frais, commission, outOfRange, creditWallet: brut, paiementClient: especesTotal };
  }, [numericAmount, operationType]);

  const canSend =
    numericAmount > 0 && !calc.outOfRange && toNumber.trim().length > 0;

  // « Envoyer » ouvre le popup de résumé/confirmation (pas d'appel API ici).
  const onSend = () => {
    setError(null);
    setSuccess(null);
    if (calc.outOfRange) {
      setError('Montant hors grille : le transfert doit être compris entre 100 et 50 000 FCFA.');
      return;
    }
    if (!canSend) {
      setError('Renseignez le montant et le numéro du client.');
      return;
    }
    setConfirmVisible(true);
  };

  // « Confirmer » dans le popup : lance le transfert réel puis redirige (Wave).
  const onConfirm = async () => {
    setError(null);
    if (!agentPhone) {
      setError("Numéro d'inscription introuvable sur votre compte.");
      return;
    }
    setSending(true);
    try {
      const res = await paiementsApi.transfert({
        operator: 'wave', // le marchand est toujours débité sur son Wave (nécessite des URLs d'action joignables côté API)
        to_operator: toOp === 'om' ? 'orange-money' : 'wave', // le client est crédité sur l'opérateur choisi
        amount: numericAmount, // montant souhaité par le client ; le backend calcule le brut à débiter
        from_number: agentPhone,
        to_number: toNumber.trim(),
      });

      // Redirige vers Wave (pay.wave.com) pour valider le débit du wallet agent
      if (res.pay_url) {
        await Linking.openURL(res.pay_url);
      }

      setConfirmVisible(false);
      setSuccess(res.message ?? `Transfert de ${formatXof(numericAmount)} initié.`);
      setAmount('');
      setToNumber('');
    } catch (e) {
      setError(apiErrorMessage(e, 'Transfert impossible.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + spacing.sm }]}>
        <View style={styles.headerLeft}>
          <Pressable hitSlop={8}>
            <Ionicons name="menu" size={28} color={colors.white} />
          </Pressable>
          <View style={styles.greeting}>
            <Text style={styles.helloText}>Hello 👋</Text>
            <Text style={styles.userName} numberOfLines={1}>{user?.name ?? 'Agent'}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.roundBtn} hitSlop={6}>
            <Ionicons name="notifications" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
            {error && !confirmVisible && <Alert message={error} />}
            {success && <Alert message={success} tone="success" />}



            <View style={styles.formContainer}>
            
            {/* Type d'opération + Opérateur sur une ligne, séparés par un trait */}
            <View style={styles.selectRow}>
              <Pressable style={[styles.selectHalf, { flex: 0.38 }]} onPress={() => setTypePickerVisible(true)}>
                <Text style={styles.selectText} numberOfLines={1}>
                  {operationType === 'depot' ? 'Dépôt' : 'Retrait'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={styles.selectDivider} />

              <Pressable style={styles.selectHalf} onPress={() => setOperatorPickerVisible(true)}>
                <Image source={OP_LOGOS[toOp]} style={styles.opLogoSmall} resizeMode="cover" />
                <Text style={[styles.selectText, { marginLeft: 8 }]} numberOfLines={1}>
                  {OP_NAMES[toOp]}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            {/* Champ Mobile */}
            <View style={[styles.cleanInputWrapper, { flexDirection: 'row', alignItems: 'center', paddingRight: 12 }]}>
              <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginLeft: 4, marginRight: 4 }}>+221</Text>
              <TextInput
                style={[styles.cleanInput, { outlineStyle: 'none', flex: 1, paddingLeft: 4, backgroundColor: 'transparent' } as object]}
                placeholder="Mobile"
                placeholderTextColor="#9aa3b0"
                keyboardType="phone-pad"
                maxLength={9}
                value={toNumber}
                onChangeText={(t) => setToNumber(t.replace(/\D/g, '').slice(0, 9))}
                inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
              />
              <Text style={{ fontSize: 18 }}>🇸🇳</Text>
            </View>

            {/* Montant */}
            <View style={{ marginBottom: spacing.md }}>
               <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4, marginLeft: 4, fontWeight: '500' }}>
                 {operationType === 'depot' ? 'Montant à transférer :' : 'Espèces à remettre au client :'}
               </Text>
               <View style={styles.cleanInputWrapper}>
                 <TextInput
                   style={[styles.cleanInput, { outlineStyle: 'none' } as object]}
                   placeholder="0"
                   placeholderTextColor="#9aa3b0"
                   keyboardType="number-pad"
                   value={amount}
                   onChangeText={setAmount}
                   inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
                 />
               </View>
            </View>

            {/* Résumé Dynamique */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Résumé de l'opération</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais :</Text>
                <Text style={styles.summaryValue}>{formatXof(calc.frais)}</Text>
              </View>

              {operationType === 'depot' ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Débit de votre wallet :</Text>
                  <Text style={styles.summaryValueRed}>-{formatXof(calc.debitWallet)}</Text>
                </View>
              ) : (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Votre wallet sera crédité :</Text>
                  <Text style={styles.summaryValueGreen}>+{formatXof(calc.creditWallet)}</Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={onSend}
              disabled={!canSend}
              style={({ pressed }) => [
                styles.proceedBtn,
                !canSend && styles.proceedBtnDisabled,
                pressed && canSend && { opacity: 0.9 },
                { marginTop: spacing.xl, marginHorizontal: spacing.xl }
              ]}
            >
              <Text style={styles.proceedBtnText}>Procéder</Text>
            </Pressable>
            </View>





          </ScrollView>
        </TouchableWithoutFeedback>
      </View>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
          <View style={styles.accessory}>
            <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8} style={styles.accessoryBtn}>
              <Text style={styles.accessoryText}>Terminé</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}

      {/* Feuille de sélection du type d'opération */}
      <Modal
        visible={typePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setTypePickerVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Type d'opération</Text>
            {(['depot', 'retrait'] as const).map((t) => (
              <Pressable
                key={t}
                style={styles.sheetOption}
                onPress={() => {
                  setOperationType(t);
                  setTypePickerVisible(false);
                }}
              >
                <Text style={[styles.sheetOptionText, { marginLeft: 0 }]}>
                  {t === 'depot' ? 'Dépôt' : 'Retrait'}
                </Text>
                {operationType === t && (
                  <Ionicons name="checkmark" size={20} color={BRAND_BLUE} style={{ marginLeft: 'auto' }} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Feuille de sélection de l'opérateur */}
      <Modal
        visible={operatorPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOperatorPickerVisible(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setOperatorPickerVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Choisir l'opérateur</Text>
            {(['wave', 'om'] as Operator[]).map((opt) => (
              <Pressable
                key={opt}
                style={styles.sheetOption}
                onPress={() => {
                  setToOp(opt);
                  setOperatorPickerVisible(false);
                }}
              >
                <Image source={OP_LOGOS[opt]} style={styles.opLogo} resizeMode="cover" />
                <Text style={styles.sheetOptionText}>{OP_NAMES[opt]}</Text>
                {toOp === opt && (
                  <Ionicons name="checkmark" size={20} color={BRAND_BLUE} style={{ marginLeft: 'auto' }} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Popup de confirmation (résumé) */}
      <Modal
        visible={confirmVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !sending && setConfirmVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.summaryCard, { width: '100%', marginBottom: 0, padding: spacing.lg }]}>
            <Text style={styles.summaryTitle}>Confirmer l'opération</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Client :</Text>
              <Text style={styles.summaryValue}>+221 {toNumber}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Opérateur :</Text>
              <Text style={styles.summaryValue}>{toOp === 'wave' ? 'Wave' : 'Orange Money'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Type :</Text>
              <Text style={styles.summaryValue}>{operationType === 'depot' ? 'Dépôt' : 'Retrait'}</Text>
            </View>

            <View style={[styles.dashed, { marginVertical: spacing.md }]} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frais :</Text>
              <Text style={styles.summaryValue}>{formatXof(calc.frais)}</Text>
            </View>

            {operationType === 'depot' ? (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Débit de votre wallet :</Text>
                  <Text style={styles.summaryValueRed}>-{formatXof(calc.debitWallet)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Espèces à encaisser :</Text>
                  <Text style={styles.summaryValueGreen}>+{formatXof(calc.especes)}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Votre wallet sera crédité :</Text>
                  <Text style={styles.summaryValueGreen}>+{formatXof(calc.creditWallet)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Le client paiera :</Text>
                  <Text style={styles.summaryValueRed}>-{formatXof(calc.paiementClient)}</Text>
                </View>
              </>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Votre commission :</Text>
              <Text style={styles.summaryValueGreen}>+{formatXof(calc.commission)}</Text>
            </View>

            {error && confirmVisible ? (
              <View style={{ marginTop: spacing.sm }}>
                <Alert message={error} />
              </View>
            ) : null}

            <View style={styles.confirmActions}>
              <Pressable
                onPress={onConfirm}
                disabled={sending}
                style={({ pressed }) => [
                  styles.proceedBtn,
                  styles.confirmActionBtn,
                  sending && styles.proceedBtnDisabled,
                  pressed && !sending && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.proceedBtnText}>{sending ? 'Traitement…' : 'Confirmer'}</Text>
              </Pressable>

              <Pressable
                onPress={() => setConfirmVisible(false)}
                disabled={sending}
                style={[styles.confirmCancel, styles.confirmActionBtn]}
              >
                <Text style={styles.confirmCancelText}>Modifier</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: HEADER_INDIGO,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  greeting: { marginLeft: spacing.md, flex: 1 },
  helloText: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  userName: { fontSize: 16, fontWeight: '700', color: colors.white, marginTop: 1 },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: { flexGrow: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
  topCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  welcomeCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 130,
  },
  welcomeText: {
    fontSize: 12,
    color: colors.text,
    alignSelf: 'flex-start',
  },
  welcomeName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  agentMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  scannerCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
  },
  scannerText: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.xs,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  cleanInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 6,
    height: 50,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 6,
    height: 50,
    marginBottom: spacing.md,
  },
  selectHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: spacing.md,
  },
  selectDivider: { width: 1, height: '100%', backgroundColor: '#e2e6ec' },
  selectText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  opLogoSmall: { width: 22, height: 22, borderRadius: 11 },
  opLogo: { width: 26, height: 26, borderRadius: 13 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionText: { fontSize: 15, fontWeight: '600', color: colors.text, marginLeft: 12 },
  cleanInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  contactIconBtn: {
    padding: spacing.xs,
  },
  contactBtnOut: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  proceedBtn: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 6,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnDisabled: {
    backgroundColor: '#a9d4ff',
  },
  proceedBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e6ec',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  summaryValueRed: {
    fontSize: 13,
    color: '#e74c3c',
    fontWeight: '700',
  },
  summaryValueGreen: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '700',
  },
  recentSection: {
    marginTop: spacing.md,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.sm,
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5b6675',
  },
  recentLink: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  recentEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  recentEmptyIcon: {
    marginBottom: spacing.xs,
  },
  recentEmptyText: {
    fontSize: 14,
    color: '#8A99AC',
    fontWeight: '400',
  },
  accessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#ebecf0',
    paddingHorizontal: 16,
    height: 44,
  },
  accessoryBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  accessoryText: { color: colors.blue, fontSize: font.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    height: '88%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    height: 48,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, fontSize: font.md, color: colors.text },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactInitial: { fontSize: font.lg, fontWeight: '700', color: colors.gray },
  contactName: { fontSize: font.md, fontWeight: '500', color: colors.text },
  contactNumber: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  contactDivider: { height: 1, backgroundColor: colors.border },
  closeBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  // ===== Popup de confirmation =====
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  confirmCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  // En-tête du reçu
  receiptHeader: {
    backgroundColor: '#f0f2f5',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e6ec',
  },
  receiptLogoBrand: { width: 32, height: 32 },
  receiptBrand: { color: colors.text, fontSize: font.md, fontWeight: '800', letterSpacing: 0.5 },
  receiptSubtitle: { color: colors.textMuted, fontSize: font.xs, marginTop: 1 },
  receiptBody: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  receiptKey: { fontSize: font.sm, color: colors.textMuted },
  receiptValWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  receiptOpLogo: { width: 16, height: 16, borderRadius: 8 },
  receiptVal: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  dashed: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e2e6ec',
    marginVertical: spacing.xs,
  },
  solidDivider: { height: 1, backgroundColor: '#cdd3dc', marginTop: spacing.xs, marginBottom: 2 },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  receiptTotalKey: { fontSize: font.md, fontWeight: '800', color: colors.text },
  receiptTotalVal: { fontSize: font.lg, fontWeight: '900', color: colors.text },
  confirmValidate: {
    backgroundColor: colors.orange,
    borderRadius: 6,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  confirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  confirmActionBtn: { flex: 1 },
  confirmCancel: { alignItems: 'center', justifyContent: 'center', height: 48 },
  confirmCancelText: { color: colors.textMuted, fontSize: font.md, fontWeight: '600' },
});
