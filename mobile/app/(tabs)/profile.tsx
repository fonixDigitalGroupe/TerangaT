import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
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
import { profileStore } from '../../src/auth/storage';
import { agentApi } from '../../src/api/endpoints';
import { apiErrorMessage } from '../../src/api/client';
import { colors, font, radius, spacing } from '../../src/theme';

type Tab = 'general' | 'numeros' | 'profil';

const bientot = () =>
  Alert.alert('Bientôt disponible', 'Cette fonctionnalité arrive prochainement.');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refresh } = useAuth();
  const agent = user?.agent;

  const [tab, setTab] = useState<Tab>('general');
  const [biometric, setBiometric] = useState(false);

  // KYC / boutique
  const [shopNumber, setShopNumber] = useState('');
  const [cniRecto, setCniRecto] = useState<string | null>(null);
  const [cniVerso, setCniVerso] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [shopModal, setShopModal] = useState(false);
  const [shopInput, setShopInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id == null) return;
    const id = user.id;
    profileStore.get(id, 'shop_number').then((v) => setShopNumber(v ?? ''));
    profileStore.get(id, 'cni_recto').then(setCniRecto);
    profileStore.get(id, 'cni_verso').then(setCniVerso);
    profileStore.get(id, 'selfie').then(setSelfie);
  }, [user?.id]);

  const pickDoc = async (field: string, setter: (u: string) => void) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Autorisation requise', 'Autorisez l’accès aux photos pour continuer.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]?.uri && user?.id != null) {
      const uri = result.assets[0].uri;
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

  const submitKyc = async () => {
    if (!cniRecto || !cniVerso || !selfie) {
      Alert.alert('Documents incomplets', 'Ajoutez la CNI recto, la CNI verso et le selfie avant d’envoyer.');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      if (shopNumber) form.append('shop_number', shopNumber);
      const appendImg = (field: string, uri: string) => {
        if (uri.startsWith('http')) return;
        const name = uri.split('/').pop() || `${field}.jpg`;
        form.append(field, { uri, name, type: 'image/jpeg' } as unknown as Blob);
      };
      appendImg('cni_recto', cniRecto);
      appendImg('cni_verso', cniVerso);
      appendImg('selfie', selfie);
      const res = await agentApi.uploadKyc(form);
      await refresh();
      Alert.alert('Envoyé ✓', res.message ?? 'Vos documents ont été envoyés pour vérification.');
    } catch (e) {
      Alert.alert('Erreur', apiErrorMessage(e, 'Envoi impossible.'));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: logout },
    ]);

  const invite = () =>
    Share.share({
      message: 'Rejoignez Téranga Transfert, l’application des agents de transfert d’argent au Sénégal.',
    });

  const kycStatus = (() => {
    const st = (agent?.status ?? '').toLowerCase();
    if (st.includes('vérif') || st.includes('verif')) return { label: 'Vérifié', color: colors.success, bg: colors.successBg };
    if (st.includes('rejet')) return { label: 'Rejeté', color: colors.danger, bg: colors.dangerBg };
    return { label: 'En attente', color: colors.orangeDark, bg: '#fdecd8' };
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={[styles.pageTitle, { marginTop: insets.top ? 0 : spacing.sm }]}>Paramètres</Text>

      <View style={styles.card}>
        {/* Onglets */}
        <View style={styles.tabs}>
          <TabBtn label="Général" active={tab === 'general'} onPress={() => setTab('general')} />
          <TabBtn label="Numéros" active={tab === 'numeros'} onPress={() => setTab('numeros')} />
          <TabBtn label="Profil" active={tab === 'profil'} onPress={() => setTab('profil')} />
        </View>

        <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
          {tab === 'general' && (
            <>
              <Row
                title="Authentification biométrique"
                subtitle="Protégez l'accès à votre application"
                right={
                  <Switch
                    value={biometric}
                    onValueChange={setBiometric}
                    trackColor={{ true: colors.blue, false: '#d3d8e0' }}
                    thumbColor="#fff"
                  />
                }
              />
              <Divider />
              <Row
                title="Contacter le service client"
                subtitle="Disponible du Lundi au Vendredi de 8h30 à 17h30"
                onPress={() => Linking.openURL('tel:+221338000000')}
              />
              <Divider />
              <Row
                title="Changer le code secret"
                subtitle="Modifier le code secret du compte."
                onPress={bientot}
              />
              <Divider />
              <Row
                title="Inviter un ami"
                subtitle="Partager le lien de l'application avec vos proches"
                onPress={invite}
              />
              <Divider />
              <Row
                title="Conditions générales d'utilisation"
                subtitle="Lire les conditions générales d'utilisation de l'application"
                onPress={bientot}
              />
              <Divider />
              <Row title="Se déconnecter" subtitle="Quitter l'application" danger onPress={confirmLogout} />
            </>
          )}

          {tab === 'numeros' && (
            <>
              <Row title="Numéro Wave" subtitle="Compte de débit par défaut" value={agent?.wave_number ?? 'Non renseigné'} />
              <Divider />
              <Row
                title="Numéro de la boutique"
                subtitle="Ligne fixe ou mobile de la boutique"
                value={shopNumber || 'Renseigner'}
                onPress={openShopModal}
              />
            </>
          )}

          {tab === 'profil' && (
            <>
              <Row title="Nom complet" value={user?.name ?? '—'} />
              <Divider />
              <Row title="Téléphone" value={`+221 ${user?.phone ?? ''}`} />
              <Divider />
              <Row title="Code agent" value={agent?.code ?? '—'} />
              <Divider />
              <Row title="Boutique" value={agent?.shop_name ?? '—'} />
              <Divider />

              <View style={styles.kycHead}>
                <Text style={styles.kycTitle}>Vérification d'identité</Text>
                <View style={[styles.badge, { backgroundColor: kycStatus.bg }]}>
                  <Text style={[styles.badgeText, { color: kycStatus.color }]}>{kycStatus.label}</Text>
                </View>
              </View>

              <DocRow label="CNI recto" uri={cniRecto} onPress={() => pickDoc('cni_recto', setCniRecto)} />
              <Divider />
              <DocRow label="CNI verso" uri={cniVerso} onPress={() => pickDoc('cni_verso', setCniVerso)} />
              <Divider />
              <DocRow label="Selfie avec CNI" uri={selfie} onPress={() => pickDoc('selfie', setSelfie)} />

              <Pressable
                onPress={submitKyc}
                disabled={submitting}
                style={({ pressed }) => [styles.submit, submitting && { opacity: 0.6 }, pressed && !submitting && { opacity: 0.9 }]}
              >
                <Ionicons name="cloud-upload-outline" size={18} color={colors.white} />
                <Text style={styles.submitText}>{submitting ? 'Envoi…' : 'Soumettre pour vérification'}</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>

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

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

function Row({
  title,
  subtitle,
  value,
  right,
  onPress,
  danger,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, danger && { color: colors.danger }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSub, danger && { color: colors.danger }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color="#c3c9d4" /> : null)}
    </Pressable>
  );
}

function DocRow({ label, uri, onPress }: { label: string; uri: string | null; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={[styles.rowTitle, { flex: 1 }]}>{label}</Text>
      {uri ? <Image source={{ uri }} style={styles.docThumb} /> : <Text style={styles.docAdd}>Ajouter</Text>}
      <Ionicons name="chevron-forward" size={20} color="#c3c9d4" />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef1f5' },
  pageTitle: { fontSize: font.xl, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabBtn: { paddingVertical: spacing.md, marginRight: spacing.lg, alignItems: 'center' },
  tabText: { fontSize: font.md, color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: colors.blue, fontWeight: '800' },
  tabUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2.5, borderRadius: 2, backgroundColor: colors.blue },
  tabContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 16 },
  rowTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: font.sm, color: colors.textMuted, marginTop: 3, lineHeight: 18 },
  rowValue: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600', maxWidth: '45%', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.border },
  kycHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.xs },
  kycTitle: { fontSize: font.xs, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  badgeText: { fontSize: font.xs, fontWeight: '700' },
  docThumb: { width: 44, height: 30, borderRadius: 6, backgroundColor: colors.grayLight },
  docAdd: { fontSize: font.sm, color: colors.blue, fontWeight: '700' },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.blue,
    borderRadius: 12,
    height: 50,
    marginTop: spacing.xl,
  },
  submitText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: spacing.lg },
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
  modalSave: { backgroundColor: colors.blue, borderRadius: 10, paddingHorizontal: spacing.lg, height: 44, justifyContent: 'center' },
  modalSaveText: { color: colors.white, fontSize: font.md, fontWeight: '700' },
});
