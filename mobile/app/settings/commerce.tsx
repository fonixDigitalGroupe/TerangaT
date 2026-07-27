import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthContext';
import { colors, font, spacing } from '../../src/theme';

export default function CommerceScreen() {
  const { user } = useAuth();
  
  const shopName = user?.agent?.shop_name || 'Boutique Téranga';
  const managerName = user?.name || 'Fonix Digital';
  const phone = user?.phone || '77 000 00 00';
  const address = 'Dakar, Sénégal'; // Mock

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} bounces={true}>
      
      {/* En-tête Avatar - Plus sérieux et premium */}
      <View style={styles.headerSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="storefront" size={40} color={colors.blue} />
          <Pressable style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color={colors.white} />
          </Pressable>
        </View>
        <Text style={styles.shopTitle}>{shopName}</Text>
        <Text style={styles.shopSubtitle}>Compte Marchand</Text>
      </View>

      {/* Bloc d'informations - Style iOS/Natif */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>INFORMATIONS PROFESSIONNELLES</Text>
        <View style={styles.infoCard}>
          
          <View style={styles.infoRow}>
            <Text style={styles.rowLabel}>Nom du commerce</Text>
            <Text style={styles.rowValue}>{shopName}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.rowLabel}>Nom du gérant</Text>
            <Text style={styles.rowValue}>{managerName}</Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.rowLabel}>Numéro business</Text>
            <View style={styles.phoneContainer}>
              <Text style={styles.flag}>🇸🇳</Text>
              <Text style={styles.rowValue}>+221 {phone}</Text>
            </View>
          </View>
          <View style={styles.separator} />

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Adresse</Text>
            <Text style={styles.rowValue}>{address}</Text>
          </View>

        </View>
      </View>
      
      <Text style={styles.footerNote}>
        Pour modifier ces informations, veuillez contacter le support client.
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.white, padding: spacing.lg },
  
  headerSection: { 
    alignItems: 'center', 
    marginTop: spacing.xl, 
    marginBottom: spacing.xl * 1.5 
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: spacing.md,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F4F5F7',
  },
  shopTitle: { fontSize: 24, fontWeight: '800', color: '#1A3B5C', marginBottom: 4 },
  shopSubtitle: { fontSize: font.sm, color: colors.textMuted, fontWeight: '500' },
  
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A99AC',
    marginLeft: spacing.md,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
  },
  rowLabel: {
    fontSize: font.md,
    color: '#1A3B5C',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: font.md,
    color: '#8A99AC',
    fontWeight: '400',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#Eef1f6',
    marginLeft: spacing.md,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 13,
    color: '#8A99AC',
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },
});
