import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/auth/AuthContext';
import { avatarStorage, profileStore } from '../../src/auth/storage';
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

  // KYC / boutique
  const [shopNumber, setShopNumber] = useState('');
  const [cniRecto, setCniRecto] = useState<string | null>(null);
  const [cniVerso, setCniVerso] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [shopModal, setShopModal] = useState(false);
  const [shopInput, setShopInput] = useState('');

  const initials = (user?.first_name?.[0] ?? '') + (user?.last_name?.[0] ?? '');

  // Charge la photo + les champs enregistrés localement
  useEffect(() => {
    if (user?.id == null) return;
    const id = user.id;
    avatarStorage.get(id).then(setPhoto);
    profileStore.get(id, 'shop_number').then((v) => setShopNumber(v ?? ''));
    profileStore.get(id, 'cni_recto').then(setCniRecto);
    profileStore.get(id, 'cni_verso').then(setCniVerso);
    profileStore.get(id, 'selfie').then(setSelfie);
  }, [user?.id]);

  // Sélecteur d'image générique (retourne l'URI ou null)
  const pickImage = async (square: boolean): Promise<string | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Autorisation requise', 'Autorisez l’accès aux photos pour continuer.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: square ? [1, 1] : undefined,
      quality: 0.6,
    });
    return !result.canceled && result.assets[0]?.uri ? result.assets[0].uri : null;
  };

  const changePhoto = async () => {
    const uri = await pickImage(true);
    if (uri && user?.id != null) {
      setPhoto(uri);
      await avatarStorage.set(user.id, uri);
    }
  };

  // Ajout/mise à jour d'une pièce KYC
  const pickDoc = async (field: string, setter: (u: string) => void) => {
    const uri = await pickImage(false);
    if (uri && user?.id != null) {
      setter(uri);
      await profileStore.set(user.id, field, uri);
    }
  };

  const openShopModal = () => {
    setShopInput(shopNumber);
    setShopModal(true);
  };

  const saveShopNumber = async () => {
    const v = shopInput.trim();
    setShopNumber(v);
    setShopModal(false);
    if (user?.id != null) await profileStore.set(user.id, 'shop_number', v);
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

          {/* VÉRIFICATION (KYC) */}
          <Text style={styles.sectionTitle}>Vérification d'identité</Text>
          <View style={styles.card}>
            <ActionRow
              icon="business-outline"
              label="Numéro de la boutique"
              value={shopNumber || 'Renseigner'}
              onPress={openShopModal}
            />
            <Sep />
            <DocRow icon="card-outline" label="CNI recto" uri={cniRecto} onPress={() => pickDoc('cni_recto', setCniRecto)} />
            <Sep />
            <DocRow icon="card-outline" label="CNI verso" uri={cniVerso} onPress={() => pickDoc('cni_verso', setCniVerso)} />
            <Sep />
            <DocRow icon="camera-outline" label="Selfie avec CNI" uri={selfie} onPress={() => pickDoc('selfie', setSelfie)} />
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

      {/* Modal — numéro de la boutique */}
      <Modal visible={shopModal} transparent animationType="fade" onRequestClose={() => setShopModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Numéro de la boutique</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex : 33 800 00 00"
              placeholderTextColor="#9aa3b0"
              keyboardType="phone-pad"
              value={shopInput}
              onChangeText={setShopInput}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShopModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={saveShopNumber}>
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DocRow({
  icon,
  label,
  uri,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  uri: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#f5f7fa' }]}>
      <IconCircle name={icon} />
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {uri ? (
        <Image source={{ uri }} style={styles.docThumb} />
      ) : (
        <Text style={styles.docAdd}>Ajouter</Text>
      )}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
  docThumb: { width: 40, height: 28, borderRadius: 6, marginRight: 4, backgroundColor: colors.grayLight },
  docAdd: { fontSize: font.sm, color: colors.blue, fontWeight: '700', marginRight: 4 },
  // Modal boutique
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: { backgroundColor: colors.card, borderRadius: 16, padding: spacing.lg },
  modalTitle: { fontSize: font.md, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 50,
    fontSize: font.md,
    color: colors.text,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.lg },
  modalCancel: { paddingHorizontal: spacing.md, height: 44, justifyContent: 'center' },
  modalCancelText: { color: colors.textMuted, fontSize: font.md, fontWeight: '600' },
  modalSave: {
    backgroundColor: colors.blue,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    height: 44,
    justifyContent: 'center',
  },
  modalSaveText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
});
