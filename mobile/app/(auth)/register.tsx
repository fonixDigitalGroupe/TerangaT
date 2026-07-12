import { useState } from 'react';
import {
  Image,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';

const TEAL = '#0FA9BE';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Format d'un numéro sénégalais "XX XXX XX XX" (9 chiffres)
  const onPhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 9);
    const g: string[] = [];
    if (digits.length > 0) g.push(digits.slice(0, 2));
    if (digits.length > 2) g.push(digits.slice(2, 5));
    if (digits.length > 5) g.push(digits.slice(5, 7));
    if (digits.length > 7) g.push(digits.slice(7, 9));
    setPhone(g.join(' '));
  };

  const onSubmit = async () => {
    setError(null);
    const name = fullName.trim().replace(/\s+/g, ' ');
    const phoneDigits = phone.replace(/\D/g, '');

    if (!name) {
      setError('Entrez votre nom complet.');
      return;
    }
    if (phoneDigits.length !== 9) {
      setError('Entrez un numéro sénégalais valide (9 chiffres).');
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

    const parts = name.split(' ');
    const first_name = parts[0];
    const last_name = parts.slice(1).join(' ') || parts[0];

    setLoading(true);
    try {
      await register({
        first_name,
        last_name,
        phone: phoneDigits,
        country: 'Sénégal',
        password,
        password_confirmation: confirm,
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.card}>
              {/* Logo */}
              <Image
                source={require('../../assets/logo-teranga.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Bienvenue sur Téranga</Text>
              <Text style={styles.subtitle}>Créons votre compte</Text>

              {error && <Alert message={error} />}

              {/* Nom complet */}
              <View style={styles.field}>
                <TextInput
                  style={[styles.input, { outlineStyle: 'none' } as object]}
                  placeholder="Nom complet"
                  placeholderTextColor="#9aa3b0"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Téléphone */}
              <View style={styles.phoneField}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.flag}>🇸🇳</Text>
                  <Text style={styles.code}>+221</Text>
                </View>
                <TextInput
                  style={[styles.phoneInput, { outlineStyle: 'none' } as object]}
                  placeholder="00 000 00 00"
                  placeholderTextColor="#9aa3b0"
                  keyboardType="phone-pad"
                  maxLength={12}
                  value={phone}
                  onChangeText={onPhoneChange}
                />
              </View>

              {/* Code secret */}
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

              {/* Confirmation */}
              <View style={styles.field}>
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
                <Pressable
                  style={[styles.checkbox, accepted && styles.checkboxOn]}
                  onPress={() => setAccepted((v) => !v)}
                >
                  {accepted && <Text style={styles.check}>✓</Text>}
                </Pressable>
                <Text style={styles.cguText}>
                  J&apos;accepte les <Text style={styles.link}>conditions générales d&apos;utilisation</Text>
                </Text>
              </View>

              {/* Créer */}
              <Pressable
                onPress={onSubmit}
                disabled={loading}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.ctaText}>{loading ? 'Création…' : 'Créer'}</Text>
              </Pressable>

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
  safe: { flex: 1, backgroundColor: '#eef1f5' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  logo: { width: 120, height: 48, alignSelf: 'center', marginBottom: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7b8494', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  field: {
    height: 54,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 14,
  },
  input: { fontSize: 16, color: '#1a1a1a', paddingHorizontal: 16 },
  inputPad: { paddingRight: 48 },
  eye: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  phoneField: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: '100%',
    backgroundColor: '#f5f7fa',
    borderRightWidth: 1,
    borderRightColor: '#e2e6ec',
  },
  flag: { fontSize: 18 },
  code: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  phoneInput: { flex: 1, fontSize: 16, color: '#1a1a1a', paddingHorizontal: 14 },
  cguRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 20 },
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
  checkboxOn: { backgroundColor: TEAL, borderColor: TEAL },
  check: { color: '#fff', fontSize: 14, fontWeight: '900' },
  cguText: { flex: 1, fontSize: 13, color: '#4b5563' },
  link: { color: TEAL, fontWeight: '700' },
  cta: {
    backgroundColor: TEAL,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginRow: { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#4b5563' },
});
