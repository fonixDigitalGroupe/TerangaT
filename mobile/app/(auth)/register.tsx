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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';

const PRIMARY = '#0577DE';
const ACCENT = '#F88B1A';
const LABEL = '#26415e';
const SHOP_MAX = 34;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<1 | 2>(1);
  const [shopName, setShopName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onPhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 9);
    const g: string[] = [];
    if (digits.length > 0) g.push(digits.slice(0, 2));
    if (digits.length > 2) g.push(digits.slice(2, 5));
    if (digits.length > 5) g.push(digits.slice(5, 7));
    if (digits.length > 7) g.push(digits.slice(7, 9));
    setPhone(g.join(' '));
  };

  const goBack = () => {
    setError(null);
    if (step === 2) setStep(1);
    else router.back();
  };

  const next = () => {
    setError(null);
    if (!shopName.trim()) {
      setError('Indiquez le nom de votre commerce.');
      return;
    }
    if (phone.replace(/\D/g, '').length !== 9) {
      setError('Entrez un numéro sénégalais valide (9 chiffres).');
      return;
    }
    setStep(2);
  };

  const onSubmit = async () => {
    setError(null);
    const phoneDigits = phone.replace(/\D/g, '');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Entrez votre prénom et votre nom.');
      return;
    }
    if (password.length !== 4) {
      setError('Le code secret doit contenir 4 chiffres.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux codes ne correspondent pas.');
      return;
    }
    if (!accepted) {
      setError('Vous devez accepter les conditions générales.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phoneDigits,
        country: 'Sénégal',
        shop_name: shopName.trim(),
        password,
        password_confirmation: confirm,
      });
      const otp = await authApi.sendOtp(phoneDigits);
      router.push({
        pathname: '/(auth)/code',
        params: { phone: phoneDigits, dev_code: otp.dev_code ?? '' },
      });
    } catch (e) {
      setError(apiErrorMessage(e, 'Inscription impossible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Barre claire : retour + logo */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={goBack} hitSlop={10} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </Pressable>
        <View style={styles.logoRow}>
          <Text style={styles.logoBrand}>
            téran<Text style={{ color: ACCENT }}>g</Text>a
          </Text>
          <Text style={styles.logoDesc}>transfert</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              <Text style={styles.bigTitle}>
                {step === 1
                  ? 'Commençons 😉\nDites-nous en un peu sur votre commerce'
                  : 'Presque fini !\nVos informations personnelles'}
              </Text>

              {error && <Alert message={error} />}

              {step === 1 ? (
                <>
                  {/* Nom du commerce */}
                  <Text style={styles.label}>Quel est le nom de votre commerce ?</Text>
                  <View style={styles.field}>
                    <TextInput
                      style={[styles.input, { outlineStyle: 'none' } as object]}
                      placeholder="Nom"
                      placeholderTextColor="#9aa3b0"
                      value={shopName}
                      maxLength={SHOP_MAX}
                      onChangeText={setShopName}
                    />
                  </View>
                  <Text style={styles.counter}>{shopName.length}/{SHOP_MAX}</Text>

                  {/* Téléphone */}
                  <Text style={[styles.label, { marginTop: 22 }]}>Votre numéro de téléphone</Text>
                  <View style={styles.phoneField}>
                    <View style={styles.countrySel}>
                      <Text style={styles.flag}>🇸🇳</Text>
                      <Text style={styles.snCode}>SN</Text>
                      <Ionicons name="chevron-down" size={16} color={PRIMARY} />
                    </View>
                    <TextInput
                      style={[styles.phoneInput, { outlineStyle: 'none' } as object]}
                      placeholder="7X XXX XX XX"
                      placeholderTextColor="#aab2c0"
                      keyboardType="phone-pad"
                      maxLength={12}
                      value={phone}
                      onChangeText={onPhoneChange}
                    />
                  </View>

                  <Pressable onPress={next} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
                    <Text style={styles.ctaText}>Continuer</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  {/* Prénom / Nom */}
                  <Text style={styles.label}>Votre prénom</Text>
                  <View style={styles.field}>
                    <TextInput
                      style={[styles.input, { outlineStyle: 'none' } as object]}
                      placeholder="Prénom"
                      placeholderTextColor="#9aa3b0"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 18 }]}>Votre nom</Text>
                  <View style={styles.field}>
                    <TextInput
                      style={[styles.input, { outlineStyle: 'none' } as object]}
                      placeholder="Nom"
                      placeholderTextColor="#9aa3b0"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>

                  {/* Code secret */}
                  <Text style={[styles.label, { marginTop: 18 }]}>Définissez un code secret</Text>
                  <View style={styles.field}>
                    <TextInput
                      style={[styles.input, styles.inputPad, { outlineStyle: 'none' } as object]}
                      placeholder="Code secret (4 chiffres)"
                      placeholderTextColor="#9aa3b0"
                      keyboardType="number-pad"
                      secureTextEntry={!showPass}
                      maxLength={4}
                      value={password}
                      onChangeText={(v) => setPassword(v.replace(/\D/g, '').slice(0, 4))}
                    />
                    <Pressable style={styles.eye} hitSlop={8} onPress={() => setShowPass((s) => !s)}>
                      <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={22} color="#9aa3b0" />
                    </Pressable>
                  </View>

                  <View style={[styles.field, { marginTop: 12 }]}>
                    <TextInput
                      style={[styles.input, styles.inputPad, { outlineStyle: 'none' } as object]}
                      placeholder="Confirmer le code"
                      placeholderTextColor="#9aa3b0"
                      keyboardType="number-pad"
                      secureTextEntry={!showConfirm}
                      maxLength={4}
                      value={confirm}
                      onChangeText={(v) => setConfirm(v.replace(/\D/g, '').slice(0, 4))}
                    />
                    <Pressable style={styles.eye} hitSlop={8} onPress={() => setShowConfirm((s) => !s)}>
                      <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={22} color="#9aa3b0" />
                    </Pressable>
                  </View>

                  {/* CGU */}
                  <View style={styles.cguRow}>
                    <Pressable style={[styles.checkbox, accepted && styles.checkboxOn]} onPress={() => setAccepted((v) => !v)}>
                      {accepted && <Text style={styles.check}>✓</Text>}
                    </Pressable>
                    <Text style={styles.cguText}>
                      J&apos;accepte les <Text style={styles.link}>conditions générales d&apos;utilisation</Text>
                    </Text>
                  </View>

                  <Pressable onPress={onSubmit} disabled={loading} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
                    <Text style={styles.ctaText}>{loading ? 'Envoi…' : 'Créer mon compte'}</Text>
                  </Pressable>
                </>
              )}

              <Text style={styles.loginRow}>
                Vous avez déjà un compte ?{' '}
                <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
                  Connectez-vous
                </Text>
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f6f8fb',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#fdecd8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  logoBrand: { fontSize: 22, color: PRIMARY, fontFamily: 'Quicksand_700Bold', letterSpacing: -0.3 },
  logoDesc: { fontSize: 15, color: '#9aa7b8', fontWeight: '600' },
  scroll: { flexGrow: 1, padding: 22, paddingTop: 24 },
  bigTitle: { fontSize: 27, fontWeight: '800', color: '#1b3b5c', lineHeight: 35, marginBottom: 26 },
  label: { fontSize: 16, fontWeight: '600', color: LABEL, marginBottom: 10 },
  field: {
    height: 58,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 14,
    justifyContent: 'center',
  },
  input: { fontSize: 17, color: '#1a1a1a', paddingHorizontal: 18 },
  inputPad: { paddingRight: 48 },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  counter: { alignSelf: 'flex-end', fontSize: 13, color: '#9aa3b0', marginTop: 8 },
  phoneField: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef3f8',
    borderRadius: 14,
  },
  countrySel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16 },
  flag: { fontSize: 20 },
  snCode: { fontSize: 16, fontWeight: '700', color: LABEL },
  phoneInput: { flex: 1, fontSize: 17, color: '#1a1a1a', letterSpacing: 1 },
  cguRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 24 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#c3c9d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  check: { color: '#fff', fontSize: 14, fontWeight: '900' },
  cguText: { flex: 1, fontSize: 13, color: '#4b5563' },
  link: { color: PRIMARY, fontWeight: '700' },
  cta: { backgroundColor: ACCENT, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginRow: { textAlign: 'center', marginTop: 22, fontSize: 14, color: '#4b5563' },
});
