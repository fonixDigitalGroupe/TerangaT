import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  FlatList,
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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { paiementsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors, font, formatXof, spacing } from '../../src/theme';
import { useAuth } from '../../src/auth/AuthContext';

const KEYBOARD_ACCESSORY_ID = 'transfertDoneBar';

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

function OperatorBadge({ op, onPress }: { op: Operator; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.opBadgeBox}>
      <Image source={OP_LOGOS[op]} style={styles.opLogo} resizeMode="cover" />
    </Pressable>
  );
}

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

  // Contacts picker
  const [contactsVisible, setContactsVisible] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [search, setSearch] = useState('');

  const openContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Autorisez l’accès aux contacts pour en sélectionner un.');
        return;
      }
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
      setContacts(data.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0));
      setSearch('');
      setContactsVisible(true);
    } catch {
      setError('Impossible de charger les contacts.');
    }
  };

  const selectContact = (raw: string) => {
    let num = raw.replace(/[^0-9]/g, '');
    if (num.startsWith('221')) num = num.slice(3);
    setToNumber(num);
    setContactsVisible(false);
  };

  const filteredContacts = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = (c.name ?? '').toLowerCase();
    const number = c.phoneNumbers?.[0]?.number ?? '';
    return name.includes(q) || number.replace(/\s/g, '').includes(q);
  });

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
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* En-tête épuré : avatar · cloche */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="person-outline" size={20} color={colors.textMuted} />
        </View>
        <Pressable style={styles.headerIcon} hitSlop={6}>
          <Ionicons name="notifications-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.contentContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
            {error && !confirmVisible && <Alert message={error} />}
            {success && <Alert message={success} tone="success" />}



            <View style={styles.formContainer}>
            
            {/* Sélecteur Dépôt / Retrait */}
            <View style={styles.segment}>
              <Pressable
                style={[styles.segmentBtn, operationType === 'depot' && styles.segmentBtnActive]}
                onPress={() => setOperationType('depot')}
              >
                <Text style={[styles.segmentText, operationType === 'depot' && styles.segmentTextActive]}>Dépôt</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, operationType === 'retrait' && styles.segmentBtnActive]}
                onPress={() => setOperationType('retrait')}
              >
                <Text style={[styles.segmentText, operationType === 'retrait' && styles.segmentTextActive]}>Retrait</Text>
              </Pressable>
            </View>

            {/* Input Mobile avec Opérateur */}
            <View style={styles.mobileRow}>
              <OperatorBadge op={toOp} onPress={() => setToOp((o) => (o === 'wave' ? 'om' : 'wave'))} />
              <View style={[styles.cleanInputWrapper, { flex: 1, marginBottom: 0, marginLeft: spacing.sm, backgroundColor: '#f0f2f5', flexDirection: 'row', alignItems: 'center', paddingRight: 12 }]}>
                <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', marginLeft: 16, marginRight: 4 }}>+221</Text>
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
              <Pressable style={styles.contactBtnOut} hitSlop={8} onPress={openContacts}>
                <MaterialIcons name="contacts" size={26} color={colors.gray} />
              </Pressable>
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
                { width: '100%', marginTop: spacing.md }
              ]}
            >
              <Text style={styles.proceedBtnText}>
                {operationType === 'retrait' ? 'Demander le paiement' : 'Valider le Dépôt'}
              </Text>
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

      {/* Contact picker */}
      <Modal
        visible={contactsVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setContactsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { outlineStyle: 'none' } as object]}
                placeholder="Nom ou Numéro..."
                placeholderTextColor="#9aa3b0"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <FlatList
              data={filteredContacts}
              keyExtractor={(_item, i) => String(i)}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={styles.contactDivider} />}
              renderItem={({ item }) => {
                const number = item.phoneNumbers?.[0]?.number ?? '';
                const name = item.name ?? '';
                const initial = name ? name[0].toUpperCase() : '';
                return (
                  <Pressable style={styles.contactRow} onPress={() => selectContact(number)}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactInitial}>{initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {name ? <Text style={styles.contactName}>{name}</Text> : null}
                      <Text style={styles.contactNumber}>{number}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
            <Pressable style={styles.closeBtn} onPress={() => setContactsVisible(false)}>
              <Ionicons name="close" size={28} color={colors.white} />
            </Pressable>
          </View>
        </View>
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
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
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
    paddingTop: spacing.md,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.blueLight,
    borderRadius: 10,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: colors.blue,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.blue,
  },
  segmentTextActive: {
    color: colors.white,
  },
  cleanInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  opBadgeBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  opLogo: { width: 30, height: 30, borderRadius: 15 },
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
    backgroundColor: colors.orange,
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnDisabled: {
    backgroundColor: '#ffd7af',
  },
  proceedBtnText: {
    color: colors.white,
    fontSize: 16,
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
    fontSize: 14,
    fontWeight: '700',
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
    borderRadius: 12,
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
    borderRadius: 12,
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
