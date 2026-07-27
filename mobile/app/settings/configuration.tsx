import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing } from '../../src/theme';

export default function ConfigurationScreen() {
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [waveNumber, setWaveNumber] = useState('');
  const [shopNumber, setShopNumber] = useState('');

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
        {/* Section Sécurité */}
        <Text style={styles.sectionTitle}>Sécurité</Text>
        <View style={styles.formGroup}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Authentification biométrique</Text>
              <Text style={styles.subtext}>Utiliser Face ID / Touch ID pour vous connecter</Text>
            </View>
            <Switch 
              value={useBiometrics} 
              onValueChange={setUseBiometrics} 
              trackColor={{ false: '#e2e6ec', true: colors.orange }}
            />
          </View>
        </View>

        {/* Section Identité KYC */}
        <Text style={styles.sectionTitle}>Vérification d'identité (KYC)</Text>
        <View style={styles.formGroup}>
          <Text style={styles.infoText}>
            Soumettez vos documents pour valider votre compte marchand et déplafonner vos limites de transaction.
          </Text>
          
          <Pressable style={styles.uploadBtn}>
            <Ionicons name="card-outline" size={24} color={colors.blue} />
            <Text style={styles.uploadBtnText}>Téléverser CNI (Recto/Verso)</Text>
          </Pressable>

          <Pressable style={styles.uploadBtn}>
            <Ionicons name="camera-outline" size={24} color={colors.blue} />
            <Text style={styles.uploadBtnText}>Prendre un Selfie</Text>
          </Pressable>
        </View>

        {/* Section Numéros */}
        <Text style={styles.sectionTitle}>Numéros liés</Text>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Numéro Wave de la boutique</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>+221</Text>
            <TextInput
              style={[styles.input, { outlineStyle: 'none' } as object]}
              placeholder="Numéro Wave"
              keyboardType="phone-pad"
              maxLength={9}
              value={waveNumber}
              onChangeText={setWaveNumber}
            />
          </View>

          <Text style={styles.inputLabel}>Numéro marchand (Orange Money, etc.)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.prefix}>+221</Text>
            <TextInput
              style={[styles.input, { outlineStyle: 'none' } as object]}
              placeholder="Numéro marchand"
              keyboardType="phone-pad"
              maxLength={9}
              value={shopNumber}
              onChangeText={setShopNumber}
            />
          </View>

          <Pressable style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Mettre à jour les numéros</Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.xl, paddingBottom: spacing.xl * 2 },
  sectionTitle: { fontSize: font.lg, fontWeight: '800', color: '#1A3B5C', marginBottom: spacing.md, marginTop: spacing.lg },
  formGroup: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F5F7FA', padding: spacing.md, borderRadius: 12 },
  rowText: { flex: 1, paddingRight: spacing.md },
  label: { fontSize: font.md, fontWeight: '700', color: '#3A4D6B' },
  subtext: { fontSize: font.sm, color: colors.textMuted, marginTop: 4 },
  infoText: { fontSize: font.sm, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E8F5F3',
  },
  uploadBtnText: { marginLeft: spacing.sm, color: '#3A4D6B', fontWeight: '700', fontSize: font.md },
  inputLabel: { fontSize: font.md, fontWeight: '700', color: '#3A4D6B', marginBottom: spacing.sm, marginTop: spacing.md },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: spacing.md,
  },
  prefix: { fontSize: font.md, color: '#3A4D6B', fontWeight: '700', marginRight: 8 },
  input: { flex: 1, fontSize: font.md, color: '#3A4D6B' },
  saveBtn: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
});
