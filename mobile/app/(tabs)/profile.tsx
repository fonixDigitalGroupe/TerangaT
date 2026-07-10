import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { Button, Card } from '../../src/components/ui';
import { colors, font, radius, spacing } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const agent = user?.agent;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '')}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
        </View>

        <Card style={styles.card}>
          <Row label="Boutique" value={agent?.shop_name ?? '—'} />
          <Divider />
          <Row label="Pays" value={user?.country ?? '—'} />
          <Divider />
          <Row label="NINEA" value={agent?.ninea ?? 'Non renseigné'} />
          <Divider />
          <Row label="Numéro Wave" value={agent?.wave_number ?? 'Non renseigné'} />
          <Divider />
          <Row label="Numéro Orange Money" value={agent?.om_number ?? 'Non renseigné'} />
        </Card>

        <View style={{ marginTop: spacing.lg }}>
          <Button title="Se déconnecter" variant="outline" onPress={logout} />
        </View>

        <Text style={styles.version}>Téranga Trans · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.lg },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.blue, fontSize: font.xl, fontWeight: '800' },
  name: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  phone: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  card: { padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowLabel: { color: colors.textMuted, fontSize: font.sm },
  rowValue: { color: colors.text, fontSize: font.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: font.xs, marginTop: spacing.xl },
});
