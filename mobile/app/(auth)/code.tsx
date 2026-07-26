import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthContext';
import { authApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors } from '../../src/theme';

const PRIMARY = '#0577DE';
const ACCENT = '#F88B1A';
const NAVY = '#1b3b5c';
const SLOTS = [0, 1, 2, 3];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function formatPhone(p?: string): string {
  const d = (p ?? '').replace(/\D/g, '');
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

export default function CodeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { verifyOtp } = useAuth();
  const { phone, dev_code } = useLocalSearchParams<{ phone?: string; dev_code?: string }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState<string | null>(null);

  const submit = async (value: string) => {
    if (!phone) {
      setError('Numéro manquant, revenez à l’étape précédente.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone, value);
    } catch (e) {
      setError(apiErrorMessage(e, 'Code incorrect. Réessayez.'));
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length === 4 && !loading) void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const onKey = (k: string) => {
    if (loading) return;
    setError(null);
    if (k === '⌫') {
      setCode((c) => c.slice(0, -1));
    } else if (k !== '') {
      setCode((c) => (c.length < 4 ? c + k : c));
    }
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
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </Pressable>
        <View style={styles.logoRow}>
          <Text style={styles.logoBrand}>
            t<Text style={{ color: ACCENT }}>é</Text>ranga
          </Text>
          <Text style={styles.logoDesc}>transfert</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Saisissez le code de validation envoyé par <Text style={styles.channel}>SMS</Text> au{'\n'}
          <Text style={styles.phone}>+221 {formatPhone(phone)}</Text>
        </Text>

        {dev_code ? <Text style={styles.devHint}>🔧 Mode test — code : {dev_code}</Text> : null}
        {error && <Alert message={error} />}
        {resent && !error ? <Alert message={resent} tone="success" /> : null}

        {/* Cases OTP */}
        <View style={styles.otpRow}>
          {SLOTS.map((i) => (
            <View key={i} style={[styles.otpBox, i === code.length && !loading && styles.otpBoxActive]}>
              <Text style={styles.otpDigit}>{code[i] ?? ''}</Text>
            </View>
          ))}
        </View>

        {/* Renvoyer */}
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 18 }} />
        ) : (
          <Text style={styles.resendRow}>
            Vous n&apos;avez pas reçu de code ?{' '}
            <Text style={styles.resendLink} onPress={resend}>
              Renvoyer
            </Text>
          </Text>
        )}

        {/* Clavier numérique */}
        <View style={styles.keypad}>
          {KEYS.map((k, i) => (
            <Pressable
              key={i}
              onPress={() => onKey(k)}
              disabled={k === ''}
              style={({ pressed }) => [styles.key, pressed && k !== '' && styles.keyPressed]}
            >
              {k === '⌫' ? (
                <Ionicons name="backspace-outline" size={28} color={NAVY} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 23, fontWeight: '600', color: '#9aa3b0', lineHeight: 31 },
  channel: { color: '#25b16a', fontWeight: '800' },
  phone: { color: NAVY, fontWeight: '800' },
  devHint: { fontSize: 14, color: PRIMARY, fontWeight: '700', marginTop: 14 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 30 },
  otpBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: '#f5f7fa',
    borderWidth: 1.5,
    borderColor: '#e2e6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: { borderColor: PRIMARY, backgroundColor: '#fff' },
  otpDigit: { fontSize: 26, fontWeight: '800', color: NAVY },
  resendRow: { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#6b7280' },
  resendLink: { color: ACCENT, fontWeight: '700' },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 'auto',
    paddingBottom: 8,
  },
  key: {
    width: '33.33%',
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { opacity: 0.4 },
  keyText: { fontSize: 28, fontWeight: '600', color: NAVY },
});
