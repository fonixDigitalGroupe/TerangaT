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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Alert as UiAlert } from '../../src/components/ui';

const PRIMARY = '#0577DE';
const ACCENT = '#F88B1A';
const LABEL = '#26415e';

export default function IdentityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, shop_name } = useLocalSearchParams<{ phone?: string; shop_name?: string }>();

  const [fullName, setFullName] = useState('');
  const [cniNumber, setCniNumber] = useState('');
  const [cniRecto, setCniRecto] = useState<string | null>(null);
  const [cniVerso, setCniVerso] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickDoc = async (setter: (u: string) => void) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Autorisez l’accès aux photos pour ajouter vos pièces.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
    });
    if (!res.canceled && res.assets[0]?.uri) setter(res.assets[0].uri);
  };

  const onContinue = () => {
    setError(null);
    if (!fullName.trim()) return setError('Entrez votre nom complet.');
    if (!cniNumber.trim()) return setError('Entrez votre numéro de CNI.');
    if (!cniRecto || !cniVerso || !selfie) return setError('Ajoutez la CNI recto, verso et le selfie.');

    router.push({
      pathname: '/(auth)/create-pin',
      params: {
        phone: phone ?? '',
        shop_name: shop_name ?? '',
        full_name: fullName.trim(),
        cni_number: cniNumber.trim(),
        cni_recto: cniRecto,
        cni_verso: cniVerso,
        selfie,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backCircle}>
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
              <Text style={styles.bigTitle}>Vérifions votre identité</Text>
              <Text style={styles.hint}>Ces informations permettent de valider votre compte agent.</Text>

              {error && <UiAlert message={error} />}

              <Text style={styles.label}>Nom complet</Text>
              <View style={styles.field}>
                <TextInput
                  style={[styles.input, { outlineStyle: 'none' } as object]}
                  placeholder="Prénom et nom"
                  placeholderTextColor="#9aa3b0"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={[styles.label, { marginTop: 18 }]}>Numéro de la CNI</Text>
              <View style={styles.field}>
                <TextInput
                  style={[styles.input, { outlineStyle: 'none' } as object]}
                  placeholder="Ex : 1 234 1990 00123"
                  placeholderTextColor="#9aa3b0"
                  keyboardType="number-pad"
                  value={cniNumber}
                  onChangeText={setCniNumber}
                />
              </View>

              <Text style={[styles.label, { marginTop: 18 }]}>Vos pièces</Text>
              <DocRow label="CNI recto" uri={cniRecto} onPress={() => pickDoc(setCniRecto)} />
              <DocRow label="CNI verso" uri={cniVerso} onPress={() => pickDoc(setCniVerso)} />
              <DocRow label="Selfie avec CNI" uri={selfie} onPress={() => pickDoc(setSelfie)} />

              <Pressable onPress={onContinue} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
                <Text style={styles.ctaText}>Continuer</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DocRow({ label, uri, onPress }: { label: string; uri: string | null; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.docRow}>
      <View style={styles.docIcon}>
        <Ionicons name={uri ? 'checkmark-circle' : 'camera-outline'} size={22} color={uri ? '#25b16a' : PRIMARY} />
      </View>
      <Text style={styles.docLabel}>{label}</Text>
      {uri ? <Image source={{ uri }} style={styles.docThumb} /> : <Text style={styles.docAdd}>Ajouter</Text>}
      <Ionicons name="chevron-forward" size={18} color="#c3c9d4" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#f6f8fb' },
  backCircle: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#fdecd8', alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, padding: 22, paddingTop: 24 },
  bigTitle: { fontSize: 21, fontWeight: '700', color: '#1b3b5c', marginBottom: 6 },
  hint: { fontSize: 14, color: '#9aa3b0', marginBottom: 22, lineHeight: 20 },
  label: { fontSize: 15, fontWeight: '600', color: LABEL, marginBottom: 9 },
  field: { height: 50, borderWidth: 1, borderColor: '#e2e6ec', borderRadius: 12, justifyContent: 'center' },
  input: { fontSize: 16, color: '#1a1a1a', paddingHorizontal: 16 },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f5',
  },
  docIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#eef3f8', alignItems: 'center', justifyContent: 'center' },
  docLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a2233' },
  docThumb: { width: 44, height: 30, borderRadius: 6, backgroundColor: '#f5f7fa' },
  docAdd: { fontSize: 14, color: PRIMARY, fontWeight: '700' },
  cta: { backgroundColor: PRIMARY, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
