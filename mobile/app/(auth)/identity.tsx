import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { Alert as UiAlert } from '../../src/components/ui';

const PRIMARY = '#1E90FF';
const LABEL = '#26415e';

const REGIONS = [
  'Dakar',
  'Diourbel',
  'Fatick',
  'Kaffrine',
  'Kaolack',
  'Kédougou',
  'Kolda',
  'Louga',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Tambacounda',
  'Thiès',
  'Ziguinchor',
];

export default function IdentityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, shop_name } = useLocalSearchParams<{ phone?: string; shop_name?: string }>();

  const [fullName, setFullName] = useState('');
  const [region, setRegion] = useState('');
  const [regionOpen, setRegionOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    setError(null);
    if (!fullName.trim()) return setError('Entrez votre nom complet.');
    if (!region) return setError('Sélectionnez votre région.');

    router.push({
      pathname: '/(auth)/create-pin',
      params: {
        phone: phone ?? '',
        shop_name: shop_name ?? '',
        full_name: fullName.trim(),
        region,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirmer votre identité</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View>
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

              <Text style={[styles.label, { marginTop: 18 }]}>Région</Text>
              <Pressable style={styles.field} onPress={() => { Keyboard.dismiss(); setRegionOpen(true); }}>
                <View style={styles.selectRow}>
                  <Text style={[styles.selectText, !region && styles.selectPlaceholder]}>
                    {region || 'Sélectionnez votre région'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#9aa3b0" />
                </View>
              </Pressable>

              <Pressable onPress={onContinue} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
                <Text style={styles.ctaText}>Continuer</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sélecteur de région */}
      <Modal visible={regionOpen} transparent animationType="slide" onRequestClose={() => setRegionOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setRegionOpen(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choisir une région</Text>
            <ScrollView>
              {REGIONS.map((r) => (
                <Pressable
                  key={r}
                  style={styles.regionRow}
                  onPress={() => { setRegion(r); setRegionOpen(false); setError(null); }}
                >
                  <Text style={[styles.regionText, region === r && styles.regionTextActive]}>{r}</Text>
                  {region === r && <Ionicons name="checkmark" size={20} color={PRIMARY} />}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  hint: { fontSize: 14, color: '#9aa3b0', marginBottom: 22, lineHeight: 20 },
  label: { fontSize: 15, fontWeight: '600', color: LABEL, marginBottom: 9 },
  field: { height: 50, borderWidth: 1, borderColor: '#e2e6ec', borderRadius: 12, justifyContent: 'center' },
  input: { fontSize: 16, color: '#1a1a1a', paddingHorizontal: 16 },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  selectText: { fontSize: 16, color: '#1a1a1a' },
  selectPlaceholder: { color: '#9aa3b0' },
  cta: { backgroundColor: PRIMARY, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '70%',
  },
  sheetHandle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#dfe3ea', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1a2233', marginBottom: 6 },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eef1f5',
  },
  regionText: { fontSize: 16, color: '#1a2233' },
  regionTextActive: { color: PRIMARY, fontWeight: '700' },
});
