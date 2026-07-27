import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '../../src/theme';

export default function SettingsLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: font.lg },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={colors.orange} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="qr-codes" options={{ title: 'QR Codes' }} />
      <Stack.Screen name="commerce" options={{ title: 'Commerce' }} />
      <Stack.Screen name="change-pin" options={{ title: 'Code Secret' }} />
      <Stack.Screen name="configuration" options={{ title: 'Configuration' }} />
      <Stack.Screen name="support" options={{ title: 'Support' }} />
      <Stack.Screen name="terms" options={{ title: 'Termes & Conditions' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
