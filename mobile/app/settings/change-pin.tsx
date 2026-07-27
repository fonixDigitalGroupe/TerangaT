import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, font, spacing } from '../../src/theme';
import { Alert } from '../../src/components/ui';

export default function ChangePinScreen() {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    setSuccess(false);

    if (oldPin.length < 4 || newPin.length < 4 || confirmPin.length < 4) {
      setError('Les codes doivent contenir au moins 4 chiffres.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Les nouveaux codes ne correspondent pas.');
      return;
    }

    setLoading(true);
    // Simuler un appel API
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {error && <Alert message={error} />}
        {success && <Alert message="Votre code secret a été mis à jour avec succès." tone="success" />}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ancien code secret</Text>
          <TextInput
            style={[styles.input, { outlineStyle: 'none' } as object]}
            placeholder="••••"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            value={oldPin}
            onChangeText={setOldPin}
          />

          <Text style={styles.label}>Nouveau code secret</Text>
          <TextInput
            style={[styles.input, { outlineStyle: 'none' } as object]}
            placeholder="••••"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            value={newPin}
            onChangeText={setNewPin}
          />

          <Text style={styles.label}>Confirmer le nouveau code</Text>
          <TextInput
            style={[styles.input, { outlineStyle: 'none' } as object]}
            placeholder="••••"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            value={confirmPin}
            onChangeText={setConfirmPin}
          />

          </View>

        <Pressable 
            style={({ pressed }) => [
              styles.btn, 
              loading && styles.btnDisabled,
              pressed && !loading && { opacity: 0.9 }
            ]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Traitement...' : 'Enregistrer'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.xl },
  formGroup: { marginBottom: spacing.md, marginTop: spacing.md },
  label: { fontSize: font.md, fontWeight: '700', color: '#3A4D6B', marginBottom: spacing.sm, marginTop: spacing.lg },
  input: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: font.md,
    color: '#3A4D6B',
    letterSpacing: 2,
  },
  btn: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  btnDisabled: {
    backgroundColor: '#8b8b8b',
  },
  btnText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
});
