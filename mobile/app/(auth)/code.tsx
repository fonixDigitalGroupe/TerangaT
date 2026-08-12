import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';

const PRIMARY = '#1A84D8';
const NAVY = '#1a2233';
const SLOTS = [0, 1, 2, 3];

/** Numéro masqué façon +221 77*****55 */
function maskPhone(p?: string): string {
  const d = (p ?? '').replace(/\D/g, '');
  if (d.length < 4) return d;
  return `${d.slice(0, 2)}*****${d.slice(-2)}`;
}

export default function CodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const { phone, shop_name, dev_code } = useLocalSearchParams<{
    phone?: string;
    shop_name?: string;
    dev_code?: string;
  }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState<string | null>(null);

  const submit = async () => {
    if (!phone) {
      setError('Numéro manquant, revenez à l’étape précédente.');
      return;
    }
    if (code.length !== 4) {
      setError('Entrez les 4 chiffres du code.');
      return;
    }
    Keyboard.dismiss();
    setError(null);
    setLoading(true);
    try {
      await authApi.checkOtp(phone, code);
      router.push({
        pathname: '/(auth)/identity',
        params: { phone, shop_name: shop_name ?? '' },
      });
    } catch (e) {
      setError(apiErrorMessage(e, 'Le code est incorrect.'));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const onChange = (text: string) => {
    setError(null);
    setResent(null);
    setCode(text.replace(/\D/g, '').slice(0, 4));
  };

  const resend = async () => {
    if (!phone) return;
    setError(null);
    try {
      await authApi.sendOtp(phone);
      setResent('Un nouveau code a été envoyé.');
    } catch (e) {
      setError(apiErrorMessage(e, 'Impossible de renvoyer le code.'));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header : retour + titre */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Vérification</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.otpCard}>
          <Text style={styles.title}>Confirmez votre identité</Text>
          <Text style={styles.subtitle}>
            Veuillez entrer le code OTP qui a été envoyé au{' '}
            <Text style={styles.phone}>+221 {maskPhone(phone)}</Text> pour valider votre compte.
          </Text>

          {dev_code ? <Text style={styles.devHint}>{dev_code}</Text> : null}

          {/* Cases OTP (clavier système) */}
          <Pressable style={styles.otpRow} onPress={() => inputRef.current?.focus()}>
            {SLOTS.map((i) => (
              <View
                key={i}
                style={[styles.otpBox, i === code.length && !loading && styles.otpBoxActive]}
              >
                <Text style={styles.otpDigit}>{code[i] ?? ''}</Text>
              </View>
            ))}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={onChange}
              keyboardType="number-pad"
              maxLength={4}
              caretHidden
              autoFocus
            />
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {resent && !error ? <Text style={styles.successText}>{resent}</Text> : null}

          {/* Renvoyer */}
          <Text style={styles.resendRow}>
            Vous n&apos;avez pas reçu le code ?{' '}
            <Text style={styles.resendLink} onPress={resend}>
              Renvoyer
            </Text>
          </Text>

          {/* Bouton Vérifier */}
          <Pressable
            onPress={submit}
            disabled={loading || code.length !== 4}
            style={({ pressed }) => [
              styles.cta,
              (loading || code.length !== 4) && styles.ctaDisabled,
              pressed && { opacity: 0.9 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Vérifier</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#1A84D8',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#fff', marginHorizontal: 8 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  otpCard: {
    paddingHorizontal: 8,
    paddingTop: 26,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: NAVY, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#8a93a3', textAlign: 'center', lineHeight: 21, marginTop: 12 },
  phone: { color: NAVY, fontWeight: '700' },
  devHint: { fontSize: 14, color: PRIMARY, fontWeight: '700', marginTop: 14 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 26 },
  otpBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: { borderColor: PRIMARY, backgroundColor: '#fff' },
  otpDigit: { fontSize: 26, fontWeight: '800', color: NAVY },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  errorText: { color: '#e2483a', fontSize: 13, fontWeight: '600', alignSelf: 'flex-start', marginTop: 10 },
  successText: { color: '#25b16a', fontSize: 13, fontWeight: '600', marginTop: 10 },
  resendRow: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' },
  resendLink: { color: NAVY, fontWeight: '800' },
  cta: {
    alignSelf: 'stretch',
    backgroundColor: PRIMARY,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  ctaDisabled: { backgroundColor: '#9cc4ea' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
