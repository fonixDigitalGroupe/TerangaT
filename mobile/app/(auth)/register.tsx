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
const SHOP_MAX = 34;

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [shopName, setShopName] = useState('');
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
    if (!shopName.trim()) {
      setError('Indiquez le nom de votre commerce.');
      return;
    }
    if (phoneDigits.length !== 9) {
      setError('Entrez un numéro sénégalais valide (9 chiffres).');
      return;
    }
    setLoading(true);
    try {
      const otp = await authApi.sendOtp(phoneDigits, 'register');
      router.push({
        pathname: '/(auth)/code',
        params: { phone: phoneDigits, shop_name: shopName.trim(), dev_code: otp.dev_code ?? '' },
      });
    } catch (e) {
      setError(apiErrorMessage(e, 'Envoi du code impossible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Barre claire : retour */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={22} color="#F88B1A" />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              <Text style={styles.bigTitle}>Dites-nous en un peu sur votre commerce</Text>

              {error && <Alert message={error} />}

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scroll: { flexGrow: 1, padding: 22, paddingTop: 24 },
  bigTitle: { fontSize: 21, fontWeight: '700', color: '#1b3b5c', lineHeight: 28, marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', color: LABEL, marginBottom: 9 },
  field: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 12,
    justifyContent: 'center',
  },
  input: { fontSize: 16, color: '#1a1a1a', paddingHorizontal: 16 },
  counter: { alignSelf: 'flex-end', fontSize: 13, color: '#9aa3b0', marginTop: 8 },
  phoneField: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef3f8',
    borderRadius: 12,
  },
  countrySel: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16 },
  flag: { fontSize: 20 },
  snCode: { fontSize: 16, fontWeight: '700', color: LABEL },
  phoneInput: { flex: 1, fontSize: 16, color: '#1a1a1a', letterSpacing: 1 },
  cta: { backgroundColor: PRIMARY, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loginRow: { textAlign: 'center', marginTop: 22, fontSize: 14, color: '#4b5563' },
  link: { color: PRIMARY, fontWeight: '700' },
});
