import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing } from '../../src/theme';

export default function QrCodesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.qrWrapper}>
        <View style={styles.qrInner}>
          {/* Simulated QR Code using API */}
          <Image 
            source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=teranga-pay-merchant' }}
            style={styles.qrImage}
          />
          {/* Center logo overlay */}
          <View style={styles.qrCenterLogo}>
            <Text style={styles.logoText}>
              <Text style={styles.logoT}>Té</Text>ranga
            </Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.orderBtn}>
        <Text style={styles.orderBtnText}>Commander étiquette</Text>
        <Ionicons name="qr-code-outline" size={20} color={colors.blue} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: spacing.xl, alignItems: 'center' },
  qrWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E8F5F3', // Light tint for border
    padding: spacing.md,
    marginBottom: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: { width: '100%', height: '100%' },
  qrCenterLogo: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: { fontFamily: 'Quicksand_700Bold', fontSize: 14, color: colors.blue },
  logoT: { color: colors.orange },
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
