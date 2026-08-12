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
const LABEL = '#26415e';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
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

  const onContinue = async () => {
    setError(null);
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 9) {
      setError('Entrez un numéro sénégalais valide (9 chiffres).');
      return;
    }
    setLoading(true);
    try {
      const otp = await authApi.sendOtp(phoneDigits, 'register');
      router.push({
        pathname: '/(auth)/code',
        params: { phone: phoneDigits, dev_code: otp.dev_code ?? '' },
      });
    } catch (e) {
      setError(apiErrorMessage(e, 'Envoi du code impossible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header : retour + titre */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Inscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              <Text style={styles.bigTitle}>Entrez votre numéro de téléphone</Text>

              {error && <Alert message={error} />}

              {/* Téléphone */}
              <Text style={styles.label}>Votre numéro de téléphone</Text>
              <View style={styles.phoneField}>
                <View style={styles.countrySel}>
                  <Text style={styles.flag}>🇸🇳</Text>
                  <Text style={styles.snCode}>+221</Text>
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

              <Pressable
                onPress={onContinue}
                disabled={loading}
                style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.ctaText}>{loading ? 'Envoi…' : 'Continuer'}</Text>
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
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#1A84D8',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#fff', marginHorizontal: 8 },
  scroll: { flexGrow: 1, padding: 22, paddingTop: 24 },
  bigTitle: { fontSize: 21, fontWeight: '700', color: '#1b3b5c', lineHeight: 28, marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: LABEL, marginBottom: 9 },
  phoneField: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 10,
    overflow: 'hidden',
  },
  countrySel: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 6,
    paddingHorizontal: 14,
    backgroundColor: '#f4f6f9',
    borderRightWidth: 1,
    borderRightColor: '#e2e6ec',
  },
  flag: { fontSize: 20 },
  snCode: { fontSize: 16, fontWeight: '600', color: LABEL },
  phoneInput: { flex: 1, fontSize: 16, color: '#1a1a1a', letterSpacing: 1, paddingHorizontal: 14 },
  cta: { backgroundColor: '#1E90FF', height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginRow: { textAlign: 'center', marginTop: 22, fontSize: 14, color: '#4b5563' },
  link: { color: PRIMARY, fontWeight: '700' },
});
