import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';
import { colors, spacing } from '../../src/theme';

const SLOTS = [0, 1, 2, 3];

export default function CodeScreen() {
  const { verifyOtp } = useAuth();
  const { phone, dev_code } = useLocalSearchParams<{ phone?: string; dev_code?: string }>();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Open the keypad on mount.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-submit once the 4 digits are entered.
  useEffect(() => {
    if (code.length === 4 && !loading) {
      void submit(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Entrez le code PIN</Text>

        {dev_code ? <Text style={styles.devHint}>🔧 Mode test — code : {dev_code}</Text> : null}
        {error && <Alert message={error} />}

        {/* PIN dots */}
        <Pressable style={styles.dotsRow} onPress={() => inputRef.current?.focus()}>
          {SLOTS.map((i) => (
            <View key={i} style={[styles.dot, i < code.length && styles.dotFilled]} />
          ))}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            caretHidden
            editable={!loading}
            style={[styles.hiddenInput, { outlineStyle: 'none' } as object]}
          />
        </Pressable>

        {loading ? (
          <ActivityIndicator color={colors.blue} style={styles.spinner} />
        ) : (
          <Pressable hitSlop={8}>
            <Text style={styles.forgot}>Code PIN oublié ?</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  title: { fontSize: 30, fontWeight: '800', color: '#1c1c1e', marginTop: spacing.xl + spacing.md },
  devHint: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginTop: 90,
  },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#e8eaf3' },
  dotFilled: { backgroundColor: colors.orange },
  hiddenInput: { ...StyleSheet.absoluteFillObject, opacity: 0, color: 'transparent' },
  forgot: { color: '#0a84ff', fontSize: 15, textAlign: 'center', marginTop: spacing.xl },
  spinner: { marginTop: spacing.xl },
});
