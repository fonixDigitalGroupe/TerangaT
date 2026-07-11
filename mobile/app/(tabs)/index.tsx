import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  InputAccessoryView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const KEYBOARD_ACCESSORY_ID = 'transfertDoneBar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { transactionsApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors, font, formatXof, radius, spacing } from '../../src/theme';
import type { FeeStrategy } from '../../src/types';

const FEE_RATE = 0.02; // 2%
const FEE_FIXED = 100; // + 100 FCFA fixed per operation

// Fee-handling strategies (deposit only), from the original workflow.
const FEE_LABELS: Partial<Record<FeeStrategy, string>> = {
  client_pays: 'Le client paie les frais en liquide',
  deducted: 'Frais déduits du montant',
  agent_receives: 'Le client supporte les frais',
};

type Operator = 'wave' | 'om';
const OP_LOGOS: Record<Operator, ReturnType<typeof require>> = {
  wave: require('../../assets/logo-wave.png'),
  om: require('../../assets/logo-om.png'),
};

/** Operator tile — tap to switch between Wave and Orange Money. */
function OperatorBadge({ op, onPress }: { op: Operator; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.opBadgeBox}>
      <Image source={OP_LOGOS[op]} style={styles.opLogo} resizeMode="cover" />
    </Pressable>
  );
}

export default function TransfertScreen() {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [feeStrategy, setFeeStrategy] = useState<FeeStrategy>('client_pays');
  const [recipientOp, setRecipientOp] = useState<Operator>('om');
  const [txType, setTxType] = useState<'dépôt' | 'retrait'>('dépôt');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const fees = numericAmount > 0 ? Math.round(numericAmount * FEE_RATE + FEE_FIXED) : 0;
  const total = numericAmount + fees; // total = montant + frais
  const canSend = numericAmount > 0 && recipient.trim().length > 0 && !sending;

  const [contactsVisible, setContactsVisible] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [search, setSearch] = useState('');

  // Load the phone contacts into our custom picker.
  const openContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Autorisez l’accès aux contacts pour en sélectionner un.');
        return;
      }
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      setContacts(data.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0));
      setSearch('');
      setContactsVisible(true);
    } catch {
      setError('Impossible de charger les contacts.');
    }
  };

  const selectContact = (raw: string) => {
    let num = raw.replace(/[^0-9]/g, '');
    if (num.startsWith('221')) num = num.slice(3); // strip Senegal country code
    setRecipient(num);
    setContactsVisible(false);
  };

  const filteredContacts = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = (c.name ?? '').toLowerCase();
    const number = c.phoneNumbers?.[0]?.number ?? '';
    return name.includes(q) || number.replace(/\s/g, '').includes(q);
  });

  const onSend = async () => {
    setError(null);
    setSuccess(null);
    if (!canSend) {
      setError('Renseignez le montant et le numéro du destinataire.');
      return;
    }
    setSending(true);
    try {
      await transactionsApi.create({
        type: txType,
        fee_strategy: feeStrategy,
        amount: numericAmount,
        client_phone: recipient.trim(),
      });
      const label = txType === 'dépôt' ? 'Dépôt' : 'Retrait';
      setSuccess(`${label} de ${formatXof(numericAmount)} — client ${recipient.trim()}.`);
      setAmount('');
      setRecipient('');
    } catch (e) {
      setError(apiErrorMessage(e, 'Transfert impossible.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header (white, extends into the status-bar area) */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View>
          <Text style={styles.brandScript}>Téranga</Text>
          <Text style={styles.brandSub}>TRANSFERT</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconBtn} hitSlop={6}>
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
          </Pressable>
          <Pressable style={styles.iconBtn} hitSlop={6}>
            <Ionicons name="settings-outline" size={24} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.content}>
        {error && <Alert message={error} />}
        {success && <Alert message={success} tone="success" />}

        <View style={styles.card}>
          {/* Type d'opération */}
          <View style={styles.typeGroup}>
            <Pressable
              onPress={() => setTxType('dépôt')}
              style={[styles.feeOption, txType === 'dépôt' && styles.feeOptionActive]}
            >
              <View style={[styles.radio, txType === 'dépôt' && styles.radioActive]} />
              <Text style={styles.feeText}>Dépôt</Text>
            </Pressable>
            <Pressable
              onPress={() => setTxType('retrait')}
              style={[styles.feeOption, txType === 'retrait' && styles.feeOptionActive]}
            >
              <View style={[styles.radio, txType === 'retrait' && styles.radioActive]} />
              <Text style={styles.feeText}>Retrait</Text>
            </Pressable>
          </View>

          {/* Vers (numéro du client) */}
          <Text style={styles.section}>
            {txType === 'dépôt' ? 'Dépôt vers' : 'Retrait depuis'}
          </Text>
          <View style={styles.opRow}>
            <OperatorBadge
              op={recipientOp}
              onPress={() => setRecipientOp((o) => (o === 'om' ? 'wave' : 'om'))}
            />
            <View style={styles.numberBox}>
              <Text style={styles.codeMuted}>+221</Text>
              <TextInput
                style={[styles.recipientInput, { outlineStyle: 'none' } as object]}
                placeholder="Numéro"
                placeholderTextColor="#9aa3b0"
                keyboardType="phone-pad"
                value={recipient}
                onChangeText={setRecipient}
                inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
              />
              <Text style={styles.flag}>🇸🇳</Text>
            </View>
            <Pressable style={styles.contactBtn} hitSlop={8} onPress={openContacts}>
              <MaterialIcons name="contacts" size={26} color={colors.gray} />
            </Pressable>
          </View>

          {/* Montant */}
          <Text style={styles.section}>Montant</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.amountInput, { outlineStyle: 'none' } as object]}
              placeholder="Montant"
              placeholderTextColor="#9aa3b0"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
            />
            <Text style={styles.currency}>FCFA</Text>
          </View>

          {/* Gestion des frais */}
          <View style={styles.hr} />
          <View style={styles.feeSection}>
            <Text style={styles.feeSectionTitle}>Gestion des frais</Text>
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

          {/* Total */}
          <Text style={styles.total}>Total : {formatXof(total)}</Text>

          <Pressable
            onPress={onSend}
            disabled={!canSend}
            style={({ pressed }) => [
              styles.sendBtn,
              !canSend && styles.sendBtnDisabled,
              pressed && canSend && { opacity: 0.9 },
            ]}
          >
            <Text style={styles.sendText}>{sending ? 'Envoi…' : 'Suivant'}</Text>
          </Pressable>
        </View>
      </View>
      </TouchableWithoutFeedback>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={KEYBOARD_ACCESSORY_ID}>
          <View style={styles.accessory}>
            <Pressable onPress={() => Keyboard.dismiss()} hitSlop={8} style={styles.accessoryBtn}>
              <Text style={styles.accessoryText}>Terminé</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}

      {/* Custom contact picker */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#dde3ec' },
  header: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  brandScript: { color: colors.white, fontSize: 30, fontFamily: 'KaushanScript_400Regular' },
  brandSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: -3,
    transform: [{ translateX: -4 }],
  },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { fontSize: font.sm, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    height: 40,
    marginBottom: spacing.md,
  },
  amountInput: { flex: 1, fontSize: font.lg, color: colors.text },
  currency: { fontSize: font.sm, color: colors.textMuted, fontWeight: '700' },
  opRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  numberBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    height: 40,
    backgroundColor: colors.grayLight,
  },
  opBadgeBox: {
    width: 40,
    height: 40,
    marginRight: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opLogo: { width: 28, height: 28, borderRadius: 14 },
  contactBtn: { marginLeft: spacing.sm, width: 34, height: 44, alignItems: 'center', justifyContent: 'center' },
  codeMuted: { color: colors.textMuted, fontSize: font.md, marginRight: 6, fontWeight: '600' },
  recipientInput: { flex: 1, color: colors.text, fontSize: font.md },
  flag: { fontSize: 20 },
  feeSection: { gap: spacing.sm },
  feeSectionTitle: {
    fontSize: font.sm,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  feeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  feeOptionActive: { borderColor: colors.border, backgroundColor: colors.white },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  radioActive: { borderColor: colors.orange, borderWidth: 6 },
  feeText: { fontSize: font.sm, color: colors.text },
  feeTextActive: { fontSize: font.sm, color: colors.text },
  hr: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
    marginHorizontal: -spacing.md,
  },
  typeGroup: { gap: spacing.sm, marginBottom: spacing.md },
  total: {
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 'auto',
    marginBottom: spacing.sm,
  },
  sendBtn: {
    backgroundColor: colors.blue,
    borderRadius: 6,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  sendBtnDisabled: { backgroundColor: '#7d7d7d' },
  sendText: { color: colors.white, fontSize: font.md, fontWeight: '600' },
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
  accessory: {
    backgroundColor: '#f1f3f6',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  accessoryBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  accessoryText: { color: colors.blue, fontSize: font.md, fontWeight: '700' },
  closeBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
