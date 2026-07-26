import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/auth/AuthContext';
import { avatarStorage } from '../../src/auth/storage';
import { colors, font, radius, spacing } from '../../src/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

const bientot = () =>
  Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive prochainement.');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const agent = user?.agent;
  const [pushOn, setPushOn] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);

  const initials = (user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '');

  // Charge la photo enregistrée localement
  useEffect(() => {
    if (user?.id != null) {
      avatarStorage.get(user.id).then(setPhoto);
    }
  }, [user?.id]);

  const changePhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Autorisation requise', 'Autorisez l’accès aux photos pour changer votre photo de profil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]?.uri && user?.id != null) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await avatarStorage.set(user.id, uri);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* En-tête de marque */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={styles.profileRow}>
            <Pressable onPress={changePhoto} style={styles.avatarWrap}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials.toUpperCase() || '👤'}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color={colors.blue} />
              </View>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name ?? 'Agent'}</Text>
              <Text style={styles.phone}>+221 {user?.phone}</Text>
            </View>
            {agent?.code ? (
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{agent.code}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* MON COMPTE */}
          <Text style={styles.sectionTitle}>Mon compte</Text>
          <View style={styles.card}>
            <InfoRow icon="storefront-outline" label="Boutique" value={agent?.shop_name ?? '—'} />
            <Sep />
            <InfoRow icon="phone-portrait-outline" label="Numéro Wave" value={agent?.wave_number ?? 'Non renseigné'} />
          </View>

          {/* PRÉFÉRENCES */}
          <Text style={styles.sectionTitle}>Préférences</Text>
          <View style={styles.card}>
            <ActionRow
              icon="notifications-outline"
              label="Notifications push"
              right={
                <Switch
                  value={pushOn}
                  onValueChange={setPushOn}
                  trackColor={{ true: colors.blue, false: '#c7cdd6' }}
                  thumbColor="#fff"
                />
              }
            />
            <Sep />
            <ActionRow icon="language-outline" label="Langue" value="Français" onPress={bientot} />
          </View>

          {/* SÉCURITÉ */}
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <View style={styles.card}>
            <ActionRow icon="lock-closed-outline" label="Changer le code secret" onPress={bientot} />
            <Sep />
            <ActionRow icon="shield-checkmark-outline" label="Confidentialité" onPress={bientot} />
          </View>

          {/* ASSISTANCE */}
          <Text style={styles.sectionTitle}>Assistance</Text>
          <View style={styles.card}>
            <ActionRow icon="help-circle-outline" label="Centre d'aide" onPress={bientot} />
            <Sep />
            <ActionRow
              icon="chatbubble-ellipses-outline"
              label="Nous contacter"
              onPress={() => Linking.openURL('tel:+221338000000')}
            />
            <Sep />
            <ActionRow icon="document-text-outline" label="Conditions d'utilisation" onPress={bientot} />
          </View>

          {/* DÉCONNEXION */}
          <Pressable
            onPress={confirmLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </Pressable>

          <Text style={styles.version}>Téranga Transfert · v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconCircle({ name }: { name: IoniconName }) {
  return (
    <View style={styles.iconCircle}>
      <Ionicons name={name} size={19} color={colors.blue} />
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: IoniconName; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <IconCircle name={icon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  value,
  right,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && { backgroundColor: '#f5f7fa' }]}
    >
      <IconCircle name={icon} />
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {value ? <Text style={styles.rowValueMuted}>{value}</Text> : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

function Sep() {
  return <View style={styles.sep} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.xl },
  header: {
    backgroundColor: colors.blue,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { color: colors.white, fontSize: font.xl, fontWeight: '800', marginBottom: spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarWrap: { width: 60, height: 60 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  avatarText: { color: colors.white, fontSize: font.lg, fontWeight: '800' },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  name: { color: colors.white, fontSize: font.lg, fontWeight: '800' },
  phone: { color: 'rgba(255,255,255,0.85)', fontSize: font.sm, marginTop: 2 },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  codeText: { color: colors.white, fontSize: font.xs, fontWeight: '700' },
  body: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  sectionTitle: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: font.md, color: colors.text, fontWeight: '500' },
  rowValue: { flex: 1, textAlign: 'right', fontSize: font.sm, color: colors.text, fontWeight: '600' },
  rowValueMuted: { fontSize: font.sm, color: colors.textMuted, marginRight: 4 },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 60 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: 14,
    height: 52,
    marginTop: spacing.xl,
  },
  logoutText: { color: colors.danger, fontSize: font.md, fontWeight: '700' },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: font.xs, marginTop: spacing.lg },
});
