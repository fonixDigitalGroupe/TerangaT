import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { DismissKeyboard } from '../../src/components/DismissKeyboard';
import { colors, spacing } from '../../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);
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

  const onSubmit = async () => {
    setError(null);
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 9) {
      setError('Entrez un numéro valide (9 chiffres).');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendOtp(digits);
      router.push({ pathname: '/(auth)/code', params: { phone: digits, dev_code: res.dev_code ?? '' } });
    } catch (e) {
      setError(apiErrorMessage(e, 'Impossible d’envoyer le code.'));
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
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="arrow-back" size={26} color="#1c1c1e" />
        </Pressable>

        <DismissKeyboard>
        <View style={styles.content}>
          <Text style={styles.title}>Entrez votre numéro</Text>
          <Text style={styles.subtitle}>
            Ces informations sont utilisées pour vous connecter à votre compte.
          </Text>

          <View style={styles.spacer} />

          <View style={[styles.phoneField, focused && styles.inputWrapFocused]}>
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
              autoFocus
              value={phone}
              onChangeText={onPhoneChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.ctaText}>{loading ? 'Envoi…' : 'Continuer'}</Text>
          </Pressable>

          <View style={styles.spacerBottom} />
        </View>
        </DismissKeyboard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  back: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 30, fontWeight: '800', color: '#1c1c1e', marginTop: spacing.xl },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.sm,
    lineHeight: 21,
  },
  spacer: { flex: 1 },
  spacerBottom: { flex: 0.7 },
  phoneField: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.grayLight,
    overflow: 'hidden',
  },
  inputWrapFocused: { borderColor: '#f6b184', borderWidth: 1.5 },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  flag: { fontSize: 20, marginRight: 6 },
  code: { fontSize: 16, fontWeight: '500', color: colors.text },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  errorText: { color: colors.danger, fontSize: 13, marginTop: -6, marginBottom: spacing.sm },
  cta: {
    height: 54,
    borderRadius: 10,
    backgroundColor: '#7d7d7d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ctaText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
