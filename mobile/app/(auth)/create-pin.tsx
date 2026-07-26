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

export default function CreatePinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { phone, shop_name } = useLocalSearchParams<{ phone?: string; shop_name?: string }>();

  const [phase, setPhase] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finish = async (finalCode: string) => {
    if (!phone) {
      setError('Numéro manquant, reprenez l’inscription.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        phone,
        country: 'Sénégal',
        shop_name: shop_name || undefined,
        password: finalCode,
        password_confirmation: finalCode,
      });
      // Connecté automatiquement -> le layout redirige vers l'app
    } catch (e) {
      setError(apiErrorMessage(e, 'Création du compte impossible.'));
      setPhase('create');
      setPin('');
      setCode('');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code.length !== 4) return;
    if (phase === 'create') {
      setPin(code);
      setCode('');
      setPhase('confirm');
    } else {
      if (code === pin) {
        void finish(code);
      } else {
        setError('Les deux codes ne correspondent pas.');
        setPin('');
        setCode('');
        setPhase('create');
      }
    }
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
        <Pressable
          onPress={() => (phase === 'confirm' ? (setPhase('create'), setCode(''), setPin('')) : router.back())}
          hitSlop={10}
          style={styles.backCircle}
        >
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
          {phase === 'create' ? 'Définissez votre code secret' : 'Confirmez votre code secret'}
        </Text>
        <Text style={styles.subtitle}>Ce code à 4 chiffres vous servira à vous connecter.</Text>

        {error && <Alert message={error} />}

        <View style={styles.otpRow}>
          {SLOTS.map((i) => (
            <View key={i} style={[styles.otpBox, i < code.length && styles.otpBoxFilled]}>
              {i < code.length ? <View style={styles.pinDot} /> : null}
            </View>
          ))}
        </View>

        {loading ? <ActivityIndicator color={PRIMARY} style={{ marginTop: 18 }} /> : <View style={{ height: 36 }} />}

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

        <Text style={styles.cgu}>
          En créant votre compte, vous acceptez les conditions générales d&apos;utilisation.
        </Text>
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
  cgu: { textAlign: 'center', fontSize: 12, color: '#9aa3b0', paddingBottom: 10, paddingTop: 6, lineHeight: 17 },
});
