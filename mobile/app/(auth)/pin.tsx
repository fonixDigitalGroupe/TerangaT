import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthContext';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors } from '../../src/theme';

const PRIMARY = '#0577DE';
const ACCENT = '#F88B1A';
const NAVY = '#1b3b5c';
const SLOTS = [0, 1, 2, 3];
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

/**
 * Connexion étape 2 : le numéro a déjà été reconnu par /phone/check,
 * on saisit le code secret à 4 chiffres pour ouvrir la session.
 */
export default function PinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const prettyPhone = (phone ?? '').replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');

  useEffect(() => {
    if (code.length !== 4 || loading) return;

    const submit = async () => {
      if (!phone) {
        setError('Numéro manquant, reprenez la connexion.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        await login(phone, code);
        // Connecté : le layout racine redirige vers l'app.
      } catch (e) {
        setError(apiErrorMessage(e, 'Code secret incorrect.'));
        setCode('');
        setLoading(false);
      }
    };

    void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const onKey = (k: string) => {
    if (loading) return;
    setError(null);
    if (k === '⌫') setCode((c) => c.slice(0, -1));
    else if (k !== '') setCode((c) => (c.length < 4 ? c + k : c));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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
        <Text style={styles.title}>Entrez votre code secret</Text>
        <Text style={styles.subtitle}>
          {prettyPhone ? `Connexion au +221 ${prettyPhone}` : 'Code à 4 chiffres de votre compte.'}
        </Text>

        {error && <Alert message={error} />}

        <View style={styles.otpRow}>
          {SLOTS.map((i) => (
            <View key={i} style={[styles.otpBox, i < code.length && styles.otpBoxFilled]}>
              {i < code.length ? <View style={styles.pinDot} /> : null}
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 18 }} />
        ) : (
          <View style={{ height: 36 }} />
        )}

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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 26 },
  title: { fontSize: 23, fontWeight: '700', color: NAVY },
  subtitle: { fontSize: 15, color: '#9aa3b0', marginTop: 8, lineHeight: 21 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 34 },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#f5f7fa',
    borderWidth: 1.5,
    borderColor: '#e2e6ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: { borderColor: PRIMARY, backgroundColor: '#fff' },
  pinDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: NAVY },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 'auto' },
  key: { width: '33.33%', height: 74, alignItems: 'center', justifyContent: 'center' },
  keyPressed: { opacity: 0.4 },
  keyText: { fontSize: 28, fontWeight: '600', color: NAVY },
});
