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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { Alert } from '../../src/components/ui';
import { colors, font, spacing } from '../../src/theme';

const KEYBOARD_ACCESSORY_ID = 'transfertDoneBar';

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
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [fromNumber, setFromNumber] = useState('');
  const [toNumber, setToNumber] = useState('');
  const [fromOp, setFromOp] = useState<Operator>('wave');
  const [toOp, setToOp] = useState<Operator>('wave');
  const [supportFees, setSupportFees] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [otp, setOtp] = useState('');
  const needsOtp = fromOp === 'om';

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [amount]);

  const canSend =
    numericAmount > 0 && fromNumber.trim().length > 0 && toNumber.trim().length > 0;

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

  // « Envoyer » ouvre la page de résumé/confirmation (pas d'appel API ici).
  const onSend = () => {
    setError(null);
    if (!canSend) {
      setError('Renseignez le montant et les deux numéros.');
      return;
    }
    if (needsOtp && !otp.trim()) {
      setError('Entrez le code Orange Money (#144#391#) du numéro « De ».');
      return;
    }
    router.push({
      pathname: '/transaction/confirm',
      params: {
        amount: String(numericAmount),
        from: fromNumber.trim(),
        to: toNumber.trim(),
        fromOp,
        toOp,
        support: supportFees ? '1' : '0',
        otp: otp.trim(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
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

          <View style={styles.card}>
            {/* ===== DE ===== */}
            <Text style={styles.section}>De</Text>

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

            <View style={styles.opRow}>
              <OperatorBadge op={fromOp} onPress={() => setFromOp((o) => (o === 'wave' ? 'om' : 'wave'))} />
              <View style={styles.numberBox}>
                <Text style={styles.codeMuted}>+221</Text>
                <TextInput
                  style={[styles.numberInput, { outlineStyle: 'none' } as object]}
                  placeholder="Numéro"
                  placeholderTextColor="#9aa3b0"
                  keyboardType="phone-pad"
                  maxLength={9}
                  value={fromNumber}
                  onChangeText={(t) => setFromNumber(t.replace(/\D/g, '').slice(0, 9))}
                  inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
                />
                <Text style={styles.flag}>🇸🇳</Text>
              </View>
            </View>

            {needsOtp && (
              <View style={styles.otpBox}>
                <TextInput
                  style={[styles.numberInput, { outlineStyle: 'none' } as object]}
                  placeholder="Code Orange Money (#144#391#)"
                  placeholderTextColor="#9aa3b0"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, ''))}
                  inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
                />
              </View>
            )}

            <Pressable style={styles.checkRow} onPress={() => setSupportFees((v) => !v)}>
              <View style={[styles.checkbox, supportFees && styles.checkboxOn]}>
                {supportFees && <Text style={styles.check}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>Je supporte les frais</Text>
            </Pressable>

            <View style={styles.hr} />

            {/* ===== VERS ===== */}
            <Text style={styles.section}>Vers</Text>
            <View style={styles.opRow}>
              <OperatorBadge op={toOp} onPress={() => setToOp((o) => (o === 'wave' ? 'om' : 'wave'))} />
              <View style={styles.numberBoxLight}>
                <Text style={styles.codeMuted}>+221</Text>
                <TextInput
                  style={[styles.numberInput, { outlineStyle: 'none' } as object]}
                  placeholder="Numéro"
                  placeholderTextColor="#9aa3b0"
                  keyboardType="phone-pad"
                  maxLength={9}
                  value={toNumber}
                  onChangeText={(t) => setToNumber(t.replace(/\D/g, '').slice(0, 9))}
                  inputAccessoryViewID={Platform.OS === 'ios' ? KEYBOARD_ACCESSORY_ID : undefined}
                />
                <Text style={styles.flag}>🇸🇳</Text>
              </View>
              <Pressable style={styles.contactBtn} hitSlop={8} onPress={openContacts}>
                <MaterialIcons name="contacts" size={26} color={colors.gray} />
              </Pressable>
            </View>

            <Text style={styles.fees}>Frais : calculés par PayDunya</Text>

            <Pressable
              onPress={onSend}
              disabled={!canSend}
              style={({ pressed }) => [
                styles.sendBtn,
                !canSend && styles.sendBtnDisabled,
                pressed && canSend && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.sendText}>Envoyer</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef1f5' },
  header: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.lg,
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
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 52,
    marginBottom: spacing.md,
  },
  amountInput: { flex: 1, fontSize: font.lg, color: colors.text },
  currency: { fontSize: font.md, color: colors.textMuted, fontWeight: '700' },
  opRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  opBadgeBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opLogo: { width: 34, height: 34, borderRadius: 17 },
  numberBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 52,
    backgroundColor: colors.grayLight,
  },
  numberBoxLight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 52,
    backgroundColor: colors.white,
  },
  codeMuted: { color: colors.textMuted, fontSize: font.md, marginRight: 8, fontWeight: '600' },
  numberInput: { flex: 1, color: colors.text, fontSize: font.md },
  otpBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  flag: { fontSize: 20 },
  contactBtn: { width: 40, height: 52, alignItems: 'center', justifyContent: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#c3c9d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: colors.orange, borderColor: colors.orange },
  check: { color: '#fff', fontSize: 14, fontWeight: '900' },
  checkLabel: { fontSize: font.md, color: colors.text },
  hr: { height: 1, backgroundColor: colors.border, marginBottom: spacing.md, marginHorizontal: -spacing.md },
  fees: { textAlign: 'right', fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
  sendBtn: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#8b8b8b' },
  sendText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
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
});
