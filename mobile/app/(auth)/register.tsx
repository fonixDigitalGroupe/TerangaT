import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import type { KeyboardTypeOptions } from 'react-native';
import { colors, spacing } from '../../src/theme';

// Input with a label that floats onto the border once focused or filled.
function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  const up = focused || value.length > 0;
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <Text pointerEvents="none" style={[styles.floatLabel, up && styles.floatLabelUp]}>
        {label}
      </Text>
      <TextInput
        style={[styles.floatInput, { outlineStyle: 'none' } as object]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
      />
    </View>
  );
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country: 'Sénégal',
    password: '',
  });
  const [birthPlace, setBirthPlace] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [raisonSociale, setRaisonSociale] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Format a Senegalese mobile number as "XX XXX XX XX" (9 digits) while typing.
  const onPhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 9);
    const g: string[] = [];
    if (digits.length > 0) g.push(digits.slice(0, 2));
    if (digits.length > 2) g.push(digits.slice(2, 5));
    if (digits.length > 5) g.push(digits.slice(5, 7));
    if (digits.length > 7) g.push(digits.slice(7, 9));
    setForm((f) => ({ ...f, phone: g.join(' ') }));
  };

  const onSubmit = async () => {
    setError(null);
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.first_name || !form.last_name) {
      setError('Renseignez votre prénom et votre nom.');
      return;
    }
    if (phoneDigits.length !== 9) {
      setError('Entrez un numéro sénégalais valide (9 chiffres).');
      return;
    }
    if (form.password.length !== 4) {
      setError('Le code secret doit contenir 4 chiffres.');
      return;
    }
    if (!accepted) {
      setError('Vous devez accepter les conditions générales.');
      return;
    }
    setLoading(true);
    try {
      await register({
        ...form,
        phone: phoneDigits,
        password_confirmation: form.password,
      });
    } catch (e) {
      setError(apiErrorMessage(e, 'Inscription impossible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          {/* Back */}
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Entrez vos informations</Text>
          <Text style={styles.subtitle}>
            Ces informations sont utilisées pour la création de votre compte.
          </Text>

          {error && <Alert message={error} />}

          <FloatingInput label="Prénom" value={form.first_name} onChangeText={set('first_name')} />
          <FloatingInput label="Nom" value={form.last_name} onChangeText={set('last_name')} />
          <FloatingInput label="Lieu de naissance" value={birthPlace} onChangeText={setBirthPlace} />

          <FloatingInput label="Raison sociale" value={raisonSociale} onChangeText={setRaisonSociale} />

          <View style={[styles.phoneField, phoneFocused && styles.inputWrapFocused]}>
            <Text style={styles.phoneFlag}>🇸🇳</Text>
            <Text style={styles.phoneCode}>+221</Text>
            <TextInput
              style={[styles.phoneInput, { outlineStyle: 'none' } as object]}
              placeholder="00 000 00 00"
              placeholderTextColor="#9aa3b0"
              keyboardType="phone-pad"
              maxLength={12}
              value={form.phone}
              onChangeText={onPhoneChange}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
          </View>
          <FloatingInput
            label="Code secret (4 chiffres)"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            value={form.password}
            onChangeText={(v) => set('password')(v.replace(/\D/g, '').slice(0, 4))}
          />

          {/* CGU */}
          <View style={styles.cguRow}>
            <Pressable
              style={[styles.checkbox, accepted && styles.checkboxOn]}
              onPress={() => setAccepted((v) => !v)}
            >
              {accepted && <Text style={styles.check}>✓</Text>}
            </Pressable>
            <Text style={styles.cguText}>
              J&apos;accepte les{' '}
              <Text style={styles.cguLink}>Conditions générales d&apos;utilisation</Text>
            </Text>
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.ctaText}>{loading ? 'Création…' : 'Continuer'}</Text>
          </Pressable>
        </View>
        </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  back: { paddingVertical: spacing.sm },
  backIcon: { fontSize: 34, color: '#1c1c1e', lineHeight: 34 },
  title: { fontSize: 28, fontWeight: '800', color: '#1c1c1e', marginTop: spacing.lg },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  inputWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  inputWrapFocused: { borderColor: colors.orange, borderWidth: 1.5 },
  floatInput: { fontSize: 16, color: colors.text, paddingVertical: 0 },
  floatLabel: {
    position: 'absolute',
    left: spacing.md,
    top: 12,
    fontSize: 15,
    color: '#9aa3b0',
  },
  floatLabelUp: {
    top: -9,
    left: 12,
    fontSize: 12,
    color: colors.orange,
    backgroundColor: colors.white,
    paddingHorizontal: 4,
  },
  selectField: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectValue: { fontSize: 15, color: colors.text },
  selectPlaceholder: { fontSize: 15, color: '#9aa3b0' },
  selectChevron: { fontSize: 14, color: colors.textMuted },
  phoneField: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.grayLight,
  },
  phoneFlag: { fontSize: 20, marginRight: 6 },
  phoneCode: { fontSize: 15, fontWeight: '700', color: colors.text, marginRight: 8 },
  phoneInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  regionItem: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  regionItemText: { fontSize: 16, color: colors.text },
  regionItemActive: { color: colors.orange, fontWeight: '700' },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateCancel: { color: colors.textMuted, fontSize: 16, fontWeight: '600' },
  dateOk: { color: colors.orange, fontSize: 16, fontWeight: '800' },
  scanTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  scanRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  scanCard: {
    flex: 1,
    height: 96,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanImg: { width: '100%', height: '100%' },
  scanLabel: { color: colors.textMuted, fontSize: 13, marginTop: 4, fontWeight: '600' },
  cguRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxOn: { backgroundColor: colors.orange, borderColor: colors.orange },
  check: { color: colors.white, fontSize: 15, fontWeight: '900' },
  cguText: { flex: 1, fontSize: 15, color: colors.text },
  cguLink: { color: colors.orange, textDecorationLine: 'underline' },
  cta: {
    height: 54,
    borderRadius: 10,
    backgroundColor: '#7d7d7d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
