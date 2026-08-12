import { StyleSheet, Text, View, Pressable, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../src/auth/AuthContext';
import { API_BASE_URL } from '../../src/api/config';
import { colors, font, spacing } from '../../src/theme';

const WEB_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

export default function QrCodesScreen() {
  const { user } = useAuth();
  const code = user?.agent?.code ?? '';
  const payUrl = code ? `${WEB_BASE}/pay/${code}` : '';

  const onShare = () => {
    if (!payUrl) return;
    void Share.share({ message: `Payez ${user?.agent?.shop_name ?? 'mon commerce'} via Téranga : ${payUrl}` });
  };

  return (
    <View style={styles.container}>
      <View style={styles.qrWrapper}>
        <View style={styles.qrInner}>
          {payUrl ? (
            <QRCode value={payUrl} size={240} backgroundColor="#fff" color={'#1a2233'} />
          ) : (
            <Text style={styles.noCode}>Code marchand indisponible.</Text>
          )}
        </View>
      </View>

      {code ? <Text style={styles.code}>{code}</Text> : null}
      <Text style={styles.hint}>Le client scanne ce QR pour payer votre commerce.</Text>

      <Pressable style={styles.orderBtn} onPress={onShare}>
        <Text style={styles.orderBtnText}>Partager le lien</Text>
        <Ionicons name="share-outline" size={20} color={colors.blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.xl, alignItems: 'center' },
  qrWrapper: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E8F5F3',
    padding: spacing.xl,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrInner: { alignItems: 'center', justifyContent: 'center' },
  noCode: { color: colors.textMuted, fontSize: font.md, textAlign: 'center', width: 240 },
  code: { fontSize: 20, fontWeight: '800', color: '#1a2233', letterSpacing: 1 },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: spacing.xl, textAlign: 'center' },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  orderBtnText: { color: colors.blue, fontSize: font.md, fontWeight: '700', marginRight: spacing.sm },
});
