import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthContext';
import { apiErrorMessage } from '../../src/api/client';
import { Alert } from '../../src/components/ui';

const PRIMARY = '#1A84D8';
const NAVY = '#1a2233';
const LABEL = '#26415e';

export default function CreatePinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { phone, shop_name, full_name, region } = useLocalSearchParams<{
    phone?: string;
    shop_name?: string;
    full_name?: string;
    region?: string;
  }>();

  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (pin.length !== 4) return setError('Le code secret doit contenir 4 chiffres.');
    if (confirm !== pin) return setError('Les deux codes ne correspondent pas.');
    if (!accepted) return setError('Veuillez accepter les conditions générales d’utilisation.');
    if (!phone) return setError('Numéro manquant, reprenez l’inscription.');

    Keyboard.dismiss();
    setLoading(true);
    try {
      await register({
        first_name: full_name || undefined,
        phone,
        country: 'Sénégal',
        region: region || undefined,
        shop_name: shop_name || undefined,
        password: pin,
        password_confirmation: pin,
      });
      // Connecté automatiquement -> le layout redirige vers l'app
    } catch (e) {
      setError(apiErrorMessage(e, 'Création du compte impossible.'));
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Code secret</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              <Text style={styles.title}>Définissez votre code secret</Text>
              <Text style={styles.intro}>
                Ce code à 4 chiffres sécurise votre compte et vous servira à vous connecter à chaque fois.
              </Text>

              {error && <Alert message={error} />}

              <Text style={styles.label}>Code secret * (4 chiffres)</Text>
              <View style={styles.field}>
                <TextInput
                  style={[styles.input, { outlineStyle: 'none' } as object]}
                  placeholder="••••"
                  placeholderTextColor="#c3c9d4"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry={!showPin}
                  value={pin}
                  onChangeText={(t) => { setError(null); setPin(t.replace(/\D/g, '')); }}
                />
                <Pressable onPress={() => setShowPin((s) => !s)} hitSlop={8} style={styles.eye}>
                  <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8a93a3" />
                </Pressable>
              </View>

              <Text style={[styles.label, { marginTop: 20 }]}>Confirmer le nouveau code secret *</Text>
              <View style={styles.field}>
                <TextInput
                  style={[styles.input, { outlineStyle: 'none' } as object]}
                  placeholder="••••"
                  placeholderTextColor="#c3c9d4"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry={!showConfirm}
                  value={confirm}
                  onChangeText={(t) => { setError(null); setConfirm(t.replace(/\D/g, '')); }}
                />
                <Pressable onPress={() => setShowConfirm((s) => !s)} hitSlop={8} style={styles.eye}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8a93a3" />
                </Pressable>
              </View>

              {/* Case CGU */}
              <Pressable style={styles.cguRow} onPress={() => setAccepted((a) => !a)}>
                <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
                  {accepted && <Ionicons name="checkmark" size={15} color="#fff" />}
                </View>
                <Text style={styles.cguText}>
                  J&apos;ai lu et j&apos;accepte les <Text style={styles.cguLink}>conditions générales d&apos;utilisations (Voir CGU)</Text> notamment la mention relative à la protection des données personnelles.
                </Text>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={loading}
                style={({ pressed }) => [styles.cta, loading && styles.ctaDisabled, pressed && { opacity: 0.9 }]}
              >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaText}>Créer mon compte</Text>}
              </Pressable>
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
  title: { fontSize: 21, fontWeight: '700', color: '#1b3b5c', marginBottom: 8 },
  intro: { fontSize: 14, color: '#8a93a3', lineHeight: 21, marginBottom: 22 },
  label: { fontSize: 15, fontWeight: '600', color: LABEL, marginBottom: 9 },
  field: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e6ec',
    borderRadius: 10,
  },
  input: { flex: 1, fontSize: 16, color: '#1a1a1a', paddingHorizontal: 16, letterSpacing: 4 },
  eye: { paddingHorizontal: 14 },
  cguRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#c3c9d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  cguText: { flex: 1, fontSize: 13.5, color: '#6b7280', lineHeight: 20 },
  cguLink: { color: PRIMARY, fontWeight: '600' },
  cta: { backgroundColor: PRIMARY, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  ctaDisabled: { backgroundColor: '#9cc4ea' },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
